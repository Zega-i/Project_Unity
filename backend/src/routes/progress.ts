import { Router } from "express";
import { ProgressController } from "../controllers/ProgressController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/me", authMiddleware, ProgressController.getMyProgress);
router.post("/complete", authMiddleware, ProgressController.markAsCompleted);

export default router;
