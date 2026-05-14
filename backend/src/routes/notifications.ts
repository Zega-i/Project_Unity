import { Router } from "express";
import { NotificationsController } from "../controllers/NotificationsController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Protected routes
router.get("/", authMiddleware, asyncHandler(NotificationsController.getNotifications.bind(NotificationsController)));
router.post("/mark-read", authMiddleware, asyncHandler(NotificationsController.markAsRead.bind(NotificationsController)));
router.post("/mark-all-read", authMiddleware, asyncHandler(NotificationsController.markAllAsRead.bind(NotificationsController)));
router.post("/delete", authMiddleware, asyncHandler(NotificationsController.deleteNotification.bind(NotificationsController)));

export default router;
