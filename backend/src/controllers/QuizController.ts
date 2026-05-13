import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { AdaptiveQuizService } from "../services/AdaptiveQuizService";

export class QuizController {
  static async startQuiz(req: AuthRequest, res: Response) {
    try {
      const { classId, questionCount = 5 } = req.body;

      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const questions = await prisma.question.findMany({
        where: { classId },
        take: questionCount,
      });

      if (questions.length === 0) {
        return res.status(404).json({ error: "No questions found for this class" });
      }

      const session = await prisma.quizSession.create({
        data: {
          studentId: req.userId,
          classId,
          totalQuestions: questions.length,
        },
      });

      res.json({
        sessionId: session.id,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: JSON.parse(q.options[0] || "[]"),
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start quiz" });
    }
  }

  static async answerQuestion(req: AuthRequest, res: Response) {
    try {
      const { sessionId, questionId, answer } = req.body;

      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
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

      res.json({
        isCorrect,
        explanation: question.explanation,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit answer" });
    }
  }

  static async finishQuiz(req: AuthRequest, res: Response) {
    try {
      const { sessionId } = req.body;

      const answers = await prisma.quizAnswer.findMany({
        where: { sessionId },
      });

      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const score = (correctAnswers / answers.length) * 100;

      const session = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
          score,
          correctAnswers,
          status: "COMPLETED",
        },
      });

      res.json({
        sessionId: session.id,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        score: session.score,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to finish quiz" });
    }
  }
}
