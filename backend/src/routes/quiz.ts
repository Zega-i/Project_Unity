import { Router } from "express";
import { QuizController } from "../controllers/QuizController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/start", authMiddleware, asyncHandler(QuizController.startQuiz.bind(QuizController)));
router.post("/answer", authMiddleware, asyncHandler(QuizController.answerQuestion.bind(QuizController)));
router.post("/finish", authMiddleware, asyncHandler(QuizController.finishQuiz.bind(QuizController)));

export default router;
