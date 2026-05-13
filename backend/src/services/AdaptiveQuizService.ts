import prisma from "../config/database";
import { logger } from "../utils/logger";

export class AdaptiveQuizService {
  /**
   * Hitung perubahan difficulty berdasarkan jawaban
   * - Jawab benar → kesulitan naik
   * - Jawab salah → kesulitan turun
   */
  static async adjustDifficulty(
    currentDifficulty: number,
    isCorrect: boolean
  ): Promise<number> {
    const difficulty = currentDifficulty || 5;

    if (isCorrect) {
      return Math.min(difficulty + 1, 10);
    } else {
      return Math.max(difficulty - 1, 1);
    }
  }

  /**
   * Increase difficulty untuk soal berikutnya
   */
  static async increaseDifficulty(questionId: string): Promise<void> {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        logger.warn(`Question not found: ${questionId}`);
        return;
      }

      const newDifficulty = Math.min((question.difficulty || 5) + 1, 10);

      await prisma.question.update({
        where: { id: questionId },
        data: { difficulty: newDifficulty },
      });

      logger.info(`Difficulty increased for question ${questionId}: ${newDifficulty}`);
    } catch (error) {
      logger.error("Error increasing difficulty", error);
    }
  }

  /**
   * Decrease difficulty untuk soal berikutnya
   */
  static async decreaseDifficulty(questionId: string): Promise<void> {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        logger.warn(`Question not found: ${questionId}`);
        return;
      }

      const newDifficulty = Math.max((question.difficulty || 5) - 1, 1);

      await prisma.question.update({
        where: { id: questionId },
        data: { difficulty: newDifficulty },
      });

      logger.info(`Difficulty decreased for question ${questionId}: ${newDifficulty}`);
    } catch (error) {
      logger.error("Error decreasing difficulty", error);
    }
  }

  /**
   * Get soal berikutnya dengan adaptive difficulty
   */
  static async getAdaptiveQuestion(
    classId: string,
    currentDifficulty: number = 5,
    excludeQuestionIds: string[] = []
  ) {
    try {
      const minDiff = Math.max(currentDifficulty - 1, 1);
      const maxDiff = Math.min(currentDifficulty + 1, 10);

      const questions = await prisma.question.findMany({
        where: {
          classId,
          difficulty: {
            gte: minDiff,
            lte: maxDiff,
          },
          id: {
            notIn: excludeQuestionIds,
          },
        },
        take: 1,
      });

      if (questions.length === 0) {
        logger.warn(
          `No adaptive questions found for difficulty ${minDiff}-${maxDiff}`
        );
        return null;
      }

      return questions[0];
    } catch (error) {
      logger.error("Error getting adaptive question", error);
      throw error;
    }
  }

  /**
   * Hitung statistik quiz
   */
  static async calculateQuizStats(sessionId: string) {
    try {
      const answers = await prisma.quizAnswer.findMany({
        where: { sessionId },
      });

      const totalQuestions = answers.length;
      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const score = totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

      const avgTimeSpent = totalQuestions > 0
        ? Math.round(
            answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) /
              totalQuestions
          )
        : 0;

      logger.info(
        `Quiz stats: ${correctAnswers}/${totalQuestions} correct, score: ${score}%, avg time: ${avgTimeSpent}s`
      );

      return {
        totalQuestions,
        correctAnswers,
        score,
        avgTimeSpent,
      };
    } catch (error) {
      logger.error("Error calculating quiz stats", error);
      throw error;
    }
  }

  /**
   * Analisis performa berdasarkan topik
   */
  static async analyzePerformanceByTopic(sessionId: string) {
    try {
      const answers = await prisma.quizAnswer.findMany({
        where: { sessionId },
        include: {
          question: {
            select: {
              topic: true,
              difficulty: true,
            },
          },
        },
      });

      const topicStats: {
        [key: string]: {
          correct: number;
          total: number;
          percentage: number;
        };
      } = {};

      answers.forEach((answer) => {
        const topic = answer.question?.topic || "Unknown";
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, total: 0, percentage: 0 };
        }

        topicStats[topic].total++;
        if (answer.isCorrect) {
          topicStats[topic].correct++;
        }
      });

      // Hitung persentase untuk setiap topik
      Object.keys(topicStats).forEach((topic) => {
        const stats = topicStats[topic];
        stats.percentage =
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      });

      logger.info(`Performance analyzed for ${Object.keys(topicStats).length} topics`);

      return topicStats;
    } catch (error) {
      logger.error("Error analyzing performance by topic", error);
      throw error;
    }
  }

  /**
   * Generate rekomendasi berdasarkan performa
   */
  static async generateRecommendations(
    sessionId: string,
    score: number
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const topicStats = await this.analyzePerformanceByTopic(sessionId);

    // Identifikasi topik dengan performa rendah
    const weakTopics = Object.entries(topicStats)
      .filter(([, stats]) => stats.percentage < 60)
      .map(([topic]) => topic);

    if (weakTopics.length > 0) {
      recommendations.push(
        `Coba pelajari ulang topik: ${weakTopics.join(", ")} karena performa masih kurang`
      );
    }

    // Rekomendasi berdasarkan skor keseluruhan
    if (score >= 90) {
      recommendations.push(
        "Luar biasa! Skor Anda sangat baik. Coba tingkatkan kesulitan untuk tantangan yang lebih besar."
      );
    } else if (score >= 70) {
      recommendations.push(
        "Bagus! Terus tingkatkan performa Anda dengan lebih banyak latihan soal."
      );
    } else if (score >= 50) {
      recommendations.push(
        "Anda perlu lebih fokus belajar. Coba ulang materi yang masih belum dipahami."
      );
    } else {
      recommendations.push(
        "Skor Anda masih rendah. Sangat disarankan untuk berkonsultasi dengan guru atau menggunakan AI Tutor untuk bantuan lebih lanjut."
      );
    }

    return recommendations;
  }
}