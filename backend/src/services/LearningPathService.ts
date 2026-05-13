import prisma from "../config/database";
import { GeminiService } from "./GeminiService";
import { logger } from "../utils/logger";

export class LearningPathService {
  /**
   * Generate learning path berdasarkan profil kemampuan siswa
   */
  static async generateLearningPath(
    studentId: string,
    subject: string,
    grade: number
  ) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Ambil weak dan strong topics dari quiz errors
      const weakTopics = await this.identifyWeakTopics(studentId);
      const strongTopics = await this.identifyStrongTopics(studentId);

      logger.info(
        `Generating learning path for ${student.name}: weak=${weakTopics.join(",")}, strong=${strongTopics.join(",")}`
      );

      // Gunakan Gemini untuk generate path yang dipersonalisasi
      const learningPath = await GeminiService.generateLearningPath({
        studentName: student.name,
        subject,
        grade: `Kelas ${grade}`,
        weakTopics,
        strongTopics,
        learningStyle: "Blended (reading + practice)",
      });

      // Simpan ke database
      const path = await prisma.learningPath.create({
        data: {
          studentId,
          subject,
          weakTopics: JSON.stringify(weakTopics),
          strongTopics: JSON.stringify(strongTopics),
        },
      });

      // Simpan setiap item dalam learning path
      const pathItems = await Promise.all(
        learningPath.items.map((item, index) =>
          prisma.learningPathItem.create({
            data: {
              learningPathId: path.id,
              topic: item.topic,
              orderIndex: index,
              estimatedDuration: item.duration_minutes,
              status: index === 0 ? "in_progress" : "locked",
              masterScore: 0,
            },
          })
        )
      );

      logger.info(`Learning path created with ${pathItems.length} items`);

      return {
        path,
        items: pathItems,
        totalDuration: learningPath.totalDuration,
      };
    } catch (error) {
      logger.error("Error generating learning path", error);
      throw error;
    }
  }

  /**
   * Identifikasi topik lemah dari quiz error analysis
   */
  static async identifyWeakTopics(studentId: string): Promise<string[]> {
    try {
      const errorAnalyses = await prisma.quizErrorAnalysis.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      const weakTopicsSet = new Set<string>();

      errorAnalyses.forEach((analysis) => {
        try {
          const topics = JSON.parse(analysis.weakSubTopics);
          topics.forEach((topic: string) => weakTopicsSet.add(topic));
        } catch (e) {
          logger.warn("Failed to parse weak sub topics");
        }
      });

      return Array.from(weakTopicsSet).slice(0, 5);
    } catch (error) {
      logger.error("Error identifying weak topics", error);
      return [];
    }
  }

  /**
   * Identifikasi topik kuat dari quiz performance
   */
  static async identifyStrongTopics(studentId: string): Promise<string[]> {
    try {
      const quizAnswers = await prisma.quizAnswer.findMany({
        where: {
          quizSession: {
            studentId,
          },
        },
        include: {
          question: {
            select: { topic: true },
          },
        },
        take: 100,
      });

      // Hitung akurasi per topik
      const topicAccuracy: { [key: string]: { correct: number; total: number } } = {};

      quizAnswers.forEach((answer) => {
        const topic = answer.question?.topic || "Unknown";
        if (!topicAccuracy[topic]) {
          topicAccuracy[topic] = { correct: 0, total: 0 };
        }
        topicAccuracy[topic].total++;
        if (answer.isCorrect) {
          topicAccuracy[topic].correct++;
        }
      });

      // Filter topik dengan akurasi > 75%
      const strongTopics = Object.entries(topicAccuracy)
        .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total > 0.75)
        .map(([topic]) => topic)
        .slice(0, 5);

      return strongTopics;
    } catch (error) {
      logger.error("Error identifying strong topics", error);
      return [];
    }
  }

  /**
   * Update progress dalam learning path
   */
  static async updatePathProgress(
    learningPathItemId: string,
    masterScore: number,
    status: "locked" | "available" | "in_progress" | "done"
  ) {
    try {
      const pathItem = await prisma.learningPathItem.update({
        where: { id: learningPathItemId },
        data: {
          masterScore,
          status,
        },
      });

      logger.info(
        `Learning path item ${learningPathItemId} updated: score=${masterScore}, status=${status}`
      );

      // Unlock item berikutnya jika item ini selesai
      if (status === "done") {
        const learningPath = await prisma.learningPath.findUnique({
          where: { id: pathItem.learningPathId },
        });

        const nextItem = await prisma.learningPathItem.findFirst({
          where: {
            learningPathId: pathItem.learningPathId,
            orderIndex: pathItem.orderIndex + 1,
          },
        });

        if (nextItem) {
          await prisma.learningPathItem.update({
            where: { id: nextItem.id },
            data: { status: "available" },
          });
          logger.info(`Next item unlocked: ${nextItem.id}`);
        }
      }

      return pathItem;
    } catch (error) {
      logger.error("Error updating path progress", error);
      throw error;
    }
  }

  /**
   * Get current learning path untuk siswa
   */
  static async getCurrentLearningPath(
    studentId: string,
    subject: string
  ) {
    try {
      const path = await prisma.learningPath.findFirst({
        where: {
          studentId,
          subject,
        },
        include: {
          items: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      if (!path) {
        return null;
      }

      // Hitung progress
      const totalItems = path.items.length;
      const completedItems = path.items.filter((i) => i.status === "done").length;
      const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      return {
        path,
        progress: Math.round(progress),
        completed: completedItems,
        total: totalItems,
      };
    } catch (error) {
      logger.error("Error getting current learning path", error);
      throw error;
    }
  }

  /**
   * Regenerate learning path berdasarkan progress terbaru
   */
  static async regenerateLearningPath(
    studentId: string,
    subject: string,
    grade: number
  ) {
    try {
      // Hapus path lama
      const oldPath = await prisma.learningPath.findFirst({
        where: { studentId, subject },
      });

      if (oldPath) {
        await prisma.learningPathItem.deleteMany({
          where: { learningPathId: oldPath.id },
        });
        await prisma.learningPath.delete({
          where: { id: oldPath.id },
        });
        logger.info(`Old learning path deleted: ${oldPath.id}`);
      }

      // Generate path baru
      return this.generateLearningPath(studentId, subject, grade);
    } catch (error) {
      logger.error("Error regenerating learning path", error);
      throw error;
    }
  }
}