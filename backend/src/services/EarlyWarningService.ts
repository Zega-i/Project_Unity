import prisma from "../config/database";
import { GeminiService } from "./GeminiService";
import { logger } from "../utils/logger";

export class EarlyWarningService {
  static calculateRiskScore(factors: {
    scoreDropFactor: number;
    loginFreqFactor: number;
    quizSkipFactor: number;
    materialSkipFactor: number;
  }): number {
    const score =
      0.3 * factors.scoreDropFactor +
      0.25 * factors.loginFreqFactor +
      0.25 * factors.quizSkipFactor +
      0.2 * factors.materialSkipFactor;
    return Math.min(Math.round(score * 100), 100);
  }

  static getRiskCategory(riskScore: number): string {
    if (riskScore <= 30) return "SAFE";
    if (riskScore <= 60) return "ATTENTION";
    return "DANGER";
  }

  static async calculateScoreDropFactor(studentId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSessions = await prisma.quizSession.findMany({
        where: {
          studentId,
          startedAt: { gte: sevenDaysAgo },
        },
        select: { score: true, startedAt: true },
        orderBy: { startedAt: "desc" },
        take: 10,
      });

      if (recentSessions.length < 2) return 0;

      const scores = recentSessions.map((s) => s.score || 0);
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));

      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      const dropPercentage = avgFirst > 0 ? Math.max((avgFirst - avgSecond) / avgFirst, 0) : 0;
      return Math.min(dropPercentage, 1);
    } catch (error) {
      logger.error("Error calculating score drop factor", error);
      return 0;
    }
  }

  static async calculateLoginFreqFactor(studentId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const loginCount = await prisma.loginHistory.count({
        where: { studentId, loggedInAt: { gte: sevenDaysAgo } },
      });

      const expectedLoginPerWeek = 5;
      const factor = Math.max(1 - loginCount / expectedLoginPerWeek, 0);
      return Math.min(factor, 1);
    } catch (error) {
      logger.error("Error calculating login frequency factor", error);
      return 0;
    }
  }

  static async calculateQuizSkipFactor(studentId: string, classId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const totalQuizzes = await prisma.quizSession.count({
        where: {
          studentId,
          classId,
          startedAt: { gte: sevenDaysAgo },
        },
      });

      const expectedQuizzesPerWeek = 5;
      const factor = Math.max(1 - totalQuizzes / expectedQuizzesPerWeek, 0);
      return Math.min(factor, 1);
    } catch (error) {
      logger.error("Error calculating quiz skip factor", error);
      return 0;
    }
  }

  static async calculateMaterialSkipFactor(studentId: string, classId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const totalMaterials = await prisma.material.count({
        where: { classId, createdAt: { gte: sevenDaysAgo } },
      });

      if (totalMaterials === 0) return 0;

      const viewedMaterials = await prisma.materialView.count({
        where: {
          studentId,
          material: { classId },
          viewedAt: { gte: sevenDaysAgo },
        },
      });

      const factor = Math.max(1 - viewedMaterials / totalMaterials, 0);
      return Math.min(factor, 1);
    } catch (error) {
      logger.error("Error calculating material skip factor", error);
      return 0;
    }
  }

  static async analyzeStudentRisk(studentId: string, classId: string) {
    try {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) throw new Error("Student not found");

      const scoreDropFactor = await this.calculateScoreDropFactor(studentId);
      const loginFreqFactor = await this.calculateLoginFreqFactor(studentId);
      const quizSkipFactor = await this.calculateQuizSkipFactor(studentId, classId);
      const materialSkipFactor = await this.calculateMaterialSkipFactor(studentId, classId);

      const riskScore = this.calculateRiskScore({
        scoreDropFactor,
        loginFreqFactor,
        quizSkipFactor,
        materialSkipFactor,
      });

      const riskCategory = this.getRiskCategory(riskScore);

      const lastScores = await prisma.quizSession.findMany({
        where: { studentId, classId },
        select: { score: true },
        orderBy: { startedAt: "desc" },
        take: 5,
      });

      const geminiAnalysis = await GeminiService.analyzeStudentRisk({
        studentName: student.name,
        grade: student.grade?.toString() || "Unknown",
        riskScore,
        scoreDropPercentage: scoreDropFactor * 100,
        loginCountPerWeek: Math.round((1 - loginFreqFactor) * 5),
        quizSkippedCount: Math.round(quizSkipFactor * 5),
        materialSkippedCount: Math.round(materialSkipFactor * 5),
        lastScores: lastScores.map((s) => s.score || 0),
      });

      const reason = `${geminiAnalysis.analysis}\n\nRekomendasi:\n${geminiAnalysis.recommendations.join("\n")}`;
      const today = new Date().toISOString().split("T")[0];

      const riskData = await prisma.studentRiskScore.upsert({
        where: { studentId_date: { studentId, date: new Date(today) } },
        update: { riskScore, riskCategory, reason },
        create: {
          studentId,
          classId,
          riskScore,
          riskCategory,
          reason,
          date: new Date(today),
        },
      });

      logger.info(`Risk analysis completed for ${student.name}: score ${riskScore} (${riskCategory})`);
      return riskData;
    } catch (error) {
      logger.error("Error analyzing student risk", error);
      throw error;
    }
  }
}