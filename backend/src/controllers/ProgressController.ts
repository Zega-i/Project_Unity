import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProgressController {
  static async getMyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).user.id;
      
      // Calculate average progress based on materials viewed vs total materials in enrolled classes
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
          timeSpent: 300 // default 5 mins
        }
      });

      res.json({ success: true, data: view });
    } catch (error) {
      next(error);
    }
  }
}
