import { Router } from "express";
import { AIController } from "../controllers/AIController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/tutor", authMiddleware, asyncHandler(AIController.tutorChat.bind(AIController)));
router.post("/generate-quiz", authMiddleware, asyncHandler(AIController.generateQuiz.bind(AIController)));
router.post("/generate-assignment", authMiddleware, asyncHandler(AIController.generateAssignment.bind(AIController)));
router.post("/analyze-risk", authMiddleware, asyncHandler(AIController.analyzeStudentRisk.bind(AIController)));
router.post("/analyze-errors", authMiddleware, asyncHandler(AIController.analyzeErrors.bind(AIController)));
router.get("/learning-path", authMiddleware, asyncHandler(AIController.getLearningPath.bind(AIController)));
router.post("/generate-lesson-plan", authMiddleware, asyncHandler(AIController.generateLessonPlan.bind(AIController)));

export default router;
