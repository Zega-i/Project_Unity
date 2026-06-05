import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { AIService } from "../services/AIService";
import { ApiResponse, ApiError } from "../types";
import { logger } from "../utils/logger";
import { ERROR_MESSAGES } from "../constants";
import { UTApi } from "uploadthing/server";
import { PDFExtractor } from "../utils/pdfExtractor";

export class AIController {
  static async tutorChat(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { message, context, fileBase64, fileName } = req.body;
      const fs = require('fs');
      fs.appendFileSync('ai-debug.log', `[${new Date().toISOString()}] Received request. Message: "${message}". Context: ${JSON.stringify(context, null, 2)}, hasFile: ${!!fileBase64}\n`);
      logger.info(`[tutorChat] Received request. Message: "${message}". Context: ${JSON.stringify(context)}. HasFile: ${!!fileBase64}`);
      
      let fileUrl: string | undefined;
      let extractedText: string | undefined;

      if (fileBase64) {
        try {
          const buffer = Buffer.from(fileBase64, 'base64');
          const mimeType = 'application/pdf';
          const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
          const file = new File([buffer], fileName || 'attachment.pdf', { type: mimeType });
          const uploadRes = await utapi.uploadFiles(file);

          if (uploadRes.data?.ufsUrl) {
            fileUrl = uploadRes.data.ufsUrl;
          } else if (uploadRes.data?.url) {
            fileUrl = uploadRes.data.url;
          }

          if (fileUrl) {
            extractedText = await PDFExtractor.extractTextFromBase64(fileBase64);
            logger.info(`[tutorChat] Uploaded file successfully: ${fileUrl}, extracted ${extractedText?.length || 0} characters.`);
          }
        } catch (uploadErr) {
          logger.error('[tutorChat] Failed to upload or extract text from attached PDF', uploadErr);
        }
      }

      let userName = "Siswa";
      if (req.userId) {
        const student = await prisma.student.findUnique({
          where: { id: req.userId },
          select: { name: true }
        });
        if (student) {
          userName = student.name.split(' ')[0]; // Use first name for a friendly greeting
        } else {
          const teacher = await prisma.teacher.findUnique({
            where: { id: req.userId },
            select: { name: true }
          });
          if (teacher) userName = teacher.name.split(' ')[0];
        }
      }

      const mergedContext = {
        ...context,
        studentName: userName,
        fileUrl: fileUrl || context?.fileUrl,
        extractedText: extractedText || context?.extractedText,
      };

      const responseText = await AIService.chatWithTutor(message, mergedContext);

      const apiResponse: ApiResponse = {
        success: true,
        data: { 
          response: responseText,
          fileUrl: fileUrl || null
        },
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
      let classSubject = "Umum";
      let classGrade = "SMA";
      
      if (materialId) {
        const material = await prisma.material.findUnique({
          where: { id: materialId },
          select: { 
            extractedText: true, 
            content: true, 
            title: true,
            class: {
              select: {
                subject: true,
                grade: true
              }
            }
          }
        });
        
        if (material) {
          const parts = [material.content, material.extractedText].filter(Boolean);
          finalContent = parts.length > 0 ? parts.join('\n\n') : (material.title || '');
          if (text) finalContent = `${finalContent}\n\nInstruksi Tambahan: ${text}`;

          if (material.class) {
            if (material.class.subject) classSubject = material.class.subject;
            if (material.class.grade) classGrade = `Kelas ${material.class.grade}`;
          }
        }
      }

      if (!finalContent) {
        throw new ApiError(400, "Konten materi tidak ditemukan", 'INSUFFICIENT_DATA');
      }

      const quiz = await AIService.generateQuizFromText(finalContent, questionCount, classGrade, classSubject);

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

      const student = await prisma.student.findUnique({
        where: { id: req.userId },
        select: { name: true }
      });

      const enrollments = await prisma.classStudent.findMany({
        where: { studentId: req.userId },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: true
            }
          }
        }
      });

      const studentHistory: any[] = [];
      for (const e of enrollments) {
        const cls = e.class;
        
        const totalClassMaterials = await prisma.material.count({
          where: { classId: cls.id }
        });

        const viewedClassMaterials = await prisma.materialView.count({
          where: {
            studentId: req.userId,
            material: { classId: cls.id }
          }
        });

        const quizSessions = await prisma.quizSession.findMany({
          where: {
            studentId: req.userId,
            classId: cls.id,
            status: "COMPLETED",
            score: { not: null }
          },
          select: { score: true }
        });

        let avgScore: number | null = null;
        if (quizSessions.length > 0) {
          const totalScore = quizSessions.reduce((sum, s) => sum + (s.score || 0), 0);
          avgScore = Math.round(totalScore / quizSessions.length);
        }

        studentHistory.push({
          subject: cls.subject || cls.name,
          score: avgScore,
          viewedMaterials: viewedClassMaterials,
          totalMaterials: totalClassMaterials
        });
      }

      const result = await AIService.generateRecommendationPath({
        studentName: student?.name || "Siswa",
        history: studentHistory
      });

      res.json({
        success: true,
        data: { recommendation: result.recommendationArray },
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
