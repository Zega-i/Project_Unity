import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../types";
import { logger } from "../utils/logger";
import { PDFExtractor } from "../utils/pdfExtractor";

export class TeacherController {
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const activeClasses = await prisma.class.count({ where: { teacherId } });
      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: { _count: { select: { students: true } } }
      });
      const totalStudents = classes.reduce((acc, curr) => acc + curr._count.students, 0);

      res.json({
        success: true,
        data: {
          summary: {
            activeClasses,
            totalStudents,
            avgScore: 0,
            completedTasks: 0,
            activeRate: 0
          },
          chart: [],
          atRisk: []
        }
      });
    } catch (error) {
      logger.error('Error getting teacher stats', error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }

  static async createClass(req: AuthRequest, res: Response) {
    try {
      const { name, level, schedule, description, token } = req.body;
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const newClass = await prisma.class.create({
        data: {
          name,
          grade: parseInt(level) || 10,
          code: token,
          description: description || "",
          teacherId
        }
      });

      res.status(201).json({ success: true, data: newClass, message: "Kelas berhasil dibuat" });
    } catch (error) {
      logger.error('Error creating class', error);
      res.status(500).json({ success: false, error: "Gagal membuat kelas" });
    }
  }

  static async addMaterial(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, description, fileUrl, type } = req.body;
      const teacherId = req.userId;
      if (!teacherId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const material = await prisma.material.create({
        data: {
          classId,
          title,
          description: description || "",
          content: description || "",
          url: fileUrl,
          type: type || 'PDF',
          aiGenerated: false
        }
      });

      res.status(201).json({ success: true, data: material });
    } catch (error) {
      logger.error('Error adding material', error);
      res.status(500).json({ success: false, error: "Gagal menambahkan materi" });
    }
  }

  static async addAssignment(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, description, deadline, points } = req.body;
      
      const assignment = await prisma.assignment.create({
        data: {
          classId,
          title,
          description,
          deadline: new Date(deadline),
          points: parseInt(points) || 100
        }
      });

      res.status(201).json({ success: true, data: assignment, message: "Tugas berhasil dipublikasikan" });
    } catch (error) {
      logger.error('Error adding assignment', error);
      res.status(500).json({ success: false, error: "Gagal mempublikasikan tugas" });
    }
  }

  static async getClassMaterials(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const materials = await prisma.material.findMany({ where: { classId } });
      res.json({ success: true, data: materials });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil materi" });
    }
  }

  static async getClassStudents(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const classStudents = await prisma.classStudent.findMany({
        where: { classId },
        include: { student: { select: { id: true, name: true, email: true } } }
      });
      res.json({ success: true, data: classStudents.map(cs => cs.student) });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil daftar siswa" });
    }
  }

  static async getClassAssignments(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const assignments = await prisma.assignment.findMany({ where: { classId } });
      res.json({ success: true, data: assignments });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil tugas" });
    }
  }

  static async getClassQuizzes(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const quizzes = await prisma.quiz.findMany({ where: { classId } });
      res.json({ success: true, data: quizzes });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil kuis" });
    }
  }

  static async addQuiz(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, duration, questions } = req.body;

      const quiz = await prisma.quiz.create({
        data: {
          classId,
          title,
          timeLimit: parseInt(duration) || 15,
          questionsCount: questions.length,
          questions: {
            create: questions.map((q: any) => ({
              text: q.text,
              type: "MULTIPLE_CHOICE",
              options: JSON.stringify(q.options),
              correctAnswer: q.options[q.correctAnswer],
              explanation: "AI Generated"
            }))
          }
        }
      });

      res.status(201).json({ success: true, data: quiz, message: "Kuis berhasil dibuat" });
    } catch (error) {
      logger.error('Error adding quiz', error);
      res.status(500).json({ success: false, error: "Gagal membuat kuis" });
    }
  }

  static async getAllStudents(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;
      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: { 
          students: { 
            include: { student: { select: { id: true, name: true, email: true } } } 
          } 
        }
      });

      const allStudentsMap = new Map();
      classes.forEach(c => {
        c.students.forEach(cs => {
          allStudentsMap.set(cs.student.id, {
            ...cs.student,
            kelas: c.name,
            avg: 0, // No real data yet
            status: 'Active'
          });
        });
      });

      res.json({ success: true, data: Array.from(allStudentsMap.values()) });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil daftar semua siswa" });
    }
  }

  static async updateMaterial(req: AuthRequest, res: Response) {
    try {
      const { materialId } = req.params;
      const { title, description } = req.body;
      const material = await prisma.material.update({
        where: { id: materialId },
        data: { title, description, content: description }
      });
      res.json({ success: true, data: material });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal memperbarui materi" });
    }
  }

  static async deleteMaterial(req: AuthRequest, res: Response) {
    try {
      const { materialId } = req.params;
      await prisma.material.delete({ where: { id: materialId } });
      res.json({ success: true, message: "Materi berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal menghapus materi" });
    }
  }

  static async deleteAssignment(req: AuthRequest, res: Response) {
    try {
      const { assignmentId } = req.params;
      await prisma.assignment.delete({ where: { id: assignmentId } });
      res.json({ success: true, message: "Tugas berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal menghapus tugas" });
    }
  }

  static async deleteQuiz(req: AuthRequest, res: Response) {
    try {
      const { quizId } = req.params;
      // Delete questions first if needed (Prisma might handle it if cascade is set, but let's be safe)
      await prisma.quizQuestion.deleteMany({ where: { quizId } });
      await prisma.quiz.delete({ where: { id: quizId } });
      res.json({ success: true, message: "Kuis berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal menghapus kuis" });
    }
  }
}
