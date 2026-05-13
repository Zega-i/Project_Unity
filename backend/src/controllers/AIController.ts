import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { GeminiService } from "../services/GeminiService";

export class AIController {
  static async tutorChat(req: AuthRequest, res: Response) {
    try {
      const { message, context } = req.body;

      const response = await GeminiService.chatWithTutor(message, context);

      res.json({
        response,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to chat with tutor" });
    }
  }

  static async generateQuiz(req: AuthRequest, res: Response) {
    try {
      const { text, questionCount = 5 } = req.body;

      const quiz = await GeminiService.generateQuizFromText(text, questionCount);

      res.json({
        quiz,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  }

  static async analyzeErrors(req: AuthRequest, res: Response) {
    try {
      const { wrongAnswers } = req.body;

      const analysis = await GeminiService.analyzeErrors(wrongAnswers);

      res.json({
        analysis,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze errors" });
    }
  }
}
