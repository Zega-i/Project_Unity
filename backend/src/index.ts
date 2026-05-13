import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import quizRoutes from "./routes/quiz";
import aiRoutes from "./routes/ai";
import uploadRoutes from "./routes/upload";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`EduBridge backend running on http://localhost:$${PORT}`);
  console.log(`Environment: $${process.env.NODE_ENV || "development"}`);
});
