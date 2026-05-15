import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse, ApiError } from "../types";
import { logger } from "../utils/logger";

export class NotificationsController {
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const role = req.user?.role;

      if (role === 'STUDENT') {
        const notifications = await prisma.studentNotification.findMany({
          where: { studentId: req.userId },
          orderBy: { createdAt: 'desc' },
          take: 100, // Last 100 notifications
        });

        const unreadCount = await prisma.studentNotification.count({
          where: {
            studentId: req.userId,
            read: false,
          }
        });

        const response: ApiResponse = {
          success: true,
          data: {
            notifications,
            unreadCount,
          },
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can view notifications', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Get notifications error', error);
      throw error;
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const { id } = req.params;

      if (!id) {
        throw new ApiError(400, 'Notification ID is required', 'MISSING_ID');
      }

      const role = req.user?.role;

      if (role === 'STUDENT') {
        const notification = await prisma.studentNotification.findUnique({
          where: { id }
        });

        if (!notification) {
          throw new ApiError(404, 'Notification not found', 'NOT_FOUND');
        }

        if (notification.studentId !== req.userId) {
          throw new ApiError(403, 'You cannot read this notification', 'FORBIDDEN');
        }

        const updated = await prisma.studentNotification.update({
          where: { id },
          data: { read: true }
        });

        const response: ApiResponse = {
          success: true,
          data: updated,
          message: 'Notification marked as read',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can mark notifications', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Mark as read error', error);
      throw error;
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const role = req.user?.role;

      if (role === 'STUDENT') {
        await prisma.studentNotification.updateMany({
          where: {
            studentId: req.userId,
            read: false,
          },
          data: { read: true }
        });

        const response: ApiResponse = {
          success: true,
          message: 'All notifications marked as read',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can mark notifications', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Mark all as read error', error);
      throw error;
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const { id } = req.params;

      if (!id) {
        throw new ApiError(400, 'Notification ID is required', 'MISSING_ID');
      }

      const role = req.user?.role;

      if (role === 'STUDENT') {
        const notification = await prisma.studentNotification.findUnique({
          where: { id }
        });

        if (!notification) {
          throw new ApiError(404, 'Notification not found', 'NOT_FOUND');
        }

        if (notification.studentId !== req.userId) {
          throw new ApiError(403, 'You cannot delete this notification', 'FORBIDDEN');
        }

        await prisma.studentNotification.delete({
          where: { id }
        });

        const response: ApiResponse = {
          success: true,
          message: 'Notification deleted',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can delete notifications', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Delete notification error', error);
      throw error;
    }
  }

  // Create notification for student (internal use, for auto-triggers)
  static async createNotification(
    studentId: string,
    title: string,
    message: string,
    type: 'ACHIEVEMENT' | 'QUIZ_RESULT' | 'NEW_MATERIAL' | 'RISK_ALERT' | 'SYSTEM'
  ) {
    try {
      const notification = await prisma.studentNotification.create({
        data: {
          studentId,
          title,
          message,
          type,
        }
      });

      logger.info(`Notification created for student ${studentId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('Create notification error', error);
      throw error;
    }
  }

  // Check for unlearned materials and create notifications
  static async checkAndNotifyUnlearnedMaterials(studentId: string) {
    try {
      // Get student's classes
      const classStudents = await prisma.classStudent.findMany({
        where: { studentId },
        select: { classId: true }
      });

      const classIds = classStudents.map(cs => cs.classId);

      if (classIds.length === 0) return;

      // Get all materials in student's classes
      const materials = await prisma.material.findMany({
        where: { classId: { in: classIds } },
        select: { id: true, title: true }
      });

      // Check which ones haven't been viewed
      const unlearnedMaterials: any[] = [];

      for (const material of materials) {
        const viewed = await prisma.materialView.findUnique({
          where: {
            materialId_studentId: {
              materialId: material.id,
              studentId
            }
          }
        });

        if (!viewed) {
          unlearnedMaterials.push(material);
        }
      }

      // If there are unlearned materials, create notification
      if (unlearnedMaterials.length > 0) {
        const existingNotification = await prisma.studentNotification.findFirst({
          where: {
            studentId,
            type: 'NEW_MATERIAL',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        });

        if (!existingNotification) {
          await this.createNotification(
            studentId,
            'Materi Belum Dipelajari',
            `Kamu memiliki ${unlearnedMaterials.length} materi yang belum dipelajari. Ayo segera pelajari!`,
            'NEW_MATERIAL'
          );
        }
      }
    } catch (error) {
      logger.error('Check unlearned materials error', error);
    }
  }
}
