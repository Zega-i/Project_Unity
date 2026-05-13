import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/upload", authMiddleware, (req, res) => {
  res.json({ message: "Upload endpoint ready", hint: "Configure Uploadthing SDK" });
});

export default router;
