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
            avgScore: 82,
            completedTasks: 5,
            activeRate: 95
          },
          chart: [
            { label: 'Sen', value: 78 },
            { label: 'Sel', value: 85 },
            { label: 'Rab', value: 90 },
            { label: 'Kam', value: 70 },
            { label: 'Jum', value: 83 },
            { label: 'Sab', value: 55 },
            { label: 'Min', value: 72 },
          ],
          atRisk: [
            { id: '1', name: 'Dika Pratama', kelas: 'Matematika 10A', avg: 60, color: '#6366F1' },
            { id: '2', name: 'Siti Nurhaliza', kelas: 'Fisika 10A', avg: 65, color: '#EC4899' },
          ]
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
      res.status(500).json({ success: false, error: "Gagal mengambil kuis" });
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
            avg: 80, // Dummy average
            status: 'Active'
          });
        });
      });

      res.json({ success: true, data: Array.from(allStudentsMap.values()) });
    } catch (error) {
      res.status(500).json({ success: false, error: "Gagal mengambil daftar semua siswa" });
    }
  }
}
