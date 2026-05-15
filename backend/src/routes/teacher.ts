import { Router } from "express";
import { TeacherController } from "../controllers/TeacherController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/dashboard", authMiddleware, TeacherController.getDashboardStats);

export default router;
