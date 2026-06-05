import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse, ApiError } from "../types";
import { logger } from "../utils/logger";
import { UTApi } from "uploadthing/server";

export class ProfileController {
  static async updateAvatar(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const role = req.user?.role;
      const { imageBase64, fileName } = req.body;

      if (!imageBase64) {
        throw new ApiError(400, 'Image data is required', 'MISSING_IMAGE');
      }

      // Upload image to Uploadthing
      let avatarUrl: string | null = null;
      try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const mimeType = 'image/jpeg';
        const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
        const file = new File([buffer], fileName || 'avatar.jpg', { type: mimeType });
        const uploadRes = await utapi.uploadFiles(file);

        if (uploadRes.data?.ufsUrl) {
          avatarUrl = uploadRes.data.ufsUrl;
        } else if (uploadRes.data?.url) {
          avatarUrl = uploadRes.data.url;
        }
      } catch (uploadErr: any) {
        logger.error('Avatar upload to Uploadthing failed', uploadErr);
        throw new ApiError(500, 'Gagal mengupload gambar profil', 'UPLOAD_FAILED');
      }

      if (!avatarUrl) {
        throw new ApiError(500, 'Upload selesai tetapi URL tidak diterima', 'UPLOAD_URL_MISSING');
      }

      if (role === 'STUDENT') {
        const student = await prisma.student.update({
          where: { id: req.userId },
          data: { avatar: avatarUrl }
        });

        const response: ApiResponse = {
          success: true,
          data: { avatarUrl: student.avatar },
          message: 'Foto profil berhasil diperbarui',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else if (role === 'TEACHER') {
        const teacher = await prisma.teacher.update({
          where: { id: req.userId },
          data: { avatar: avatarUrl } as any,
        });

        const response: ApiResponse = {
          success: true,
          data: { avatarUrl: (teacher as any).avatar },
          message: 'Foto profil berhasil diperbarui',
          timestamp: new Date().toISOString(),
        };

        res.json(response);
      } else {
        throw new ApiError(403, 'Role tidak dikenali', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Update avatar error', error);
      throw error;
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const role = req.user?.role;
      const { name, school, subjectTaught, phone, nip, className, grade } = req.body;

      if (role === 'TEACHER') {
        const updateData: any = {};
        if (name) updateData.name = name;
        if (school !== undefined) updateData.school = school;
        if (subjectTaught !== undefined) updateData.subjectTaught = subjectTaught;
        if (phone !== undefined) updateData.phone = phone;
        if (nip !== undefined) updateData.nip = nip;

        const teacher = await prisma.teacher.update({
          where: { id: req.userId },
          data: updateData,
          select: { id: true, name: true, email: true, school: true, subjectTaught: true, phone: true, nip: true }
        });

        return res.json({ success: true, data: teacher, message: 'Profil berhasil diperbarui' });
      } else if (role === 'STUDENT') {
        const updateData: any = {};
        if (name) updateData.name = name;
        if (school !== undefined) updateData.school = school;
        if (className !== undefined) updateData.className = className;
        if (grade !== undefined) updateData.grade = parseInt(grade);

        const student = await prisma.student.update({
          where: { id: req.userId },
          data: updateData,
          select: { id: true, name: true, email: true, school: true, className: true, grade: true }
        });

        return res.json({ success: true, data: student, message: 'Profil berhasil diperbarui' });
      } else {
        throw new ApiError(403, 'Role tidak dikenali', 'FORBIDDEN');
      }
    } catch (error) {
      logger.error('Update profile error', error);
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
