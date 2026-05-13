import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Public routes
router.post("/register", asyncHandler(AuthController.register.bind(AuthController)));
router.post("/login", asyncHandler(AuthController.login.bind(AuthController)));

// Protected routes
router.get("/me", authMiddleware, asyncHandler(AuthController.me.bind(AuthController)));
router.post("/logout", authMiddleware, asyncHandler(AuthController.logout.bind(AuthController)));

export default router;
