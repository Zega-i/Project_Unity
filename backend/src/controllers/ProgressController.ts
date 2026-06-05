import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { NotificationsController } from "./NotificationsController";
import { EarlyWarningService } from "../services/EarlyWarningService";
import { logger } from "../utils/logger";

export class ProgressController {
  static async getMyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).user.id;
      
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { email: true, name: true }
      });
      logger.info(`[getMyProgress] Fetching progress for student: ${student?.name} (${student?.email}) [ID: ${studentId}]`);

      const enrollments = await prisma.classStudent.findMany({
        where: { 
          studentId,
          class: { archived: false }
        },
        include: {
          class: {
            include: {
              materials: true
            }
          }
        }
      });
      logger.info(`[getMyProgress] Active enrollments found: ${enrollments.length}`);
      
      const classIds = enrollments.map(e => e.classId);

      const totalMaterials = await prisma.material.count({
        where: { classId: { in: classIds } }
      });

      const viewedMaterials = await prisma.materialView.count({
        where: { 
          studentId,
          material: { class: { archived: false } }
        }
      });

      const overallProgress = totalMaterials > 0 ? (viewedMaterials / totalMaterials) * 100 : 0;

      // 1. Kuis Selesai
      const completedQuizzes = await prisma.quizSession.count({
        where: {
          studentId,
          status: "COMPLETED"
        }
      });

      // 2. Skor Rata-rata
      const quizSessions = await prisma.quizSession.findMany({
        where: {
          studentId,
          status: "COMPLETED",
          score: { not: null }
        },
        select: { score: true }
      });
      let averageScore = 0;
      if (quizSessions.length > 0) {
        const totalScore = quizSessions.reduce((sum, s) => sum + (s.score || 0), 0);
        averageScore = Math.round(totalScore / quizSessions.length);
      }

      // 3. Aktivitas 7 Hari
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const viewsThisWeek = await prisma.materialView.findMany({
        where: {
          studentId,
          viewedAt: { gte: startOfWeek }
        },
        select: { viewedAt: true }
      });

      const quizzesThisWeek = await prisma.quizSession.findMany({
        where: {
          studentId,
          status: "COMPLETED",
          endedAt: { gte: startOfWeek }
        },
        select: { endedAt: true }
      });

      const weeklyActivities = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
      viewsThisWeek.forEach(v => {
        const d = new Date(v.viewedAt);
        let dayIndex = d.getDay() - 1; // 0 = Mon, 6 = Sun
        if (dayIndex < 0) dayIndex = 6;
        if (dayIndex >= 0 && dayIndex < 7) {
          weeklyActivities[dayIndex]++;
        }
      });
      quizzesThisWeek.forEach(q => {
        if (q.endedAt) {
          const d = new Date(q.endedAt);
          let dayIndex = d.getDay() - 1;
          if (dayIndex < 0) dayIndex = 6;
          if (dayIndex >= 0 && dayIndex < 7) {
            weeklyActivities[dayIndex]++;
          }
        }
      });

      // 4. Progress per Mata Pelajaran
      const subjectProgress: any[] = [];
      const colorsList = ['#6366F1', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
      
      for (let i = 0; i < enrollments.length; i++) {
        const cls = enrollments[i].class;
        const totalClassMaterials = cls.materials.length;
        
        const viewedClassMaterials = await prisma.materialView.count({
          where: {
            studentId,
            material: { classId: cls.id }
          }
        });

        const totalClassQuizzes = await prisma.quiz.count({
          where: { classId: cls.id }
        });

        const completedClassQuizzes = await prisma.quizSession.count({
          where: {
            studentId,
            classId: cls.id,
            status: "COMPLETED"
          }
        });

        const totalItems = totalClassMaterials + totalClassQuizzes;
        const completedItems = viewedClassMaterials + completedClassQuizzes;
        const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        subjectProgress.push({
          id: cls.id,
          name: cls.subject || cls.name,
          className: cls.name,
          progress: progressPct,
          color: colorsList[i % colorsList.length],
          count: `${completedItems}/${totalItems}`
        });
      }
      
      logger.info(`[getMyProgress] Stats computed successfully: overallProgress: ${overallProgress}%, materials: ${viewedMaterials}/${totalMaterials}, quizzes completed: ${completedQuizzes}, avgScore: ${averageScore}%`);
      logger.info(`[getMyProgress] weeklyActivities: ${JSON.stringify(weeklyActivities)}`);
      logger.info(`[getMyProgress] subjectProgress: ${JSON.stringify(subjectProgress)}`);

      res.json({
        success: true,
        data: {
          overallProgress: Math.round(overallProgress),
          totalMaterials,
          viewedMaterials,
          completedQuizzes,
          averageScore,
          weeklyActivities,
          subjectProgress
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsCompleted(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.body;
      const studentId = (req as any).user.id;

      const material = await prisma.material.findUnique({
        where: { id: materialId },
        include: { class: { select: { archived: true } } }
      });

      if (!material) {
        res.status(404).json({ success: false, error: 'Materi tidak ditemukan' });
        return;
      }

      if (material.class.archived) {
        res.status(400).json({ success: false, error: 'Kelas sudah selesai, tidak dapat menandai materi sebagai selesai' });
        return;
      }

      const view = await prisma.materialView.upsert({
        where: {
          materialId_studentId: { materialId, studentId }
        },
        update: { viewedAt: new Date() },
        create: {
          materialId,
          studentId,
          timeSpent: 300
        }
      });

      res.json({ success: true, data: view });
    } catch (error) {
      next(error);
    }
  }

  static async getCompletedMaterials(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).user.id;
      const views = await prisma.materialView.findMany({
        where: { studentId },
        select: { materialId: true }
      });
      res.json({ success: true, data: views.map(v => v.materialId) });
    } catch (error) {
      next(error);
    }
  }

  static async submitQuizResult(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).user.id;
      const { classId, quizId, score, totalQuestions, correctAnswers } = req.body;

      if (!classId || score === undefined || !totalQuestions) {
        res.status(400).json({ success: false, error: 'classId, score, dan totalQuestions wajib diisi' });
        return;
      }

      // Fetch class details to get teacherId and class name
      const cls = await prisma.class.findUnique({
        where: { id: classId },
        select: { teacherId: true, name: true }
      });

      // Fetch student details
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { name: true }
      });

      const session = await prisma.quizSession.create({
        data: {
          studentId,
          classId,
          quizId: quizId || null,
          score: Number(score),
          totalQuestions: Number(totalQuestions),
          correctAnswers: Number(correctAnswers ?? 0),
          status: 'COMPLETED',
          endedAt: new Date(),
        }
      });

      // Trigger early warning risk assessment asynchronously if teacher exists
      if (cls && cls.teacherId) {
        EarlyWarningService.analyzeStudentRisk(studentId, classId).catch(err => 
          logger.error('Error analyzing student risk on quiz submission:', err)
        );
      }

      res.json({ success: true, data: { sessionId: session.id, score: session.score } });
    } catch (error) {
      next(error);
    }
  }

  static async getQuizResults(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = (req as any).user.id;
      const { classId } = req.params;

      // Verify the teacher owns this class
      const cls = await prisma.class.findFirst({ where: { id: classId, teacherId } });
      if (!cls) {
        res.status(403).json({ success: false, error: 'Akses ditolak' });
        return;
      }

      const results = await prisma.quizSession.findMany({
        where: { classId, status: 'COMPLETED' },
        include: { student: { select: { id: true, name: true, grade: true } } },
        orderBy: { endedAt: 'desc' },
      });

      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}
