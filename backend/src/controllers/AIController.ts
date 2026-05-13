import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { GeminiService } from "../services/GeminiService";
import { ApiResponse, ApiError } from "../types";
import { validateTutorChatRequest, validateGenerateQuizRequest, validateAnalyzeErrorsRequest } from "../utils/validation";
import { logger } from "../utils/logger";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants";

export class AIController {
  static async tutorChat(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { message, context } = validateTutorChatRequest(req.body);

      const response = await GeminiService.chatWithTutor(message, context);

      logger.info(`Tutor chat completed for student ${req.userId}`);

      const apiResponse: ApiResponse = {
        success: true,
        data: {
          response,
        },
        message: SUCCESS_MESSAGES.TUTOR_RESPONSE || 'Respons dari AI tutor',
        timestamp: new Date().toISOString(),
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error('Tutor chat error', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'AI_CHAT_FAILED');
    }
  }

  static async generateQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { text, questionCount } = validateGenerateQuizRequest(req.body);

      const quiz = await GeminiService.generateQuizFromText(text, questionCount);

      logger.info(`Quiz generated for student ${req.userId}, count: ${questionCount}`);

      const apiResponse: ApiResponse = {
        success: true,
        data: {
          quiz,
        },
        message: SUCCESS_MESSAGES.QUIZ_GENERATED || 'Kuis berhasil dibuat',
        timestamp: new Date().toISOString(),
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error('Generate quiz error', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'QUIZ_GENERATION_FAILED');
    }
  }

  static async analyzeErrors(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { wrongAnswers } = validateAnalyzeErrorsRequest(req.body);

      const analysis = await GeminiService.analyzeErrors(wrongAnswers);

      logger.info(`Error analysis completed for student ${req.userId}`);

      const apiResponse: ApiResponse = {
        success: true,
        data: {
          analysis,
        },
        message: SUCCESS_MESSAGES.ERRORS_ANALYZED || 'Analisis kesalahan selesai',
        timestamp: new Date().toISOString(),
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error('Analyze errors error', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, ERROR_MESSAGES.AI_ERROR, 'ANALYSIS_FAILED');
    }
  }
}
