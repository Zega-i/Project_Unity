# EDUBRIDGE AI — PROFIL LENGKAP
**Platform Pembelajaran Adaptif Berbasis AI untuk Siswa Indonesia**
UNITY Competition #14 — UNY National IT Competition 2026

---

## 1. IDENTITAS PRODUK

| | |
|---|---|
| **Nama Produk** | EduBridge AI |
| **Tagline** | "Belajar Cerdas, Masa Depan Terbuka" |
| **Kategori** | Mobile Application (Android APK) |
| **Target Pengguna** | Siswa SMP-SMA, Guru, Admin Sekolah |
| **Platform** | Android (React Native + Expo) |
| **Backend** | Express.js + Node.js |
| **Database** | Neon PostgreSQL |
| **AI Engine** | Google Gemini API (gemini-1.5-flash) |

---

## 2. DESKRIPSI PRODUK

EduBridge AI adalah platform pembelajaran adaptif berbasis kecerdasan buatan yang dirancang khusus untuk meningkatkan kualitas pendidikan di Indonesia. Platform ini tidak sekadar menyajikan materi pembelajaran, melainkan secara aktif menyesuaikan pengalaman belajar setiap siswa berdasarkan kemampuan, kelemahan, dan gaya belajar mereka secara individual.

Berbeda dari platform e-learning konvensional, EduBridge AI menggunakan teknologi AI generatif untuk menganalisis pola belajar siswa, mendeteksi risiko ketertinggalan lebih awal, dan memberikan jalur belajar yang benar-benar personal — bukan sekadar konten yang sama untuk semua siswa.

---

## 3. PERMASALAHAN YANG DIANGKAT

1. **Pembelajaran tidak personal** — Guru mengajar dengan metode seragam padahal setiap siswa memiliki kemampuan dan gaya belajar berbeda
2. **Deteksi dini terlambat** — Guru sering baru menyadari siswa tertinggal setelah nilai ujian keluar, bukan sejak awal
3. **Pembuatan soal memakan waktu** — Guru menghabiskan banyak waktu membuat soal latihan yang berkualitas
4. **Tidak ada analisis mendalam** — Siswa tidak tahu secara spesifik di bagian mana mereka sering melakukan kesalahan
5. **Keterbatasan akses tutor** — Tidak semua siswa bisa mengakses bimbingan belajar tambahan

---

## 4. SOLUSI YANG DITAWARKAN

EduBridge AI menjawab kelima permasalahan di atas dengan 6 fitur utama berbasis AI:

---

## 5. FITUR-FITUR UTAMA

### 5.1 Adaptive Quiz Engine (Prioritas 1 — INTI)
**Permasalahan yang diselesaikan:** Pembelajaran tidak personal

**Cara kerja AI:**
Algoritma adaptif secara real-time menyesuaikan tingkat kesulitan soal berdasarkan performa siswa:
```
Jawab BENAR  → Difficulty naik (easy → medium → hard)
Jawab SALAH  → Difficulty turun (hard → medium → easy)
```

**Data yang direkam per soal:**
- question_id, jawaban siswa, benar/salah
- waktu pengerjaan (time_seconds)
- difficulty saat soal diberikan (difficulty_at_time)
- perubahan skor (score_change)

**Output untuk siswa:**
- Skor akhir 0-100
- Profil kemampuan per topik
- Visualisasi difficulty curve sepanjang sesi

**Nilai inovasi:** Sistem ini memastikan siswa tidak bosan dengan soal terlalu mudah, dan tidak frustrasi dengan soal terlalu sulit — selalu berada di zona optimal pembelajaran.

---

### 5.2 AI Quiz Generator dari Materi Guru (Prioritas 1)
**Permasalahan yang diselesaikan:** Pembuatan soal memakan waktu

**Cara kerja AI:**
```
Guru upload PDF/PPT materi
        ↓
Ekstrak teks dari file
        ↓
Kirim teks ke Gemini API dengan prompt engineering
        ↓
Gemini generate soal dalam format JSON:
{
  "question": "...",
  "options": {"a":"...", "b":"...", "c":"...", "d":"..."},
  "correct_answer": "a",
  "explanation": "...",
  "difficulty": "medium",
  "topic": "...",
  "sub_topic": "..."
}
        ↓
Guru preview → edit/hapus/approve → masuk bank soal
```

**Prompt Engineering yang digunakan:**
```
"Kamu adalah asisten pendidikan Indonesia. Berdasarkan materi berikut,
buat [N] soal pilihan ganda untuk siswa [kelas] mata pelajaran [mapel].
Setiap soal harus memiliki 4 pilihan (a,b,c,d), satu jawaban benar,
penjelasan singkat, dan tingkat kesulitan (easy/medium/hard).
Format output: JSON array. Bahasa: Indonesia."
```

**Nilai inovasi:** Guru yang biasanya butuh 2-3 jam membuat 20 soal berkualitas, kini bisa mendapatkannya dalam 30 detik.

---

### 5.3 AI Early Warning System (Prioritas 1)
**Permasalahan yang diselesaikan:** Deteksi dini terlambat

**Cara kerja AI:**
Cron job berjalan setiap hari jam 00.00 menghitung risk score per siswa per kelas:

```
FORMULA RISK SCORE (0-100):

risk_score = (0.30 × score_drop_factor)
           + (0.25 × login_freq_factor)
           + (0.25 × quiz_skip_factor)
           + (0.20 × material_skip_factor)

Keterangan faktor (masing-masing 0.0 - 1.0):
- score_drop_factor    : seberapa besar penurunan nilai 7 hari terakhir
- login_freq_factor    : seberapa jarang login dibanding rata-rata
- quiz_skip_factor     : seberapa sering melewatkan quiz
- material_skip_factor : seberapa sering tidak membuka materi
```

**Kategori risiko:**
```
0  - 30  → 🟢 AMAN        (safe)
31 - 60  → 🟡 PERLU PERHATIAN (attention)
61 - 100 → 🔴 BERISIKO TINGGI (danger)
```

**Setelah risk score dihitung, Gemini API dipanggil untuk:**
- Menganalisis pola data siswa
- Menghasilkan narasi analisis dalam Bahasa Indonesia
- Memberikan rekomendasi spesifik untuk guru

**Output ke guru:**
- Dashboard dengan list siswa berisiko + badge warna
- Notifikasi in-app otomatis
- Rekomendasi tindakan dari AI (contoh: "Dika mengalami penurunan nilai 15% dalam 7 hari terakhir dan tidak membuka materi Bab 4. Disarankan untuk menghubungi orang tua dan memberikan remedial khusus topik Persamaan Kuadrat.")

---

### 5.4 AI Learning Path Generator (Prioritas 2)
**Permasalahan yang diselesaikan:** Pembelajaran tidak personal

**Cara kerja AI:**
Berdasarkan profil kemampuan siswa dari hasil quiz, Gemini API menyusun jalur belajar yang unik per siswa:

```
INPUT:
- Topik-topik yang lemah (dari quiz_error_analyses)
- Topik-topik yang kuat
- Gaya belajar (visual/practice/reading)
- Kelas dan mata pelajaran

OUTPUT (dari Gemini):
Urutan topik yang harus dipelajari + estimasi waktu per topik
```

**Tampilan di app:** Peta belajar visual dengan progress bar per item, status (locked/available/in_progress/done), dan estimasi waktu.

---

### 5.5 AI Analisis Kesalahan Siswa (Prioritas 2)
**Permasalahan yang diselesaikan:** Tidak ada analisis mendalam

**Cara kerja AI:**
Setelah setiap quiz selesai, sistem menganalisis pola kesalahan dari 3 quiz terakhir:

```
Data input ke Gemini:
- Soal-soal yang salah dijawab
- Sub-topik dari setiap soal yang salah
- Frekuensi kesalahan per sub-topik

Output dari Gemini:
- Identifikasi pola kesalahan
- Penjelasan konsep yang belum dipahami
- Rekomendasi materi untuk dipelajari ulang
```

**Contoh output:** "Kamu sering salah pada soal yang melibatkan konversi satuan dalam Sistem Internasional. Ini terjadi di 3 quiz terakhir. Disarankan untuk mengulang Bab 2 tentang Besaran dan Satuan."

---

### 5.6 AI Tutor (Chatbot) (Prioritas 3)
**Permasalahan yang diselesaikan:** Keterbatasan akses tutor

**Cara kerja AI:**
Siswa dapat bertanya tentang materi pelajaran kapan saja. Gemini API menjawab dalam konteks mata pelajaran yang sedang dipelajari siswa, dilengkapi dengan:
- Penjelasan bertahap
- Contoh soal pembanding
- Ilustrasi konsep (dalam teks)

---

## 6. ROLE PENGGUNA & BATASAN AKSES

### 6.1 Admin
**Akses:**
- Manajemen semua user (siswa dan guru)
- Tambah/edit/hapus akun
- Reset password user
- Lihat statistik platform keseluruhan
- Monitor penggunaan fitur AI
- Laporan performa platform

**Tidak bisa:**
- Mengerjakan quiz
- Masuk ke kelas sebagai siswa/guru

---

### 6.2 Guru
**Akses:**
- Buat dan kelola kelas sendiri
- Upload materi (PDF, video)
- Generate soal dari materi via AI Quiz Generator
- Edit/hapus soal buatan sendiri
- Monitor progress siswa di kelasnya
- Lihat Early Warning dashboard
- Lihat hasil quiz siswa
- Kirim notifikasi ke siswa

**Tidak bisa:**
- Lihat kelas guru lain
- Akses data siswa di luar kelasnya
- Mengerjakan quiz sebagai siswa

---

### 6.3 Siswa
**Akses:**
- Lihat materi di kelas yang diikuti
- Mengerjakan Adaptive Quiz
- Lihat hasil dan analisis quiz sendiri
- Akses AI Tutor (chat)
- Lihat Learning Path personal
- Lihat progress dan XP sendiri
- Lihat notifikasi dari guru

**Tidak bisa:**
- Lihat data siswa lain
- Upload materi
- Generate soal
- Akses kelas yang tidak diikuti

---

## 7. DESAIN ANTARMUKA (UI/UX)

### 7.1 Identitas Visual
```
Warna Utama    : Purple #7C3AED (Violet-700)
Warna Sekunder : Indigo #4F46E5
Aksen          : Yellow/Amber untuk XP dan streak
Background     : White #FFFFFF / Light Gray #F9FAFB
Text Utama     : Gray-900 #111827
Text Sekunder  : Gray-500 #6B7280
```

### 7.2 Halaman-halaman Aplikasi

**Splash Screen:**
- Background gradient purple
- Logo EduBridge AI + robot emoji 🤖
- Tagline "Belajar Cerdas, Masa Depan Terbuka"
- Tombol "Mulai Belajar"

**Login & Register:**
- White card design dengan shadow
- Input email + password dengan icon
- Role selector untuk register (Siswa / Guru — toggle button)
- Tombol utama warna purple

**Dashboard Siswa:**
- Header: "Halo, [nama]! 👋 Semangat belajar hari ini!"
- 4 Stat Cards (2x2 grid):
  * 📚 Materi Selesai: 12
  * 📊 Rata-rata Nilai: 85%
  * 🔥 Streak Belajar: 7 Hari
  * ⭐ XP Points: 120
- Rekomendasi Belajar (2 kartu materi)
- Mata Pelajaran: Matematika, Fisika, Biologi, Bahasa Inggris
- Bottom Navigation: Dashboard, Quiz, AI Tutor, Progress, Profil

**Quiz Screen:**
- Progress bar + counter "Soal 3 dari 10"
- Timer countdown 07:45
- Teks soal dengan font besar
- 4 pilihan jawaban sebagai kartu (A/B/C/D)
- Tombol Sebelumnya + Selanjutnya
- Indikator difficulty (easy/medium/hard badge)

**AI Tutor Screen:**
- Chat interface ala WhatsApp
- Pesan user: kanan, background purple
- Pesan AI: kiri, background gray
- Input teks + tombol kirim
- Typing indicator saat AI sedang merespons

**Dashboard Guru:**
- Header: "Halo, Bu [nama]! 👋"
- 4 Stat Cards:
  * 🏫 Kelas Diampu: 3
  * 👥 Total Siswa: 90
  * 📈 Rata-rata Nilai: 78%
  * ⚠️ Siswa Perlu Perhatian: 12
- List Siswa Perlu Perhatian dengan badge risiko (merah/kuning)
- Bar chart performa per kelas

### 7.3 Prinsip Aksesibilitas (Sesuai Ketentuan Lomba)
- Kontras warna minimum 4.5:1 (WCAG AA)
- Ukuran font minimum 16sp untuk teks utama
- Touch target minimum 48x48dp
- Label pada semua icon navigasi
- Support dark mode

---

## 8. ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────┐
│         MOBILE APP (React Native)            │
│  Splash → Login → Register                   │
│  Student: Dashboard│Quiz│AI Tutor│Progress   │
│  Teacher: Dashboard│Kelas│Siswa│Materi        │
└──────────────────┬──────────────────────────┘
                   │ REST API (JSON)
                   │ JWT Authentication
┌──────────────────▼──────────────────────────┐
│         BACKEND (Express.js)                 │
│  AuthController   QuizController             │
│  AIController     UploadController           │
│                                              │
│  Services:                                   │
│  AdaptiveQuizService  GeminiService          │
│  EarlyWarningService  LearningPathService    │
│                                              │
│  Cron Job: Early Warning (daily 00:00)       │
└──────┬────────────────┬────────────────┬────┘
       │                │                │
┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│    Neon     │  │  Gemini API │  │ Uploadthing │
│ PostgreSQL  │  │  (AI Layer) │  │  (Storage)  │
└─────────────┘  └─────────────┘  └────────────┘
```

---

## 9. STRUKTUR DATABASE (18 TABEL)

### Tabel Autentikasi (Terpisah per Role)
| Tabel | Kolom Utama | Fungsi |
|---|---|---|
| `admins` | id, name, email, password, phone | Data admin platform |
| `teachers` | id, name, email, password, nip, subject_taught, position | Data guru |
| `students` | id, name, email, password, nisn, grade, date_of_birth, parent_name | Data siswa |

### Tabel Kelas & Materi
| Tabel | Kolom Utama | Fungsi |
|---|---|---|
| `classes` | id, teacher_id, name, subject, grade, code | Kelas yang dibuat guru |
| `class_students` | id, class_id, student_id | Siswa terdaftar di kelas |
| `materials` | id, class_id, title, content, file_url, type | Materi pembelajaran |
| `material_views` | id, material_id, student_id, view_duration | Log siswa membuka materi |
| `ai_generated_materials` | id, uploaded_by, file_url, extracted_text, status | File yang diupload guru untuk generate soal |

### Tabel Quiz
| Tabel | Kolom Utama | Fungsi |
|---|---|---|
| `questions` | id, subject, grade, question_text, options(json), correct_answer, difficulty, topic | Bank soal |
| `quiz_sessions` | id, student_id, score, difficulty_start, difficulty_end, status | Sesi quiz per siswa |
| `quiz_answers` | id, session_id, question_id, student_answer, is_correct, difficulty_at_time | Jawaban per soal |

### Tabel Fitur AI
| Tabel | Kolom Utama | Fungsi |
|---|---|---|
| `student_risk_scores` | id, student_id, risk_score, risk_category, score_drop_factor, login_freq_factor, ai_analysis, ai_recommendation | Skor risiko harian dari Early Warning |
| `learning_paths` | id, student_id, subject, weak_topics(json), strong_topics(json) | Learning path per siswa |
| `learning_path_items` | id, learning_path_id, topic, order_index, status, mastery_score | Item dalam learning path |
| `quiz_error_analyses` | id, student_id, session_id, weak_sub_topics(json), ai_analysis, ai_recommendation | Hasil analisis kesalahan post-quiz |

### Tabel Sistem
| Tabel | Kolom Utama | Fungsi |
|---|---|---|
| `notifications` | id, user_id, type, title, body, data(json), read_at | Notifikasi in-app |
| `login_histories` | id, user_id, ip_address, logged_in_at | Log login (input Early Warning) |

---

## 10. TECH STACK LENGKAP

| Layer | Teknologi | Versi | Fungsi |
|---|---|---|---|
| Mobile | React Native | 0.76+ | Framework mobile cross-platform |
| Mobile Build | Expo | SDK 54 | Development & build tool |
| APK Build | EAS Build | Latest | Cloud build APK untuk Android |
| Backend | Express.js | 4.18 | REST API server |
| Language | TypeScript | 5.1 | Type safety frontend & backend |
| ORM | Prisma | 5.8 | Database access layer |
| Database | Neon PostgreSQL | Latest | Cloud database |
| AI | Gemini API | gemini-1.5-flash | Quiz generation, tutor, analysis |
| Storage | Uploadthing | v6 | Upload PDF/gambar materi |
| Auth | JWT + bcrypt | Latest | Token authentication |
| Navigation | React Navigation | v7 | Screen navigation mobile |
| HTTP Client | Axios | Latest | API calls dari mobile |
| State | AsyncStorage | 2.2.0 | Persistent auth state |
| Charts | React Native Chart Kit | Latest | Visualisasi progress |

---

## 11. API ENDPOINTS

### Authentication
```
POST /api/auth/register    → Daftar akun baru (student/teacher/admin)
POST /api/auth/login       → Login, return JWT token
POST /api/auth/logout      → Logout, invalidate token
GET  /api/auth/me          → Data user yang sedang login
```

### Quiz
```
GET  /api/questions        → Ambil soal berdasarkan subject, grade, difficulty
POST /api/quiz/start       → Mulai sesi quiz baru
POST /api/quiz/answer      → Submit jawaban, return soal berikutnya + difficulty baru
GET  /api/quiz/result/:id  → Hasil quiz + analisis kesalahan
```

### AI
```
POST /api/ai/tutor         → Chat dengan AI Tutor (Gemini)
POST /api/ai/generate-quiz → Generate soal dari teks materi
POST /api/ai/analyze-errors → Analisis pola kesalahan siswa
POST /api/ai/learning-path  → Generate learning path personal
```

### Upload
```
POST /api/upload           → Upload file PDF/PPT (Uploadthing)
```

### Dashboard
```
GET  /api/dashboard/student     → Data dashboard siswa
GET  /api/dashboard/teacher     → Data dashboard guru
GET  /api/early-warning/:classId → Data siswa berisiko per kelas
```

---

## 12. PENGGUNAAN AI SECARA DETAIL

### Gemini API — 4 Use Case Utama

**Use Case 1: Quiz Generator**
```javascript
// Prompt yang dikirim ke Gemini
const prompt = `
Kamu adalah asisten pendidikan Indonesia yang ahli membuat soal.
Berdasarkan materi berikut, buat ${count} soal pilihan ganda.

MATERI:
${extractedText}

KETENTUAN:
- Kelas: ${grade}
- Mata Pelajaran: ${subject}  
- Setiap soal: 4 pilihan (a,b,c,d)
- Satu jawaban benar
- Penjelasan singkat mengapa jawaban itu benar
- Tingkat kesulitan: easy/medium/hard
- Bahasa Indonesia

Format output HANYA JSON array, tidak ada teks lain:
[{"question":"...","options":{"a":"...","b":"...","c":"...","d":"..."},
"correct_answer":"a","explanation":"...","difficulty":"medium",
"topic":"...","sub_topic":"..."}]
`;
```

**Use Case 2: AI Tutor**
```javascript
const prompt = `
Kamu adalah AI Tutor EduBridge yang membantu siswa Indonesia belajar.
Siswa sedang belajar: ${subject} - Kelas ${grade}

Riwayat percakapan:
${conversationHistory}

Pertanyaan siswa: ${studentQuestion}

Jawab dengan:
- Bahasa Indonesia yang mudah dipahami siswa SMA
- Penjelasan bertahap jika konsep kompleks
- Berikan contoh konkret jika relevan
- Jika ada perhitungan, tunjukkan langkah-langkahnya
- Maksimal 200 kata
`;
```

**Use Case 3: Early Warning Analysis**
```javascript
const prompt = `
Analisis data belajar siswa berikut dan berikan rekomendasi:

DATA SISWA:
- Nama: ${student.name}
- Kelas: ${student.grade}
- Risk Score: ${riskScore}/100
- Penurunan nilai 7 hari: ${scoreDropFactor * 100}%
- Frekuensi login: ${loginCount} kali/minggu
- Quiz dilewatkan: ${quizSkipped} kali
- Materi tidak dibuka: ${materialSkipped} item

Berikan:
1. Analisis singkat situasi siswa (2-3 kalimat)
2. Rekomendasi spesifik untuk guru (2-3 poin)
Format: JSON {"analysis":"...","recommendations":["...","...","..."]}
`;
```

**Use Case 4: Error Analysis**
```javascript
const prompt = `
Analisis pola kesalahan siswa berdasarkan data quiz berikut:

KESALAHAN SISWA:
${wrongAnswers.map(a => `- Soal: ${a.question}, Topik: ${a.topic}, 
  Sub-topik: ${a.subTopic}, Jawaban siswa: ${a.studentAnswer}, 
  Jawaban benar: ${a.correctAnswer}`).join('\n')}

Identifikasi:
1. Pola kesalahan yang paling sering terjadi
2. Konsep yang belum dipahami
3. Rekomendasi materi untuk dipelajari ulang
Bahasa Indonesia, maksimal 150 kata.
Format: JSON {"weakTopics":["..."],"analysis":"...","recommendation":"..."}
`;
```

---

## 13. BRANCHING STRATEGY (METODOLOGI AGILE)

```
main          → Production, hanya release final
develop       → Staging, integrasi semua fitur
feature/*     → Development per fitur

Sprint 1: feature/database-setup ✅
          feature/auth-api ✅
Sprint 2: feature/adaptive-quiz
          feature/ai-quiz-generator  
Sprint 3: feature/early-warning
          feature/mobile-ui
Sprint 4: feature/deploy-production
```

**Commit Format:**
```
feat(auth): implement JWT login endpoint
feat(quiz): add adaptive difficulty algorithm
feat(ai): integrate Gemini API for tutor chat
fix(auth): resolve token expiry issue
docs: update API documentation
```

---

## 14. STATUS PENGERJAAN

| Komponen | Status |
|---|---|
| GitHub repo + branching | ✅ Selesai |
| Express.js backend setup | ✅ Selesai |
| Neon PostgreSQL + Prisma | ✅ Selesai |
| JWT Authentication | ✅ Selesai |
| Gemini API config | ✅ Selesai |
| Uploadthing config | ✅ Selesai |
| React Native + Expo setup | ✅ Selesai |
| EAS Build config | ✅ Selesai |
| Semua screen mobile | ✅ Selesai |
| Adaptive Quiz API | 🔄 Dalam pengerjaan |
| AI Quiz Generator API | 🔄 Dalam pengerjaan |
| Early Warning System | 🔄 Dalam pengerjaan |
| Connect mobile ke API | 🔄 Dalam pengerjaan |
| Build APK final | 🔴 Belum |
| Technical Report | 🔴 Belum |

---

## 15. KEWAJIBAN LOMBA

- [ ] GitHub repo public (read-only untuk juri)
- [ ] APK file yang bisa diinstall di Android
- [ ] Surat pernyataan keaslian (PDF ≤2MB, tanda tangan + materai)
- [ ] Technical Report (PDF ≤30 hal, ≤8MB)
  - Nama file: `Software Development_NamaTim_NamaPT.pdf`
- [ ] Aksesibilitas: kontras warna & navigasi jelas
- [ ] Enkripsi password (bcrypt) + Privacy Policy
- [ ] Aset orisinal atau berlisensi bebas
- [ ] Penggunaan AI Generatif diungkapkan di Technical Report

---

*Dokumen ini dibuat untuk keperluan pengembangan dan Technical Report UNITY Competition #14*
*Tim EduBridge AI — Mei 2026*
