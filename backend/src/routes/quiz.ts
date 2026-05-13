import { Router } from "express";
import { QuizController } from "../controllers/QuizController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/start", authMiddleware, QuizController.startQuiz);
router.post("/answer", authMiddleware, QuizController.answerQuestion);
router.post("/finish", authMiddleware, QuizController.finishQuiz);

export default router;
