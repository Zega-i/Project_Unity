import { Router } from "express";
import { AIController } from "../controllers/AIController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/tutor", authMiddleware, AIController.tutorChat);
router.post("/generate-quiz", authMiddleware, AIController.generateQuiz);
router.post("/analyze-errors", authMiddleware, AIController.analyzeErrors);

export default router;
