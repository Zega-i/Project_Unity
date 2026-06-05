import { Router } from "express";
import { ProfileController } from "../controllers/ProfileController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Protected routes
router.post("/avatar", authMiddleware, asyncHandler(ProfileController.updateAvatar.bind(ProfileController)));
router.put("/update", authMiddleware, asyncHandler(ProfileController.updateProfile.bind(ProfileController)));
router.put("/preferences", authMiddleware, asyncHandler(ProfileController.updatePreferences.bind(ProfileController)));
router.get("/preferences", authMiddleware, asyncHandler(ProfileController.getPreferences.bind(ProfileController)));

export default router;
