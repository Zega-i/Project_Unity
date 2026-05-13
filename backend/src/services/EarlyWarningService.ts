import prisma from "../config/database";
import { GeminiService } from "./GeminiService";
import { logger } from "../utils/logger";

export interface RiskScoreData {
  studentId: string;
  scoreDropFactor: number;
  loginFreqFactor: number;
  quizSkipFactor: number;
  materialSkipFactor: number;
}

export class EarlyWarningService {
  /**
   * Hitung risk score dengan formula:
   * risk_score = (0.30 × score_drop_factor)
   *            + (0.25 × login_freq_factor)
   *            + (0.25 × quiz_skip_factor)
   *            + (0.20 × material_skip_factor)
   */
  static calculateRiskScore(data: RiskScoreData): number {
    const score =
      0.3 * data.scoreDropFactor +
      0.25 * data.loginFreqFactor +
      0.25 * data.quizSkipFactor +
      0.2 * data.materialSkipFactor;

    return Math.min(Math.round(score * 100), 100);
  }

  /**
   * Tentukan kategori risiko
   */
  static getRiskCategory(riskScore: number): "safe" | "attention" | "danger" {
    if (riskScore <= 30) return "safe";
    if (riskScore <= 60) return "attention";
    return "danger";
  }

  /**
   * Hitung score drop factor dari nilai 7 hari terakhir
   */
  static async calculateScoreDropFactor(studentId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentScores = await prisma.quizAnswer.findMany({
        where: {
          quizSession: {
            studentId,
            startedAt: {
              gte: sevenDaysAgo,
            },
          },
        },
        include: {
          quizSession: {
            select: {
              score: true,
              startedAt: true,
            },
          },
        },
        orderBy: {
          quizSession: {
            startedAt: "desc",
          },
        },
        take: 20,
      });

      if (recentScores.length < 2) {
        return 0;
      }

      // Group by session dan hitung rata-rata score per session
      const sessionScores = Array.from(
        new Map(
          recentScores
            .filter((r) => r.quizSession?.score !== null)
            .map((r) => [
              r.quizSession?.startedAt?.toISOString(),
              r.quizSession?.score || 0,
            ])
        ).values()
      );

      if (sessionScores.length < 2) {
        return 0;
      }

      const firstHalf = sessionScores.slice(0, Math.floor(sessionScores.length / 2));
      const secondHalf = sessionScores.slice(Math.floor(sessionScores.length / 2));

      const avgFirst =
        firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond =
        secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      const dropPercentage = Math.max((avgFirst - avgSecond) / avgFirst, 0);

      return Math.min(dropPercentage, 1);
    } catch (error) {
      logger.error("Error calculating score drop factor", error);
      return 0;
    }
  }

  /**
   * Hitung login frequency factor
   */
  static async calculateLoginFreqFactor(studentId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const loginCount = await prisma.loginHistory.count({
        where: {
          studentId,
          loggedInAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      const expectedLoginPerWeek = 5;
      const factor = Math.max(
        1 - loginCount / expectedLoginPerWeek,
        0
      );

      return Math.min(factor, 1);
    } catch (error) {
      logger.error("Error calculating login frequency factor", error);
      return 0;
    }
  }

  /**
   * Hitung quiz skip factor
   */
  static async calculateQuizSkipFactor(
    studentId: string,
    classId: string
  ): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const totalQuizzes = await prisma.quizSession.count({
        where: {
          studentId,
          classId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      const expectedQuizzesPerWeek = 5;
      const factor = Math.max(
        1 - totalQuizzes / expectedQuizzesPerWeek,
        0
      );

      return Math.min(factor, 1);
    } catch (error) {
      logger.error("Error calculating quiz skip factor", error);
      return 0;
    }
  }

  /**
   * Hitung material skip factor
   */
  static async calculateMaterialSkipFactor(
    studentId: string,
    classId: string
  ): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const totalMaterials = await prisma.material.count({
        where: {
          classId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      const viewedMaterials = await prisma.materialView.count({
        where: {
          studentId,
          material: {
            classId,
          },
          viewedAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      if (totalMaterials === 0) {
        return 0;
      }

      const factor = Math.max(1 - viewedMaterials / totalMaterials, 0);
      return Math.min(factor, 1);
    } catch (error) {
      logger.error("Error calculating material skip factor", error);
      return 0;
    }
  }

  /**
   * Analisis risiko siswa secara keseluruhan
   */
  static async analyzeStudentRisk(
    studentId: string,
    classId: string
  ) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Hitung semua faktor
      const scoreDropFactor = await this.calculateScoreDropFactor(studentId);
      const loginFreqFactor = await this.calculateLoginFreqFactor(studentId);
      const quizSkipFactor = await this.calculateQuizSkipFactor(
        studentId,
        classId
      );
      const materialSkipFactor = await this.calculateMaterialSkipFactor(
        studentId,
        classId
      );

      // Hitung risk score
      const riskScore = this.calculateRiskScore({
        studentId,
        scoreDropFactor,
        loginFreqFactor,
        quizSkipFactor,
        materialSkipFactor,
      });

      const riskCategory = this.getRiskCategory(riskScore);

      // Dapatkan nilai terakhir untuk context Gemini
      const lastScores = await prisma.quizSession.findMany({
        where: { studentId, classId },
        select: { score: true },
        orderBy: { startedAt: "desc" },
        take: 5,
      });

      // Gunakan Gemini untuk analisis mendalam
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

      // Simpan ke database
      const riskData = await prisma.studentRiskScore.upsert({
        where: { student_id_date: { studentId, date: new Date().toISOString().split("T")[0] } },
        update: {
          riskScore,
          riskCategory,
          scoreDropFactor,
          loginFreqFactor,
          quizSkipFactor,
          materialSkipFactor,
          aiAnalysis: geminiAnalysis.analysis,
          aiRecommendation: JSON.stringify(geminiAnalysis.recommendations),
        },
        create: {
          studentId,
          riskScore,
          riskCategory,
          scoreDropFactor,
          loginFreqFactor,
          quizSkipFactor,
          materialSkipFactor,
          aiAnalysis: geminiAnalysis.analysis,
          aiRecommendation: JSON.stringify(geminiAnalysis.recommendations),
          date: new Date().toISOString().split("T")[0],
        },
      });

      logger.info(
        `Risk analysis completed for ${student.name}: score ${riskScore} (${riskCategory})`
      );

      return riskData;
    } catch (error) {
      logger.error("Error analyzing student risk", error);
      throw error;
    }
  }
}