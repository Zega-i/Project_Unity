import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export class ProgressController {
  static async getMyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).user.id;

      const enrollments = await prisma.classStudent.findMany({
        where: { studentId },
        select: { classId: true }
      });
      const classIds = enrollments.map(e => e.classId);

      const totalMaterials = await prisma.material.count({
        where: { classId: { in: classIds } }
      });

      const viewedMaterials = await prisma.materialView.count({
        where: { studentId }
      });

      const progress = totalMaterials > 0 ? (viewedMaterials / totalMaterials) * 100 : 0;

      res.json({
        success: true,
        data: {
          overallProgress: Math.round(progress),
          totalMaterials,
          viewedMaterials
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
