import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { AdaptiveQuizService } from "../services/AdaptiveQuizService";
import { ApiResponse, ApiError } from "../types";
import { validateQuizStartRequest, validateAnswerQuestionRequest, validateFinishQuizRequest } from "../utils/validation";
import { logger } from "../utils/logger";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants";

export class QuizController {
  static async startQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { classId, questionCount } = validateQuizStartRequest(req.body);

      const questions = await prisma.question.findMany({
        where: { classId },
        take: questionCount,
      });

      if (questions.length === 0) {
        logger.warn(`No questions found for classId: ${classId}`);
        throw new ApiError(404, ERROR_MESSAGES.NOT_FOUND.replace('{resource}', 'Pertanyaan'), 'QUESTIONS_NOT_FOUND');
      }

      const session = await prisma.quizSession.create({
        data: {
          studentId: req.userId,
          classId,
          totalQuestions: questions.length,
        },
      });

      logger.info(`Quiz session started: ${session.id} for student ${req.userId}`);

      const response: ApiResponse = {
        success: true,
        data: {
          sessionId: session.id,
          questions: questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: JSON.parse(q.options[0] || "[]"),
          })),
        },
        message: SUCCESS_MESSAGES.QUIZ_STARTED,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Start quiz error', error);
      throw error;
    }
  }

  static async answerQuestion(req: AuthRequest, res: Response) {
    try {
      const { sessionId, questionId, answer } = validateAnswerQuestionRequest(req.body);

      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        logger.warn(`Question not found: ${questionId}`);
        throw new ApiError(404, ERROR_MESSAGES.QUESTION_NOT_FOUND, 'QUESTION_NOT_FOUND');
      }

      const isCorrect = answer === question.correctAnswer;

      const quizAnswer = await prisma.quizAnswer.create({
        data: {
          sessionId,
          questionId,
          answer,
          isCorrect,
          timeSpent: 0,
        },
      });

      if (isCorrect) {
        await AdaptiveQuizService.increaseDifficulty(questionId);
      } else {
        await AdaptiveQuizService.decreaseDifficulty(questionId);
      }

      logger.info(`Answer submitted: ${quizAnswer.id}, Correct: ${isCorrect}`);

      const response: ApiResponse = {
        success: true,
        data: {
          isCorrect,
          explanation: question.explanation,
        },
        message: SUCCESS_MESSAGES.ANSWER_SUBMITTED,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Answer question error', error);
      throw error;
    }
  }

  static async finishQuiz(req: AuthRequest, res: Response) {
    try {
      const { sessionId } = validateFinishQuizRequest(req.body);

      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        logger.warn(`Quiz session not found: ${sessionId}`);
        throw new ApiError(404, ERROR_MESSAGES.QUIZ_SESSION_NOT_FOUND, 'SESSION_NOT_FOUND');
      }

      const answers = await prisma.quizAnswer.findMany({
        where: { sessionId },
      });

      if (answers.length === 0) {
        throw new ApiError(400, 'Tidak ada jawaban untuk kuis ini', 'NO_ANSWERS');
      }

      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const score = (correctAnswers / answers.length) * 100;

      const updatedSession = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
          score,
          correctAnswers,
          status: "COMPLETED",
        },
      });

      logger.info(`Quiz finished: ${sessionId}, Score: ${score}%`);

      const response: ApiResponse = {
        success: true,
        data: {
          sessionId: updatedSession.id,
          totalQuestions: updatedSession.totalQuestions,
          correctAnswers: updatedSession.correctAnswers,
          score: updatedSession.score,
        },
        message: SUCCESS_MESSAGES.QUIZ_FINISHED,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Finish quiz error', error);
      throw error;
    }
  }
}
