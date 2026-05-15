import { Request, Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../types";
import { logger } from "../utils/logger";

export class TeacherController {
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.userId;

      if (!teacherId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Real stats from DB
      const activeClasses = await prisma.class.count({ where: { teacherId } });
      
      // Total students across all classes
      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: { _count: { select: { students: true } } }
      });
      const totalStudents = classes.reduce((acc, curr) => acc + curr._count.students, 0);

      // Dummy for now but structured correctly
      const response: ApiResponse = {
        success: true,
        data: {
          summary: {
            activeClasses,
            totalStudents,
            avgScore: 85,
            completedTasks: 12,
            activeRate: 98
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
        },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting teacher stats', error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
}
