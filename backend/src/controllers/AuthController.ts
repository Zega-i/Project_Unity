import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { generateToken, AuthRequest } from "../middleware/auth";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      // Check uniqueness across ALL tables
      const student = await prisma.student.findUnique({ where: { email } });
      const teacher = await prisma.teacher.findUnique({ where: { email } });
      const admin = await prisma.admin.findUnique({ where: { email } });

      if (student || teacher || admin) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let user;

      if (role === "ADMIN") {
        user = await prisma.admin.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone: req.body.phone
          },
        });
      } else if (role === "TEACHER") {
        user = await prisma.teacher.create({
          data: {
            email,
            password: hashedPassword,
            name,
            nip: req.body.nip,
            subjectTaught: req.body.subjectTaught,
            phone: req.body.phone,
            position: req.body.position
          },
        });
      } else {
        user = await prisma.student.create({
          data: {
            email,
            password: hashedPassword,
            name,
            grade: req.body.grade || 10,
            nisn: req.body.nisn,
            dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
            address: req.body.address,
            parentName: req.body.parentName,
            parentPhone: req.body.parentPhone
          },
        });
      }

      const token = generateToken(user.id, user.email, role || "STUDENT");

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: user.id, email: user.email, name: user.name, role: role || "STUDENT" },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      let user: any = null;
      let role = "";

      // Try each table sequentially
      user = await prisma.student.findUnique({ where: { email } });
      if (user) {
        role = "STUDENT";
      } else {
        user = await prisma.teacher.findUnique({ where: { email } });
        if (user) {
          role = "TEACHER";
        } else {
          user = await prisma.admin.findUnique({ where: { email } });
          if (user) {
            role = "ADMIN";
          }
        }
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (role === "STUDENT") {
        await prisma.loginHistory.create({
          data: {
            studentId: user.id,
            ip: req.ip,
            userAgent: req.get("user-agent"),
          },
        });
      }

      const token = generateToken(user.id, user.email, role);

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, name: user.name, role },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.userId || !req.user?.role) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let user: any = null;
      const role = req.user.role;

      if (role === "STUDENT") {
        user = await prisma.student.findUnique({ where: { id: req.userId } });
      } else if (role === "TEACHER") {
        user = await prisma.teacher.findUnique({ where: { id: req.userId } });
      } else if (role === "ADMIN") {
        user = await prisma.admin.findUnique({ where: { id: req.userId } });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: { id: user.id, email: user.email, name: user.name, role },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    res.json({ message: "Logout successful" });
  }
}
