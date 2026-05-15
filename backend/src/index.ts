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
