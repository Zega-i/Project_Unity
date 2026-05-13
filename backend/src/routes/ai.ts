import { Router } from "express";
import { AIController } from "../controllers/AIController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/tutor", authMiddleware, asyncHandler(AIController.tutorChat.bind(AIController)));
router.post("/generate-quiz", authMiddleware, asyncHandler(AIController.generateQuiz.bind(AIController)));
router.post("/analyze-errors", authMiddleware, asyncHandler(AIController.analyzeErrors.bind(AIController)));

export default router;
