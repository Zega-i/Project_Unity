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
      const prompt = `Berdasarkan materi berikut, buat ${questionCount} soal pilihan ganda untuk kelas ${grade} mata pelajaran ${subject}.

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
        messages: [
          {
            role: "system",
            content: "Kamu adalah pakar kurikulum pendidikan Indonesia yang sangat akurat. Tugasmu adalah membuat soal kuis yang 100% didasarkan pada materi (PDF) yang diberikan oleh pengguna. Jangan mengambil informasi dari luar materi tersebut, jangan melenceng dari topik, dan pastikan pertanyaan mengukur pemahaman materi yang ada dalam dokumen secara presisi."
          },
          { role: "user", content: prompt }
        ],
        model: this.model,
        temperature: 0.2,
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
        messages: [
          {
            role: "system",
            content: "Kamu adalah asisten akademik yang terstruktur. Tugasmu adalah merancang tugas proyek atau esai yang 100% didasarkan pada materi (PDF) yang diberikan oleh pengguna. Jangan melenceng dari topik materi, jangan menambahkan konsep luar yang tidak dibahas dalam dokumen, dan pastikan tugas menguji materi tersebut secara langsung."
          },
          { role: "user", content: prompt }
        ],
        model: this.model,
        temperature: 0.2,
      });

      return message.choices[0]?.message?.content || "Gagal merancang tugas.";
    } catch (error) {
      logger.error("Error generating assignment", error);
      throw error;
    }
  }

  static async chatWithTutor(studentQuestion: string, context?: any): Promise<string> {
    try {
      let prompt = '';
      if (context?.role === 'TEACHER' && (context?.studentName || context?.type === 'CLASS_STRATEGY')) {
        if (context?.type === 'CLASS_STRATEGY') {
          const stats = context.classStats || {};
          const summary = stats.summary || {};
          const atRisk = stats.atRisk || [];
          
          let atRiskList = '';
          if (atRisk.length > 0) {
            atRiskList += `- Daftar Siswa yang Perlu Perhatian:\n`;
            atRisk.forEach((s: any) => {
              atRiskList += `  • ${s.name} (${s.kelas || ''}) — Rerata: ${s.avg || 'N/A'}. Masalah: ${s.issue || 'N/A'}\n`;
            });
          }
          
          prompt = `Kamu adalah AI Assistant Guru di platform EduBridge. Tugasmu adalah membantu Guru menganalisis dan merancang strategi pengajaran kolektif untuk seluruh kelas berdasarkan data analitik yang disediakan.

STATISTIK KELAS:
- Total Siswa: ${summary.totalStudents || 0}
- Kelas Aktif: ${summary.activeClasses || 0}
- Rerata Nilai Kuis Kelas: ${summary.avgScore || 0}%
- Tingkat Keaktifan Kehadiran: ${summary.activeRate || 0}%
${atRiskList}

PERTANYAAN GURU:
${studentQuestion}

INSTRUKSI UNTUK AI:
1. Sapa guru secara profesional (gunakan sapaan seperti "Halo Bapak/Ibu Guru" atau "Halo Guru"). JANGAN menyapa atau bertindak seolah-olah kamu sedang berbicara dengan siswa.
2. Tampilkan terlebih dahulu ringkasan evaluasi kelas di bagian paling atas respon Anda dalam format berikut (JANGAN gunakan tanda pagar ### atau bintang *):
   RINGKASAN EVALUASI KELAS:
   • Kekuatan Kelas: [Analisis kekuatan kelas berdasarkan data kehadiran/keaktifan/nilai]
   • Tantangan Kelas: [Analisis tantangan utama kelas, misalnya nilai rata-rata rendah atau daftar siswa yang terancam tertinggal]
3. Berikan rekomendasi pengajaran yang konkret, aplikatif, dan terstruktur untuk membantu guru mengajar secara lebih efektif.
4. Berikan langkah-langkah tindak lanjut nyata untuk membantu siswa-siswa yang terdeteksi "Perlu Perhatian" agar mereka bisa mengejar ketertinggalan tanpa mengganggu jalannya kelas reguler.
5. Jawablah secara terstruktur dalam format teks biasa (Plain Text) yang bersih. JANGAN gunakan tag Markdown seperti #, ##, ###, *, atau **. Jaga agar tanggapan tetap relevan dan fokus pada kemajuan belajar seluruh kelas. JANGAN keluar dari topik strategi pengajaran kelas.`;
        } else {
          const studentName = context?.studentName || 'Siswa';
          const perf = context?.performanceData || {};
          
          let statsContext = '';
          if (perf.avg !== undefined) {
            statsContext += `- Rerata Skor: ${perf.avg}\n`;
          }
          if (perf.rank !== undefined) {
            statsContext += `- Peringkat: ${perf.rank}\n`;
          }
          if (perf.topicAnalysis && perf.topicAnalysis.length > 0) {
            statsContext += `- Analisis Topik:\n`;
            perf.topicAnalysis.forEach((t: any) => {
              statsContext += `  • ${t.label}: ${t.val}%\n`;
            });
          }
          if (perf.activityHistory && perf.activityHistory.length > 0) {
            statsContext += `- Riwayat Aktivitas Kuis:\n`;
            perf.activityHistory.forEach((h: any) => {
              statsContext += `  • ${h.t} pada ${h.d} (Skor: ${h.s})\n`;
            });
          }

          prompt = `Kamu adalah AI Assistant Guru di platform EduBridge. Tugasmu adalah membantu Guru menganalisis dan membimbing siswa secara personal, adaptif, dan spesifik.
          
KONTEKS SISWA:
- Nama Siswa: ${studentName}
${statsContext}
- Rekomendasi AI Awal: ${context?.recommendation || 'Belum ada'}

PERTANYAAN GURU:
${studentQuestion}

INSTRUKSI UNTUK AI:
1. Sapa guru secara profesional (gunakan sapaan seperti "Halo Bapak/Ibu Guru" atau "Halo Guru"). JANGAN menyapa siswa (seperti "Halo Abyan") karena kamu sedang berdiskusi dengan guru.
2. Tampilkan ringkasan evaluasi kekuatan dan kelemahan siswa di bagian paling atas respon Anda berdasarkan analisis data KONTEKS SISWA dengan format berikut (JANGAN gunakan tanda pagar ### atau bintang *):
   RINGKASAN EVALUASI TOPIK:
   • Topik Terkuat: [Nama Topik] ([Persentase]%) — [Alasan singkat mengapa topik ini paling kuat berdasarkan analisis data]
   • Topik Terlemah: [Nama Topik] ([Persentase]%) — [Alasan singkat mengapa topik ini perlu bimbingan khusus/remedial berdasarkan analisis data]
3. JANGAN menjawab secara umum atau teoretis saja. Berikan rekomendasi yang konkret dan praktis yang bisa langsung digunakan oleh guru.
4. JIKA guru menanyakan kuis/soal remedial, berikan minimal 3 contoh soal kuis remedial spesifik beserta kunci jawabannya yang disesuaikan dengan tingkat performa siswa tersebut.
5. JIKA guru bertanya tentang bimbingan adaptif, berikan langkah-langkah detail (seperti subtopik mana yang harus diulang secara berurutan).
6. Jawablah secara terstruktur dalam format teks biasa (Plain Text) yang bersih. JANGAN gunakan tag Markdown seperti #, ##, ###, *, atau **. Jaga agar tanggapan tetap relevan dan fokus pada kemajuan belajar siswa ${studentName}. JANGAN keluar dari topik bimbingan/pembelajaran.`;
        }
      } else {
        if (context?.role === 'TEACHER') {
          prompt = `Kamu adalah AI Assistant Guru EduBridge. Tugasmu adalah membantu Guru dalam mempersiapkan pembelajaran, menyusun ide pengajaran, menyusun materi, RPP, kuis, atau menjawab pertanyaan umum pendidikan secara netral dan umum.
          
PERTANYAAN GURU:
${studentQuestion}

INSTRUKSI UNTUK AI:
1. Sapa guru secara profesional (gunakan sapaan "Bapak/Ibu Guru" atau "Guru"). JANGAN berasumsi sedang berbicara dengan siswa atau membimbing siswa tertentu secara spesifik karena tidak ada siswa yang sedang dipilih saat ini.
2. Berikan jawaban yang informatif, terstruktur, dan aplikatif untuk membantu tugas mengajar Guru secara umum sesuai pertanyaan yang diberikan.
3. Jawablah secara terstruktur menggunakan format teks biasa (Plain Text) yang bersih. JANGAN gunakan tag Markdown seperti #, ##, ###, *, atau **.`;
        } else {
          prompt = `Kamu adalah AI Tutor EduBridge.
KONTEKS: Subjek ${context?.subject || 'Umum'}, Topik ${context?.topic || 'Bermacam-macam'}.
PERTANYAAN: ${studentQuestion}

INSTRUKSI:
- Jelas, ramah, dan suportif.
- Gunakan analogi jika konsep sulit.
- Maksimal 300 kata.`;
        }
      }

      // Map chat history to Groq chat completions format
      const messagesArray: any[] = [];
      
      // Initial system context instruction
      messagesArray.push({
        role: "system",
        content: context?.role === 'TEACHER' 
          ? "Kamu adalah AI Assistant Guru EduBridge yang membantu Guru membimbing dan menganalisis performa belajar siswa. Sapa dan berinteraksilah dengan Guru secara sopan dan profesional. JANGAN gunakan tag Markdown seperti #, ##, ###, *, atau **. Tulis dalam teks biasa yang bersih dengan pembagian paragraf yang rapi menggunakan baris baru."
          : "Kamu adalah AI Tutor EduBridge yang ramah dan suportif untuk membantu siswa belajar. JANGAN gunakan tag Markdown seperti #, ##, ###, *, atau **. Tulis dalam teks biasa yang bersih dengan pembagian paragraf yang rapi menggunakan baris baru."
      });

      // Add conversation history
      if (context?.history && Array.isArray(context.history)) {
        context.history.forEach((msg: any) => {
          const isUser = msg.sender === 'user' || msg.isUser === true;
          messagesArray.push({
            role: isUser ? 'user' : 'assistant',
            content: msg.text || msg.content || ''
          });
        });
      }

      // Add document context if provided
      if (context?.extractedText) {
        messagesArray.push({
          role: "system",
          content: `DOKUMEN/MATERI YANG DIUNGGAH OLEH GURU (URL: ${context.fileUrl || 'N/A'}):\n${context.extractedText}\n\nHarap gunakan isi dokumen di atas untuk membantu menjawab pertanyaan atau menjalankan tugas Guru (seperti membuat kuis, RPP, rangkuman, atau remedial).`
        });
      }

      // Add the current prompt
      messagesArray.push({
        role: "user",
        content: prompt
      });

      const message = await groq.chat.completions.create({
        messages: messagesArray,
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
      const errorsContext = wrongAnswers.map((w, i) => {
        const allOptions = (w.allOptions || []).map((o: any) => `  ${o.id}. ${o.label}`).join('\n');
        return `SOAL ${i + 1}: ${w.question}
Pilihan jawaban:
${allOptions || '  (tidak tersedia)'}
Jawaban siswa  : ${w.userAnswerLabel || w.userAnswer}
Jawaban benar  : ${w.correctAnswerLabel || w.correctAnswer}`;
      }).join("\n\n---\n\n");

      const prompt = `Kamu adalah konselor pendidikan ahli yang membantu siswa SMA Indonesia memahami kelemahan belajarnya.
 
 Berikut ${wrongAnswers.length} soal yang dijawab salah oleh siswa:
 
 ${errorsContext}
 
 Berikan analisis mendalam dengan FORMAT BERIKUT (gunakan Bahasa Indonesia, ramah & memotivasi, dan JANGAN gunakan tag Markdown seperti #, ##, ###, *, atau **):
 
 DIAGNOSIS KESALAHAN
 
 Jelaskan pola utama kesalahan (miskonsepsi, kurang teliti, tidak memahami konsep dasar, dll). Analisis tiap soal secara spesifik.
 
 TOPIK YANG PERLU DIKUASAI
 
 Buat daftar topik/subtopik yang perlu dipelajari ulang berdasarkan soal-soal yang salah:
 • [Topik 1] — alasan singkat
 • [Topik 2] — alasan singkat
 
 RENCANA BELAJAR
 
 Berikan langkah-langkah konkret (3-5 langkah) untuk memperbaiki pemahaman, termasuk jenis latihan atau metode belajar yang disarankan.
 
 TIPS KHUSUS
 
 1 paragraf berisi saran spesifik sesuai pola kesalahan yang ditemukan.
 
 SEMANGAT!
 
 Kalimat motivasi personal yang spesifik (bukan klise), sesuaikan dengan kesalahan yang dibuat.`;

      const message = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
        temperature: 0.7,
        max_tokens: 1200,
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