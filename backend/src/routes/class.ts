import { Router } from "express";
import { ClassController } from "../controllers/ClassController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/my-classes", authMiddleware, asyncHandler(ClassController.getMyClasses));
router.post("/join", authMiddleware, asyncHandler(ClassController.joinByCode));
router.get("/:id/assignments", authMiddleware, asyncHandler(ClassController.getClassAssignments));
router.get("/:id/quizzes", authMiddleware, asyncHandler(ClassController.getClassQuizzes));
router.get("/:id", authMiddleware, asyncHandler(ClassController.getClassDetail));

export default router;
