import { Router } from "express";
import { NotificationsController } from "../controllers/NotificationsController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Protected routes
router.get("/", authMiddleware, asyncHandler(NotificationsController.getNotifications.bind(NotificationsController)));
router.post("/:id/read", authMiddleware, asyncHandler(NotificationsController.markAsRead.bind(NotificationsController)));
router.post("/read-all", authMiddleware, asyncHandler(NotificationsController.markAllAsRead.bind(NotificationsController)));
router.delete("/:id", authMiddleware, asyncHandler(NotificationsController.deleteNotification.bind(NotificationsController)));

export default router;
