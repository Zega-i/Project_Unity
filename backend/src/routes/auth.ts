import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Public routes
router.post("/register", asyncHandler(AuthController.register.bind(AuthController)));
router.post("/login", asyncHandler(AuthController.login.bind(AuthController)));
router.post("/forgot-password", asyncHandler(AuthController.forgotPassword.bind(AuthController)));

router.post("/test-email", asyncHandler(async (req: Request, res: Response) => {
  try {
    const to = req.body.to || "edubridge56@gmail.com";
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    if (!user || !pass) {
      return res.status(400).json({
        success: false,
        error: "Credentials missing in process.env",
        envUser: !!user,
        envPass: !!pass,
      });
    }

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.verify();
    
    await transporter.sendMail({
      from: `"EduBridge" <${user}>`,
      to,
      subject: "Test Connection from Live Server",
      html: "<p>SMTP Connection test from live Railway server succeeded!</p>",
    });

    res.json({
      success: true,
      message: "Test email sent successfully via SMTP from production server",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
}));

// Protected routes
router.get("/me", authMiddleware, asyncHandler(AuthController.me.bind(AuthController)));
router.post("/logout", authMiddleware, asyncHandler(AuthController.logout.bind(AuthController)));
router.post("/change-password", authMiddleware, asyncHandler(AuthController.changePassword.bind(AuthController)));

export default router;
