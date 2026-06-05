import { Router, Request, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiResponse } from "../types";
import { logger } from "../utils/logger";

const router = Router();

router.post("/upload", authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
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

router.post("/log", asyncHandler(async (req: Request, res: Response) => {
  const { message, error } = req.body;
  const fs = require('fs');
  fs.appendFileSync('client-debug.log', `[${new Date().toISOString()}] CLIENT LOG: ${message}\nError: ${JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2)}\n\n`);
  logger.info(`CLIENT LOG: ${message} - ${JSON.stringify(error)}`);
  res.json({ success: true });
}));

export default router;
