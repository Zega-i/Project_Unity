import Groq from "groq-sdk";
import { logger } from "../utils/logger";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

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

export class AIService {
  private static readonly model = "llama-3.3-70b-versatile";

  static async generateQuizFromText(
    extractedText: string,
    questionCount: number = 5,
    grade: string = "SMA",
    subject: string = "Umum"
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = `Kamu adalah pakar kurikulum pendidikan Indonesia.
Berdasarkan materi berikut, buat ${questionCount} soal pilihan ganda untuk kelas ${grade} mata pelajaran ${subject}.

MATERI:
${extractedText}

KETENTUAN:
- 4 pilihan jawaban (a, b, c, d)
- Fokus pada HOTS (Higher Order Thinking Skills)
- Berikan penjelasan mendalam di field 'explanation'
- Format jawaban: huruf kecil (a/b/c/d)

OUTPUT FORMAT - HANYA JSON ARRAY:
[{"question":"...","options":{"a":"...","b":"...","c":"...","d":"..."},"correct_answer":"a","explanation":"...","difficulty":"medium","topic":"...","sub_topic":"..."}]`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      const responseText = message.choices[0]?.message?.content || "";
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid AI response format");

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error("Error generating quiz", error);
      throw error;
    }
  }

  static async generateAssignmentFromText(extractedText: string): Promise<string> {
    try {
      const prompt = `Rancanglah sebuah TUGAS PROYEK/ESSAY berdasarkan materi berikut.
MATERI: ${extractedText}

FORMAT:
1. Judul Proyek yang Menginspirasi
2. Tujuan Pembelajaran
3. Instruksi Kerja (Step-by-step)
4. Kriteria Penilaian (Rubrik Singkat)

Gunakan Bahasa Indonesia yang profesional dan memotivasi.`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      return message.choices[0]?.message?.content || "Gagal merancang tugas.";
    } catch (error) {
      logger.error("Error generating assignment", error);
      throw error;
    }
  }

  static async chatWithTutor(studentQuestion: string, context?: any): Promise<string> {
    try {
      const prompt = `Kamu adalah AI Tutor EduBridge.
KONTEKS: Subjek ${context?.subject || 'Umum'}, Topik ${context?.topic || 'Bermacam-macam'}.
PERTANYAAN: ${studentQuestion}

INSTRUKSI:
- Jelas, ramah, dan suportif.
- Gunakan analogi jika konsep sulit.
- Maksimal 300 kata.`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      return message.choices[0]?.message?.content || "Maaf, aku sedang tidak fokus. Bisa tanya lagi?";
    } catch (error) {
      logger.error("Error in AI Tutor", error);
      throw error;
    }
  }

  static async analyzeErrors(wrongAnswers: any[]): Promise<string> {
    try {
      const errorsContext = wrongAnswers.map((w, i) => 
        `SOAL: ${w.question}\nJAWABAN SISWA: ${w.userAnswer}\nKUNCI: ${w.correctAnswer}`
      ).join("\n\n");

      const prompt = `Analisislah pola kesalahan siswa ini:
${errorsContext}

Berikan:
1. Diagnosis pola kesalahan.
2. Daftar TOPIK LEMAH.
3. Rekomendasi materi untuk dipelajari kembali.
4. Kata-kata motivasi agar siswa tidak menyerah.

Gunakan format markdown yang rapi.`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      return message.choices[0]?.message?.content || "Gagal menganalisis kesalahan.";
    } catch (error) {
      logger.error("Error analyzing errors", error);
      throw error;
    }
  }

  static async analyzeStudentRisk(data: any): Promise<any> {
    try {
      const prompt = `Analisis risiko belajar siswa:
NAMA: ${data.studentName}
NILAI RATA-RATA: ${data.averageScore || 0}
RISK SCORE DARI SISTEM: ${data.riskScore || 0}/100

TUGASMU:
Berikan analisis mendalam dan rekomendasi untuk guru.
OUTPUT HARUS JSON:
{"analysis": "...", "recommendations": ["...", "...", "..."]}`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      const responseText = message.choices[0]?.message?.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid Risk Analysis format");

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error("Error analyzing risk", error);
      return { analysis: "Gagal menganalisis risiko", recommendations: ["Cek manual progres siswa"] };
    }
  }

  static async generateLearningPath(data: any): Promise<any> {
    try {
      const prompt = `Buatkan JALUR BELAJAR personal untuk siswa:
NAMA: ${data.studentName}
SUBJECT: ${data.subject}
TOPIK LEMAH: ${data.weakTopics?.join(", ") || "None"}

OUTPUT HARUS JSON:
{
  "pathName": "...",
  "items": [{"topic": "...", "priority": "high/medium/low"}],
  "totalDuration": 180,
  "formattedMessage": "... (Markdown version for display)"
}`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      const responseText = message.choices[0]?.message?.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid Learning Path format");

      const result = JSON.parse(jsonMatch[0]);
      if (!result.formattedMessage) result.formattedMessage = "Jalur belajar Anda telah siap!";
      return result;
    } catch (error) {
      logger.error("Error generating path", error);
      return { pathName: "Default Path", items: [], totalDuration: 0, formattedMessage: "Gagal membuat jalur belajar." };
    }
  }

  static async generateLessonPlan(extractedText: string): Promise<string> {
    try {
      const prompt = `Buatkan RENCANA PELAKSANAAN PEMBELAJARAN (RPP) yang inovatif berdasarkan materi berikut:
      MATERI: ${extractedText}
      
      RPP harus mencakup:
      1. Identitas (Topik, Target Peserta Didik)
      2. Tujuan Pembelajaran (Lengkap dengan indikator)
      3. Langkah-langkah Pembelajaran (Pembukaan, Inti - gunakan metode aktif/diskusi, Penutup)
      4. Alokasi Waktu
      5. Metode Penilaian
      
      Gunakan Bahasa Indonesia yang profesional dan kreatif. Gunakan format Markdown yang rapi.`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
      });

      return message.choices[0]?.message?.content || "Gagal membuat RPP.";
    } catch (error) {
      logger.error("Error generating lesson plan", error);
      throw error;
    }
  }
}