import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../types";
import { logger } from "../utils/logger";

export class DiscussionController {
  // GET /api/class/:classId/discussions
  static async getThreads(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      if (!req.userId) {
        throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
      }

      // Check enrollment
      const enrolled = await prisma.classStudent.findFirst({
        where: { classId, studentId: req.userId }
      });
      const isTeacherOfClass = await prisma.class.findFirst({
        where: { id: classId, teacherId: req.userId }
      });

      if (!enrolled && !isTeacherOfClass) {
        throw new ApiError(403, "Anda tidak terdaftar di kelas ini", "FORBIDDEN");
      }

      const threads = await prisma.discussionThread.findMany({
        where: { classId },
        include: {
          _count: {
            select: { replies: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      res.json({
        success: true,
        data: threads,
        message: "Threads retrieved successfully"
      });
    } catch (error) {
      logger.error("[DiscussionController.getThreads] Error:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Gagal mengambil data diskusi", "DATABASE_ERROR");
    }
  }

  // POST /api/class/:classId/discussions
  static async createThread(req: AuthRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { title, category, content } = req.body;
      if (!req.userId) {
        throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
      }

      if (!title || !category || !content) {
        throw new ApiError(400, "Judul, kategori, dan konten wajib diisi", "BAD_REQUEST");
      }

      // Check author role and name
      let authorName = "User";
      let authorRole = "STUDENT";

      const student = await prisma.student.findUnique({ where: { id: req.userId } });
      if (student) {
        authorName = student.name;
        authorRole = "STUDENT";
      } else {
        const teacher = await prisma.teacher.findUnique({ where: { id: req.userId } });
        if (teacher) {
          authorName = teacher.name;
          authorRole = "TEACHER";
        }
      }

      // Check enrollment
      const enrolled = await prisma.classStudent.findFirst({
        where: { classId, studentId: req.userId }
      });
      const isTeacherOfClass = await prisma.class.findFirst({
        where: { id: classId, teacherId: req.userId }
      });

      if (!enrolled && !isTeacherOfClass) {
        throw new ApiError(403, "Anda tidak terdaftar di kelas ini", "FORBIDDEN");
      }

      const thread = await prisma.discussionThread.create({
        data: {
          classId,
          authorId: req.userId,
          authorRole,
          authorName,
          title,
          category,
          content
        }
      });

      res.status(201).json({
        success: true,
        data: thread,
        message: "Thread diskusi berhasil dibuat"
      });
    } catch (error) {
      logger.error("[DiscussionController.createThread] Error:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Gagal membuat diskusi baru", "DATABASE_ERROR");
    }
  }

  // GET /api/discussion/:threadId/replies
  static async getReplies(req: AuthRequest, res: Response) {
    try {
      const { threadId } = req.params;
      if (!req.userId) {
        throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
      }

      const replies = await prisma.discussionReply.findMany({
        where: { threadId },
        orderBy: { createdAt: "asc" }
      });

      res.json({
        success: true,
        data: replies,
        message: "Replies retrieved successfully"
      });
    } catch (error) {
      logger.error("[DiscussionController.getReplies] Error:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Gagal mengambil balasan diskusi", "DATABASE_ERROR");
    }
  }

  // POST /api/discussion/:threadId/replies
  static async createReply(req: AuthRequest, res: Response) {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      if (!req.userId) {
        throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
      }

      if (!content) {
        throw new ApiError(400, "Konten balasan wajib diisi", "BAD_REQUEST");
      }

      // Check author role and name
      let authorName = "User";
      let authorRole = "STUDENT";

      const student = await prisma.student.findUnique({ where: { id: req.userId } });
      if (student) {
        authorName = student.name;
        authorRole = "STUDENT";
      } else {
        const teacher = await prisma.teacher.findUnique({ where: { id: req.userId } });
        if (teacher) {
          authorName = teacher.name;
          authorRole = "TEACHER";
        }
      }

      const reply = await prisma.discussionReply.create({
        data: {
          threadId,
          authorId: req.userId,
          authorRole,
          authorName,
          content
        }
      });

      res.status(201).json({
        success: true,
        data: reply,
        message: "Balasan berhasil dikirim"
      });
    } catch (error) {
      logger.error("[DiscussionController.createReply] Error:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Gagal mengirim balasan", "DATABASE_ERROR");
    }
  }
}
