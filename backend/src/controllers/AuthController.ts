import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { generateToken, AuthRequest } from "../middleware/auth";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || "STUDENT",
        },
      });

      const token = generateToken(user.id, user.email, user.role);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: req.ip,
          userAgent: req.get("user-agent"),
        },
      });

      const token = generateToken(user.id, user.email, user.role);

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    res.json({ message: "Logout successful" });
  }
}
