import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiResponse } from "../types";
import { logger } from "../utils/logger";

const router = Router();

router.post("/upload", authMiddleware, asyncHandler(async (req, res) => {
  logger.info("Upload endpoint called");

  const response: ApiResponse = {
    success: true,
    data: {
      message: "Upload endpoint ready",
      hint: "Configure Uploadthing SDK"
    },
    message: "Upload endpoint siap digunakan",
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

export default router;
