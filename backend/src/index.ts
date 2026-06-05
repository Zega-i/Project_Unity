import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import quizRoutes from "./routes/quiz";
import aiRoutes from "./routes/ai";
import uploadRoutes from "./routes/upload";
import classRoutes from "./routes/class";
import progressRoutes from "./routes/progress";
import profileRoutes from "./routes/profile";
import notificationsRoutes from "./routes/notifications";
import teacherRoutes from "./routes/teacher";
import discussionRoutes from "./routes/discussion";

import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { ApiResponse } from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health Check
app.get("/health", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: "Server is running",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/class", classRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api", discussionRoutes);

// Privacy Policy Page
app.get("/api/privacy", (req: Request, res: Response) => {
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kebijakan Privasi - EduBridge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #7C3AED;
      --primary-hover: #6D28D9;
      --text-main: #1F2937;
      --text-muted: #4B5563;
      --bg-main: #FAFAF9;
      --bg-card: #FFFFFF;
      --border: #E5E7EB;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text-main);
      background-color: var(--bg-main);
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background-color: var(--bg-card);
      border-radius: 24px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #111827;
    }
    .date {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-top: 32px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p, li {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    ul {
      padding-left: 20px;
      margin-bottom: 24px;
    }
    li {
      margin-bottom: 8px;
    }
    .contact-card {
      background-color: #F5F3FF;
      border: 1px solid #DDD6FE;
      border-radius: 16px;
      padding: 24px;
      margin-top: 40px;
    }
    .contact-card h3 {
      margin: 0 0 12px 0;
      color: var(--primary);
      font-size: 16px;
      font-weight: 700;
    }
    .btn-container {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 30px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-primary {
      background-color: var(--primary);
      color: #FFFFFF;
      border: none;
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
    }
    .btn-secondary {
      background-color: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background-color: #F9FAFB;
    }
    @media print {
      body {
        background-color: #FFFFFF;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
      }
      .btn-container {
        display: none;
      }
    }
    @media (max-width: 640px) {
      .container {
        margin: 20px 16px;
        padding: 24px;
      }
      .btn-container {
        flex-direction: column;
      }
      .btn {
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">EduBridge</div>
      <h1 class="title">Kebijakan Privasi</h1>
      <div class="date">Terakhir Diperbarui: 14 Mei 2026</div>
    </div>

    <p>Selamat datang di EduBridge. Kami berkomitmen untuk melindungi informasi pribadi Anda dan hak privasi Anda. Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan kami atau praktik kami sehubungan dengan informasi pribadi Anda, silakan hubungi kami di edubridge56@gmail.com.</p>

    <h2>1. Informasi yang Kami Kumpulkan</h2>
    <p>Kami mengumpulkan informasi pribadi yang Anda berikan kepada kami secara sukarela saat mendaftar di aplikasi, seperti:</p>
    <ul>
      <li><strong>Informasi Identitas:</strong> Nama lengkap, alamat email, dan kata sandi yang dienkripsi.</li>
      <li><strong>Informasi Akademik:</strong> Sekolah asal, tingkat kelas, peran (Siswa atau Guru), dan data prestasi.</li>
      <li><strong>Aktivitas Belajar:</strong> Modul yang Anda pelajari, skor kuis, dan interaksi Anda dengan AI Tutor.</li>
      <li><strong>Informasi Perangkat:</strong> Alamat IP, jenis perangkat, sistem operasi, dan log aktivitas untuk keamanan sistem.</li>
    </ul>

    <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
    <p>Kami menggunakan informasi yang dikumpulkan melalui aplikasi untuk berbagai tujuan bisnis dan pembelajaran, termasuk:</p>
    <ul>
      <li>Menyediakan, mengoperasikan, dan memelihara aplikasi belajar EduBridge.</li>
      <li>Meningkatkan, mempersonalisasi, dan mengembangkan fitur-fitur baru di EduBridge.</li>
      <li>Menganalisis performa belajar siswa untuk memberikan rekomendasi belajar AI yang akurat.</li>
      <li>Mengirimkan notifikasi penting mengenai kelas, tugas, kuis, atau pembaruan akun.</li>
      <li>Mencegah aktivitas penipuan, menjaga keamanan sistem, dan mendeteksi kesalahan teknis.</li>
    </ul>

    <h2>3. Keamanan Data Anda</h2>
    <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang dirancang untuk melindungi keamanan informasi pribadi apa pun yang kami proses. Kami menggunakan enkripsi HTTPS/SSL untuk transfer data dan menyimpan kata sandi menggunakan hash satu arah yang aman. Namun, perlu diingat bahwa tidak ada transmisi internet yang 100% aman.</p>

    <h2>4. Hak Privasi Anda</h2>
    <p>Sesuai dengan peraturan privasi yang berlaku, Anda memiliki hak-hak berikut:</p>
    <ul>
      <li><strong>Hak Mengakses:</strong> Meminta salinan data pribadi Anda yang kami simpan.</li>
      <li><strong>Hak Mengubah:</strong> Memperbarui atau memperbaiki data pribadi Anda jika tidak akurat.</li>
      <li><strong>Hak Menghapus:</strong> Meminta kami menghapus akun dan seluruh data pribadi Anda dari database kami.</li>
      <li><strong>Hak Portabilitas:</strong> Meminta pemindahan data Anda ke layanan lain dalam format terstruktur.</li>
    </ul>

    <h2>5. Hubungi Kami</h2>
    <p>Jika Anda memiliki pertanyaan atau komentar tentang kebijakan ini, Anda dapat menghubungi kami melalui:</p>
    
    <div class="contact-card">
      <h3>Tim Privasi & Keamanan EduBridge</h3>
      <p style="margin: 0 0 8px 0;">📬 <strong>Alamat:</strong> Jl. Pendidikan No. 123, Jakarta, Indonesia</p>
      <p style="margin: 0 0 8px 0;">📧 <strong>Email:</strong> edubridge56@gmail.com</p>
      <p style="margin: 0;">📞 <strong>Telepon:</strong> (021) 1234-5678</p>
    </div>

    <div class="btn-container">
      <button class="btn btn-primary" onclick="window.print()">Simpan / Cetak (PDF)</button>
      <a href="mailto:edubridge56@gmail.com" class="btn btn-secondary">Hubungi Tim Privasi</a>
    </div>
  </div>
</body>
</html>
`);
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Server Startup
const server = app.listen(PORT, () => {
  logger.info(`🚀 EduBridge backend running`);
  logger.info(`📍 URL: http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`✅ Server ready for requests`);
});

// Graceful Shutdown
process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// Unhandled rejection handler
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection", reason);
  process.exit(1);
});
