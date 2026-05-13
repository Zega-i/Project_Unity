import { Router } from "express";
import { ClassController } from "../controllers/ClassController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/my-classes", authMiddleware, ClassController.getMyClasses);
router.post("/join", authMiddleware, ClassController.joinByCode);
router.get("/:id", authMiddleware, ClassController.getClassDetail);

export default router;
