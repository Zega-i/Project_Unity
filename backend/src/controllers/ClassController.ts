import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { ApiResponse } from "../types";

export class ClassController {
  static async joinByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const studentId = (req as any).user.id;

      const targetClass = await prisma.class.findUnique({
        where: { code },
      });

      if (!targetClass) {
        return res.status(404).json({ success: false, error: "Kode kelas tidak ditemukan" });
      }

      if (targetClass.archived) {
        return res.status(400).json({ success: false, error: "Kelas ini sudah selesai/diarsipkan" });
      }

      const existing = await prisma.classStudent.findUnique({
        where: {
          classId_studentId: { classId: targetClass.id, studentId },
        },
      });

      if (existing) {
        return res.status(409).json({ success: false, error: "Anda sudah bergabung di kelas ini" });
      }

      const enrollment = await prisma.classStudent.create({
        data: {
          classId: targetClass.id,
          studentId,
        },
      });

      res.status(201).json({
        success: true,
        message: `Berhasil bergabung ke kelas ${targetClass.name}`,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).user.id;
      const enrollments = await prisma.classStudent.findMany({
        where: { studentId },
        include: {
          class: {
            include: {
              teacher: { select: { name: true } },
              materials: true,
            }
          }
        }
      });

      // Get all materials viewed by this student
      const materialViews = await prisma.materialView.findMany({
        where: { studentId },
        select: { materialId: true }
      });
      const viewedMaterialIds = new Set(materialViews.map(mv => mv.materialId));

      const classesWithProgress = enrollments.map(e => {
        const cls = e.class;
        const totalMaterials = cls.materials.length;
        
        let progress = 0;
        if (totalMaterials > 0) {
          const viewedCount = cls.materials.filter((m: any) => viewedMaterialIds.has(m.id)).length;
          progress = Math.round((viewedCount / totalMaterials) * 100);
        }

        return {
          id: cls.id,
          name: cls.name,
          code: cls.code,
          description: cls.description,
          teacherId: cls.teacherId,
          grade: cls.grade,
          subject: cls.subject,
          archived: cls.archived,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
          teacher: cls.teacher,
          progress
        };
      });

      res.json({ success: true, data: classesWithProgress });
    } catch (error) {
      next(error);
    }
  }

  static async getClassDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const classData = await prisma.class.findUnique({
        where: { id },
        include: {
          materials: true,
          teacher: { select: { name: true } }
        }
      });
      res.json({ success: true, data: classData });
    } catch (error) {
      next(error);
    }
  }

  static async getClassAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assignments = await prisma.assignment.findMany({
        where: { classId: id },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  static async getClassQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quizzes = await prisma.quiz.findMany({
        where: { classId: id },
        include: { questions: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: quizzes });
    } catch (error) {
      next(error);
    }
  }
}
