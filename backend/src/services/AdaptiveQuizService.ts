import prisma from "../config/database";

export class AdaptiveQuizService {
  static async increaseDifficulty(questionId: string) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (question && question.difficulty < 10) {
        await prisma.question.update({
          where: { id: questionId },
          data: { difficulty: question.difficulty + 1 },
        });
      }
    } catch (error) {
      console.error("Error increasing difficulty:", error);
    }
  }

  static async decreaseDifficulty(questionId: string) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (question && question.difficulty > 1) {
        await prisma.question.update({
          where: { id: questionId },
          data: { difficulty: question.difficulty - 1 },
        });
      }
    } catch (error) {
      console.error("Error decreasing difficulty:", error);
    }
  }

  static async getAdaptiveQuestions(classId: string, studentLevel: number, count: number = 5) {
    try {
      const questions = await prisma.question.findMany({
        where: {
          classId,
          difficulty: {
            gte: Math.max(1, studentLevel - 2),
            lte: Math.min(10, studentLevel + 2),
          },
        },
        take: count,
      });

      return questions;
    } catch (error) {
      console.error("Error fetching adaptive questions:", error);
      return [];
    }
  }
}
