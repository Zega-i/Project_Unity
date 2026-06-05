import { Router } from "express";
import { DiscussionController } from "../controllers/DiscussionController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/class/:classId/discussions", authMiddleware, asyncHandler(DiscussionController.getThreads));
router.post("/class/:classId/discussions", authMiddleware, asyncHandler(DiscussionController.createThread));
router.get("/discussion/:threadId/replies", authMiddleware, asyncHandler(DiscussionController.getReplies));
router.post("/discussion/:threadId/replies", authMiddleware, asyncHandler(DiscussionController.createReply));

export default router;
