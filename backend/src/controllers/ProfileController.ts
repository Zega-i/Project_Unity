import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse, ApiError } from "../types";
import { logger } from "../utils/logger";

export class ProfileController {
  static async updateAvatar(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        throw new ApiError(400, 'Avatar URL is required', 'MISSING_AVATAR');
      }

      const role = req.user?.role;

      if (role === 'STUDENT') {
        const student = await prisma.student.update({
          where: { id: req.userId },
          data: { avatar: avatarUrl }
        });

        const response: ApiResponse = {
          success: true,
          data: { avatar: student.avatar },
          message: 'Avatar updated successfully',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can update avatar', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Update avatar error', error);
      throw error;
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const { darkModeEnabled, hapticEnabled, notificationsEnabled } = req.body;

      const role = req.user?.role;

      if (role === 'STUDENT') {
        const updateData: any = {};

        if (darkModeEnabled !== undefined) {
          updateData.darkModeEnabled = darkModeEnabled;
        }
        if (hapticEnabled !== undefined) {
          updateData.hapticEnabled = hapticEnabled;
        }
        if (notificationsEnabled !== undefined) {
          updateData.notificationsEnabled = notificationsEnabled;
        }

        const student = await prisma.student.update({
          where: { id: req.userId },
          data: updateData
        });

        const response: ApiResponse = {
          success: true,
          data: {
            darkModeEnabled: student.darkModeEnabled,
            hapticEnabled: student.hapticEnabled,
            notificationsEnabled: student.notificationsEnabled,
          },
          message: 'Preferences updated successfully',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can update preferences', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Update preferences error', error);
      throw error;
    }
  }

  static async getPreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const role = req.user?.role;

      if (role === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { id: req.userId },
          select: {
            darkModeEnabled: true,
            hapticEnabled: true,
            notificationsEnabled: true,
            avatar: true,
          }
        });

        if (!student) {
          throw new ApiError(404, 'Student not found', 'NOT_FOUND');
        }

        const response: ApiResponse = {
          success: true,
          data: student,
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Only students can view preferences', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Get preferences error', error);
      throw error;
    }
  }
}
