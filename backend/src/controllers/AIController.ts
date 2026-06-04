import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { AIService } from "../services/AIService";
import { ApiResponse, ApiError } from "../types";
import { logger } from "../utils/logger";
import { ERROR_MESSAGES } from "../constants";

export class AIController {
  static async tutorChat(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { message, context } = req.body;
      const responseText = await AIService.chatWithTutor(message, context);

      const apiResponse: ApiResponse = {
        success: true,
        data: { response: responseText },
        message: "Tutor response generated successfully",
        timestamp: new Date().toISOString(),
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error('Tutor chat error', error);
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'TUTOR_CHAT_FAILED');
    }
  }

  static async generateQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { text, questionCount, materialId } = req.body;

      let finalContent = text;
      
      if (materialId) {
        const material = await prisma.material.findUnique({
          where: { id: materialId },
          select: { extractedText: true, content: true, title: true }
        });
        
        if (material) {
          const parts = [material.content, material.extractedText].filter(Boolean);
          finalContent = parts.length > 0 ? parts.join('\n\n') : (material.title || '');
          if (text) finalContent = `${finalContent}\n\nInstruksi Tambahan: ${text}`;
        }
      }

      if (!finalContent) {
        throw new ApiError(400, "Konten materi tidak ditemukan", 'INSUFFICIENT_DATA');
      }

      const quiz = await AIService.generateQuizFromText(finalContent, questionCount);

      const apiResponse: ApiResponse = {
        success: true,
        data: { quiz },
        message: "Quiz generated successfully",
        timestamp: new Date().toISOString(),
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error('Generate quiz error', error);
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'QUIZ_GENERATION_FAILED');
    }
  }

  static async generateAssignment(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { text, materialId } = req.body;
      let finalContent = text;

      if (materialId) {
        const material = await prisma.material.findUnique({
          where: { id: materialId },
          select: { extractedText: true, content: true, title: true }
        });
        if (material) {
          const parts = [material.content, material.extractedText].filter(Boolean);
          finalContent = parts.length > 0 ? parts.join('\n\n') : (material.title || '');
          if (text) finalContent = `${finalContent}\n\nInstruksi Tambahan: ${text}`;
        }
      }

      const assignment = await AIService.generateAssignmentFromText(finalContent);

      const apiResponse: ApiResponse = {
        success: true,
        data: { assignment },
        message: "Assignment generated successfully",
        timestamp: new Date().toISOString(),
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error('Generate assignment error', error);
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'ASSIGNMENT_GENERATION_FAILED');
    }
  }

  static async analyzeStudentRisk(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { studentId, name, avgScore } = req.body;
      const context = {
        studentName: name,
        averageScore: avgScore,
        subjects: ["Matematika", "Fisika"],
        recentTrend: "Menurun",
      };

      const result = await AIService.analyzeStudentRisk(context);
      
      // Format as string for the frontend PremiumModal
      const formattedAnalysis = `${result.analysis}\n\n**Rekomendasi:**\n${result.recommendations.map((r: string) => `• ${r}`).join('\n')}`;

      res.json({
        success: true,
        data: { analysis: formattedAnalysis },
        message: "Student risk analysis completed"
      });
    } catch (error) {
      logger.error('Analyze risk error', error);
      throw new ApiError(500, "Gagal menganalisis risiko siswa", 'AI_ERROR');
    }
  }

  static async getLearningPath(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const studentHistory = [
        { subject: 'Matematika', score: 85 },
        { subject: 'Fisika', score: 45 },
        { subject: 'Biologi', score: 70 },
      ];

      const result = await AIService.generateLearningPath(studentHistory);

      res.json({
        success: true,
        data: { recommendation: result.formattedMessage },
        message: "Learning path generated"
      });
    } catch (error) {
      logger.error('Learning path error', error);
      throw new ApiError(500, "Gagal membuat jalur belajar", 'AI_ERROR');
    }
  }

  static async analyzeErrors(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { wrongAnswers } = req.body;
      const analysis = await AIService.analyzeErrors(wrongAnswers);

      res.json({
        success: true,
        data: { analysis },
        message: "Error analysis completed successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Analyze errors error', error);
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'ANALYSIS_FAILED');
    }
  }

  static async generateLessonPlan(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { text, materialId } = req.body;
      let finalContent = text;

      if (materialId) {
        const material = await prisma.material.findUnique({
          where: { id: materialId },
          select: { extractedText: true, content: true, title: true }
        });
        if (material) {
          finalContent = material.extractedText || material.content || material.title;
        }
      }

      const lessonPlan = await AIService.generateLessonPlan(finalContent);

      res.json({
        success: true,
        data: { lessonPlan },
        message: "Lesson plan generated successfully",
      });
    } catch (error) {
      logger.error('Generate lesson plan error', error);
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'LESSON_PLAN_FAILED');
    }
  }
}
