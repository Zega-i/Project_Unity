import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeneratedQuestion {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_answer: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  sub_topic: string;
}

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  static async generateQuizFromText(
    extractedText: string,
    questionCount: number = 5,
    grade: string = "SMA",
    subject: string = "Umum"
  ): Promise<GeneratedQuestion[]> {
    try {
      logger.info(`Generating ${questionCount} quiz questions for ${subject} grade ${grade}`);

      const prompt = `Kamu adalah asisten pendidikan Indonesia yang ahli membuat soal berkualitas tinggi.
Berdasarkan materi berikut, buat ${questionCount} soal pilihan ganda untuk kelas ${grade} mata pelajaran ${subject}.

MATERI:
${extractedText}

KETENTUAN WAJIB:
- Setiap soal memiliki 4 pilihan jawaban (a, b, c, d)
- Hanya SATU jawaban yang benar per soal
- Penjelasan singkat dan jelas mengapa jawaban itu benar
- Tingkat kesulitan: easy/medium/hard (campur sesuai proporsi)
- Format jawaban: gunakan huruf kecil (a/b/c/d)
- Bahasa Indonesia yang mudah dipahami
- Soal harus mengukur pemahaman konsep, bukan hafalan
- Topic dan sub_topic harus spesifik

OUTPUT FORMAT - HANYA JSON ARRAY:
[{"question":"...","options":{"a":"...","b":"...","c":"...","d":"..."},"correct_answer":"a","explanation":"...","difficulty":"medium","topic":"...","sub_topic":"..."}]

Pastikan output adalah VALID JSON yang bisa diparsing langsung.`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Gemini tidak mengembalikan JSON yang valid");
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

      questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correct_answer || !q.explanation) {
          throw new Error(`Soal ${index + 1} tidak lengkap`);
        }
      });

      logger.info(`Successfully generated ${questions.length} questions`);
      return questions;
    } catch (error) {
      logger.error("Error generating quiz from text", error);
      throw error;
    }
  }

  static async chatWithTutor(
    studentQuestion: string,
    context?: any
  ): Promise<string> {
    try {
      logger.info(`AI Tutor chat initiated`);

      const subject = context?.subject || "Umum";
      const grade = context?.grade || "SMA";
      const topic = context?.topic || "";

      const prompt = `Kamu adalah AI Tutor EduBridge, guru ahli membantu siswa Indonesia belajar.

INFORMASI SISWA:
- Tingkat: ${grade}
- Mata Pelajaran: ${subject}
${topic ? `- Topik: ${topic}` : ""}

PERTANYAAN SISWA:
${studentQuestion}

RESPONS:
1. Bahasa mudah dipahami siswa ${grade}
2. Jika konsep kompleks, jelaskan bertahap
3. Berikan contoh konkret
4. Jika ada rumus, tunjukkan langkah-langkahnya
5. Bahasa Indonesia baik dan benar
6. Maksimal 300 kata

Jawab sekarang:`;

      const result = await this.model.generateContent(prompt);
      const tutorResponse = result.response.text();

      logger.info("AI Tutor response generated successfully");
      return tutorResponse;
    } catch (error) {
      logger.error("Error in AI Tutor chat", error);
      throw error;
    }
  }

  static async analyzeStudentRisk(data: any): Promise<any> {
    try {
      logger.info(`Analyzing risk for student: ${data.studentName}`);

      const scoreDropText = data.scoreDropPercentage > 0
        ? `Penurunan nilai 7 hari: ${data.scoreDropPercentage.toFixed(1)}%`
        : `Peningkatan nilai 7 hari: ${Math.abs(data.scoreDropPercentage).toFixed(1)}%`;

      const prompt = `Analisis data siswa dan berikan rekomendasi untuk guru:

DATA SISWA:
- Nama: ${data.studentName}
- Kelas: ${data.grade}
- Risk Score: ${data.riskScore}/100
- ${scoreDropText}
- Login per minggu: ${data.loginCountPerWeek} kali
- Quiz dilewatkan: ${data.quizSkippedCount} kali
- Materi tidak dibuka: ${data.materialSkippedCount} item

Output JSON:
{"analysis":"...","recommendations":["...","...","..."]}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Gemini tidak mengembalikan JSON yang valid");
      }

      const analysis = JSON.parse(jsonMatch[0]);
      logger.info(`Risk analysis completed for ${data.studentName}`);
      return analysis;
    } catch (error) {
      logger.error("Error analyzing student risk", error);
      throw error;
    }
  }

  static async analyzeErrors(wrongAnswers: any[], studentGrade?: string): Promise<any> {
    try {
      logger.info(`Analyzing ${wrongAnswers.length} student errors`);

      if (wrongAnswers.length === 0) {
        return {
          weakTopics: [],
          analysis: "Tidak ada kesalahan untuk dianalisis",
          recommendation: "Lanjutkan dengan tingkat kesulitan yang lebih tinggi",
        };
      }

      const answersText = wrongAnswers
        .map(
          (a, i) =>
            `${i + 1}. Soal: "${a.question}"\n   Topik: ${a.topic}\n   Jawaban siswa: ${a.studentAnswer}\n   Jawaban benar: ${a.correctAnswer}`
        )
        .join("\n");

      const prompt = `Analisis pola kesalahan siswa ${studentGrade || "SMA"}:

DATA KESALAHAN:
${answersText}

OUTPUT JSON:
{"weakTopics":["..."],"analysis":"...","recommendation":"..."}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Gemini tidak mengembalikan JSON yang valid");
      }

      const analysis = JSON.parse(jsonMatch[0]);
      logger.info(`Error analysis completed`);
      return analysis;
    } catch (error) {
      logger.error("Error analyzing student errors", error);
      throw error;
    }
  }

  static async generateLearningPath(data: any): Promise<any> {
    try {
      logger.info(`Generating learning path for ${data.studentName}`);

      const prompt = `Buatkan jalur belajar untuk siswa:

PROFIL:
- Nama: ${data.studentName}
- Kelas: ${data.grade}
- Mata Pelajaran: ${data.subject}
- Topik lemah: ${data.weakTopics.join(", ") || "Belum ada"}
- Topik kuat: ${data.strongTopics.join(", ") || "Semua"}

OUTPUT JSON:
{"pathName":"...","items":[{"topic":"...","duration_minutes":30,"priority":"high","description":"..."}],"totalDuration":180}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Gemini tidak mengembalikan JSON yang valid");
      }

      const learningPath = JSON.parse(jsonMatch[0]);
      logger.info(`Learning path generated`);
      return learningPath;
    } catch (error) {
      logger.error("Error generating learning path", error);
      throw error;
    }
  }
}