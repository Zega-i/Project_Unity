import { Router } from "express";
import { TeacherController } from "../controllers/TeacherController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/dashboard", authMiddleware, asyncHandler(TeacherController.getDashboardStats));
router.post("/class", authMiddleware, asyncHandler(TeacherController.createClass));
router.post("/class/:classId/material", authMiddleware, asyncHandler(TeacherController.addMaterial));
router.post("/class/:classId/assignment", authMiddleware, asyncHandler(TeacherController.addAssignment));
router.post("/class/:classId/quiz", authMiddleware, asyncHandler(TeacherController.addQuiz));
router.get("/class/:classId/materials", authMiddleware, asyncHandler(TeacherController.getClassMaterials));
router.get("/class/:classId/students", authMiddleware, asyncHandler(TeacherController.getClassStudents));
router.get("/class/:classId/assignments", authMiddleware, asyncHandler(TeacherController.getClassAssignments));
router.get("/class/:classId/quizzes", authMiddleware, asyncHandler(TeacherController.getClassQuizzes));
router.get("/students", authMiddleware, asyncHandler(TeacherController.getAllStudents));

export default router;
