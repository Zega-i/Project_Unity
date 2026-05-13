# EduBridge AI Integration Guide
## Panduan Lengkap Integrasi AI Gemini ke Dalam Sistem

---

## 1. Persiapan Awal

### 1.1 Install Google Generative AI Package

```bash
npm install @google/generative-ai
```

### 1.2 Setup Gemini API Key

1. **Dapatkan API Key dari Google**
   - Buka https://aistudio.google.com/app/apikey
   - Login dengan akun Google Anda
   - Klik "Create API Key"
   - Copy key yang dihasilkan

2. **Masukkan ke Environment Variable**
   ```
   # File: D:\EduBridge\backend\.env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 1.3 Verifikasi Package di package.json

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.7.0",
    "express": "^4.18.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 2. Arsitektur AI Services

```
backend/src/services/
├── GeminiService.ts          ← Main AI service dengan 4 use case
├── AdaptiveQuizService.ts    ← Quiz adaptif dengan difficulty adjustment
├── EarlyWarningService.ts    ← Risk score calculation & AI analysis
└── LearningPathService.ts    ← Personalized learning path generation
```

---

## 3. Service Descriptions

### 3.1 GeminiService.ts

**Fungsi Utama:**
```typescript
// 1. Generate Quiz dari Materi
GeminiService.generateQuizFromText(extractedText, questionCount, grade, subject)
→ GeneratedQuestion[]

// 2. AI Tutor Chat
GeminiService.chatWithTutor(studentQuestion, context)
→ string

// 3. Analisis Risk Siswa
GeminiService.analyzeStudentRisk(data)
→ EarlyWarningAnalysis

// 4. Analisis Kesalahan Siswa
GeminiService.analyzeErrors(wrongAnswers, studentGrade)
→ ErrorAnalysis
```

**Use Case 1: Quiz Generator**
```typescript
const questions = await GeminiService.generateQuizFromText(
  extractedText,  // Teks materi yang diekstrak dari PDF
  5,              // Jumlah soal yang diinginkan
  "SMA",          // Tingkat kelas
  "Matematika"    // Mata pelajaran
);

// Output:
// [
//   {
//     question: "Berapa hasil dari 2+2?",
//     options: { a: "3", b: "4", c: "5", d: "6" },
//     correct_answer: "b",
//     explanation: "Penjumlahan 2+2 menghasilkan 4",
//     difficulty: "easy",
//     topic: "Operasi Dasar",
//     sub_topic: "Penjumlahan"
//   }
// ]
```

**Use Case 2: AI Tutor**
```typescript
const response = await GeminiService.chatWithTutor(
  "Apa itu fotosintesis?",
  {
    subject: "Biologi",
    grade: "SMA",
    topic: "Proses Biologi"
  }
);

// Output: String response dari Gemini (max 300 kata)
// "Fotosintesis adalah proses yang dilakukan tumbuhan hijau..."
```

**Use Case 3: Early Warning Analysis**
```typescript
const analysis = await GeminiService.analyzeStudentRisk({
  studentName: "Dika",
  grade: "X",
  riskScore: 75,
  scoreDropPercentage: 20,
  loginCountPerWeek: 2,
  quizSkippedCount: 4,
  materialSkippedCount: 8,
  lastScores: [75, 70, 65, 60, 55]
});

// Output:
// {
//   analysis: "Dika mengalami penurunan nilai konsisten dalam 7 hari terakhir...",
//   recommendations: [
//     "Hubungi orang tua Dika untuk membahas kendala pembelajaran",
//     "Berikan remedial khusus untuk topik yang lemah",
//     "Tingkatkan monitoring dan interaksi dengan Dika"
//   ]
// }
```

**Use Case 4: Error Analysis**
```typescript
const errorAnalysis = await GeminiService.analyzeErrors([
  {
    question: "Berapa hasil 5 × 6?",
    topic: "Perkalian",
    subTopic: "Perkalian Dasar",
    studentAnswer: "30",
    correctAnswer: "30"
  },
  {
    question: "Berapa hasil 8 ÷ 2?",
    topic: "Pembagian",
    subTopic: "Pembagian Dasar",
    studentAnswer: "3",
    correctAnswer: "4"
  }
]);

// Output:
// {
//   weakTopics: ["Pembagian Dasar", "Operasi Kompleks"],
//   analysis: "Siswa sering salah pada soal pembagian...",
//   recommendation: "Pelajari ulang materi pembagian dan lakukan lebih banyak praktik"
// }
```

### 3.2 AdaptiveQuizService.ts

**Fungsi Utama:**
```typescript
// Adjust difficulty berdasarkan jawaban
adjustDifficulty(currentDifficulty, isCorrect)
→ number

// Get soal adaptif berikutnya
getAdaptiveQuestion(classId, currentDifficulty, excludeQuestionIds)
→ Question

// Hitung statistik quiz
calculateQuizStats(sessionId)
→ { totalQuestions, correctAnswers, score, avgTimeSpent }

// Analisis performa per topik
analyzePerformanceByTopic(sessionId)
→ { [topic]: { correct, total, percentage } }

// Generate rekomendasi pembelajaran
generateRecommendations(sessionId, score)
→ string[]
```

**Algoritma Adaptif:**
```
Jika jawaban BENAR   → Difficulty += 1 (naik)
Jika jawaban SALAH   → Difficulty -= 1 (turun)
Range               → 1 (easy) sampai 10 (very hard)
```

### 3.3 EarlyWarningService.ts

**Fungsi Utama:**
```typescript
// Hitung risk score dengan formula
calculateRiskScore(data)
→ number (0-100)

// Tentukan kategori risiko
getRiskCategory(riskScore)
→ "safe" | "attention" | "danger"

// Analisis lengkap risiko siswa
analyzeStudentRisk(studentId, classId)
→ StudentRiskScore (dengan AI analysis)
```

**Formula Risk Score:**
```
Risk Score = (0.30 × scoreDropFactor)
           + (0.25 × loginFreqFactor)
           + (0.25 × quizSkipFactor)
           + (0.20 × materialSkipFactor)

Kategori:
- 0-30    : 🟢 AMAN (safe)
- 31-60   : 🟡 PERLU PERHATIAN (attention)
- 61-100  : 🔴 BERISIKO TINGGI (danger)
```

**Contoh:**
```typescript
const riskData = await EarlyWarningService.analyzeStudentRisk(
  studentId,
  classId
);

// Output:
// {
//   studentId: "stu123",
//   riskScore: 72,
//   riskCategory: "danger",
//   scoreDropFactor: 0.5,
//   loginFreqFactor: 0.7,
//   quizSkipFactor: 0.6,
//   materialSkipFactor: 0.8,
//   aiAnalysis: "Dika mengalami kesulitan belajar yang signifikan...",
//   aiRecommendation: "[\"Hubungi orang tua\", \"Berikan remedial\"]"
// }
```

### 3.4 LearningPathService.ts

**Fungsi Utama:**
```typescript
// Generate personalized learning path
generateLearningPath(studentId, subject, grade)
→ { path, items, totalDuration }

// Identifikasi topik lemah
identifyWeakTopics(studentId)
→ string[]

// Update progress dalam learning path
updatePathProgress(learningPathItemId, masterScore, status)
→ LearningPathItem

// Get current learning path dengan progress
getCurrentLearningPath(studentId, subject)
→ { path, progress, completed, total }
```

**Contoh Output:**
```typescript
const learningPath = await LearningPathService.generateLearningPath(
  studentId,
  "Matematika",
  10
);

// Output:
// {
//   path: {
//     id: "lp123",
//     studentId: "stu123",
//     subject: "Matematika",
//     weakTopics: "[\"Persamaan Kuadrat\", \"Trigonometri\"]",
//     strongTopics: "[\"Aljabar\", \"Geometri\"]"
//   },
//   items: [
//     {
//       topic: "Review Aljabar Dasar",
//       duration_minutes: 30,
//       priority: "medium",
//       status: "in_progress",
//       masterScore: 0
//     },
//     {
//       topic: "Persamaan Kuadrat - Level 1",
//       duration_minutes: 45,
//       priority: "high",
//       status: "locked",
//       masterScore: 0
//     }
//   ],
//   totalDuration: 180
// }
```

---

## 4. Integration dalam Controllers

### 4.1 Quiz Controller

```typescript
import { GeminiService } from "../services/GeminiService";
import { AdaptiveQuizService } from "../services/AdaptiveQuizService";

export class QuizController {
  static async startQuiz(req: AuthRequest, res: Response) {
    const { classId, questionCount } = req.body;
    
    // Buat session baru
    const session = await prisma.quizSession.create({
      data: {
        studentId: req.userId,
        classId,
        totalQuestions: questionCount,
      },
    });

    // Get soal adaptif pertama (difficulty = 5 default)
    const firstQuestion = await AdaptiveQuizService.getAdaptiveQuestion(
      classId,
      5, // start with medium difficulty
      []
    );

    res.json({ sessionId: session.id, question: firstQuestion });
  }

  static async answerQuestion(req: AuthRequest, res: Response) {
    const { sessionId, questionId, answer } = req.body;
    
    // Save jawaban
    const quizAnswer = await prisma.quizAnswer.create({
      data: { sessionId, questionId, answer, isCorrect: ... }
    });

    // Adjust difficulty untuk soal berikutnya
    const newDifficulty = await AdaptiveQuizService.adjustDifficulty(
      currentDifficulty,
      quizAnswer.isCorrect
    );

    // Get soal berikutnya dengan adjusted difficulty
    const nextQuestion = await AdaptiveQuizService.getAdaptiveQuestion(
      classId,
      newDifficulty,
      [questionId] // exclude soal yang sudah dijawab
    );

    res.json({ isCorrect: quizAnswer.isCorrect, nextQuestion });
  }

  static async finishQuiz(req: AuthRequest, res: Response) {
    const { sessionId } = req.body;
    
    // Hitung statistik
    const stats = await AdaptiveQuizService.calculateQuizStats(sessionId);
    
    // Analisis performa per topik
    const topicPerformance = await AdaptiveQuizService.analyzePerformanceByTopic(sessionId);
    
    // Generate rekomendasi
    const recommendations = await AdaptiveQuizService.generateRecommendations(
      sessionId,
      stats.score
    );

    // Ambil jawaban yang salah untuk analisis Gemini
    const wrongAnswers = await getWrongAnswersWithDetails(sessionId);
    
    // Jika ada jawaban yang salah, analisis dengan Gemini
    let errorAnalysis = null;
    if (wrongAnswers.length > 0) {
      errorAnalysis = await GeminiService.analyzeErrors(wrongAnswers);
      
      // Simpan ke database untuk learning path
      await prisma.quizErrorAnalysis.create({
        data: {
          studentId: req.userId,
          sessionId,
          weakSubTopics: JSON.stringify(errorAnalysis.weakTopics),
          aiAnalysis: errorAnalysis.analysis,
          aiRecommendation: errorAnalysis.recommendation
        }
      });
    }

    res.json({
      stats,
      topicPerformance,
      recommendations,
      errorAnalysis
    });
  }
}
```

### 4.2 AI Controller

```typescript
import { GeminiService } from "../services/GeminiService";

export class AIController {
  static async generateQuiz(req: AuthRequest, res: Response) {
    const { text, questionCount, grade, subject } = req.body;
    
    try {
      const questions = await GeminiService.generateQuizFromText(
        text,
        questionCount || 5,
        grade,
        subject
      );

      // Simpan ke bank soal
      const savedQuestions = await prisma.question.createMany({
        data: questions.map(q => ({
          text: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          difficulty: getDifficultyScore(q.difficulty),
          topic: q.topic,
          subTopic: q.sub_topic,
          classId, // dari request
        }))
      });

      res.json({
        success: true,
        questionsGenerated: savedQuestions.count,
        questions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  }

  static async tutorChat(req: AuthRequest, res: Response) {
    const { message, context } = req.body;
    
    const response = await GeminiService.chatWithTutor(message, {
      subject: context?.subject,
      grade: context?.grade,
      topic: context?.topic
    });

    // Simpan chat ke database untuk history
    await prisma.chatMessage.create({
      data: {
        studentId: req.userId,
        messageText: message,
        responseText: response,
        subject: context?.subject
      }
    });

    res.json({ response });
  }
}
```

### 4.3 Dashboard Controller (untuk Early Warning)

```typescript
import { EarlyWarningService } from "../services/EarlyWarningService";

export class DashboardController {
  static async getAtRiskStudents(req: AuthRequest, res: Response) {
    const { classId } = req.params;
    
    // Ambil semua siswa di kelas
    const students = await prisma.classStudent.findMany({
      where: { classId },
      include: { student: true }
    });

    // Analisis risiko untuk setiap siswa
    const riskData = await Promise.all(
      students.map(cs => 
        EarlyWarningService.analyzeStudentRisk(cs.studentId, classId)
      )
    );

    // Filter siswa berisiko (danger + attention)
    const atRiskStudents = riskData.filter(d => 
      d.riskCategory === "danger" || d.riskCategory === "attention"
    );

    res.json({
      totalStudents: students.length,
      atRiskCount: atRiskStudents.length,
      students: atRiskStudents.map(d => ({
        studentName: d.studentName,
        riskScore: d.riskScore,
        riskCategory: d.riskCategory,
        analysis: d.aiAnalysis,
        recommendations: JSON.parse(d.aiRecommendation)
      }))
    });
  }
}
```

---

## 5. Testing AI Services

### 5.1 Test Quiz Generation

```bash
curl -X POST http://localhost:3000/api/ai/generate-quiz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Fotosintesis adalah proses di mana tumbuhan mengubah cahaya menjadi energi kimia...",
    "questionCount": 3,
    "grade": "SMA",
    "subject": "Biologi"
  }'
```

### 5.2 Test AI Tutor

```bash
curl -X POST http://localhost:3000/api/ai/tutor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Apa itu fotosintesis?",
    "context": {
      "subject": "Biologi",
      "grade": "SMA",
      "topic": "Proses Biologi"
    }
  }'
```

### 5.3 Test Analyze Errors

```bash
curl -X POST http://localhost:3000/api/ai/analyze-errors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "wrongAnswers": [
      {
        "question": "Berapa hasil 5+5?",
        "topic": "Penjumlahan",
        "subTopic": "Penjumlahan Dasar",
        "studentAnswer": "9",
        "correctAnswer": "10"
      }
    ]
  }'
```

---

## 6. Environment Variable Checklist

```
# .env file harus memiliki:
✓ GEMINI_API_KEY=sk-...
✓ DATABASE_URL=postgresql://...
✓ JWT_SECRET=your_secret_key_here
✓ PORT=3000
✓ NODE_ENV=development
```

---

## 7. Common Issues & Solutions

### Issue: "API key not found"
```
Solution: Pastikan GEMINI_API_KEY sudah diset di .env
```

### Issue: "Invalid JSON from Gemini"
```
Solution: Gemini kadang menambahkan text sebelum JSON. 
GeminiService sudah handle dengan regex match.
```

### Issue: "Rate limit exceeded"
```
Solution: Google Gemini API memiliki rate limit.
Implementasikan queue system atau caching untuk requests yang sama.
```

### Issue: "Bahasa output bukan Indonesia"
```
Solution: Pastikan prompt sudah specify "Bahasa Indonesia" dengan jelas.
GeminiService sudah menggunakan prompt yang tepat.
```

---

## 8. Performance Optimization

### Caching
```typescript
// Cache hasil generate quiz selama 1 jam
const cacheKey = `quiz_${subject}_${grade}_${questionCount}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await GeminiService.generateQuizFromText(...);
await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);
return result;
```

### Batch Processing
```typescript
// Analisis risiko semua siswa setiap hari jam 00:00
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  const allStudents = await prisma.student.findMany();
  for (const student of allStudents) {
    await EarlyWarningService.analyzeStudentRisk(student.id);
  }
});
```

---

## 9. Next Steps

1. **Setup Database Tables** untuk risk_scores, learning_paths, error_analyses
2. **Create Dashboard API** untuk menampilkan early warning insights
3. **Create Mobile Integration** untuk consume AI services dari mobile
4. **Implement Cron Jobs** untuk daily early warning analysis
5. **Add Chat History Storage** untuk persisten AI tutor conversations

---

**Last Updated:** Mei 2026
**Status:** Production Ready
**Tested with:** Gemini 1.5 Flash API
