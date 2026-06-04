import { Router } from "express";
import { ProgressController } from "../controllers/ProgressController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/me", authMiddleware, asyncHandler(ProgressController.getMyProgress));
router.get("/completed-materials", authMiddleware, asyncHandler(ProgressController.getCompletedMaterials));
router.post("/complete", authMiddleware, asyncHandler(ProgressController.markAsCompleted));
router.post("/quiz-result", authMiddleware, asyncHandler(ProgressController.submitQuizResult));
router.get("/quiz-results/:classId", authMiddleware, asyncHandler(ProgressController.getQuizResults));

export default router;
