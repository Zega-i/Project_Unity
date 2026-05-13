import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { generateToken, AuthRequest } from "../middleware/auth";
import { ApiResponse, ApiError } from "../types";
import { validateRegisterRequest, validateLoginRequest } from "../utils/validation";
import { logger } from "../utils/logger";
import { SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION } from "../constants";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      // Validate request
      const { email, password, name, role } = validateRegisterRequest(req.body);

      // Check uniqueness across ALL tables
      const [student, teacher, admin] = await Promise.all([
        prisma.student.findUnique({ where: { email } }),
        prisma.teacher.findUnique({ where: { email } }),
        prisma.admin.findUnique({ where: { email } }),
      ]);

      if (student || teacher || admin) {
        logger.warn(`Registration attempt with existing email: ${email}`);
        throw new ApiError(409, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 'EMAIL_EXISTS');
      }

      const hashedPassword = await bcrypt.hash(password, VALIDATION.BCRYPT_ROUNDS);
      let user: any;

      if (role === "ADMIN") {
        user = await prisma.admin.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone: req.body.phone || null,
          },
        });
      } else if (role === "TEACHER") {
        user = await prisma.teacher.create({
          data: {
            email,
            password: hashedPassword,
            name,
            nip: req.body.nip || null,
            subjectTaught: req.body.subjectTaught || null,
            phone: req.body.phone || null,
            position: req.body.position || null,
          },
        });
      } else {
        user = await prisma.student.create({
          data: {
            email,
            password: hashedPassword,
            name,
            grade: parseInt(req.body.grade) || 10,
            nisn: req.body.nisn || null,
            dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
            address: req.body.address || null,
            parentName: req.body.parentName || null,
            parentPhone: req.body.parentPhone || null,
          },
        });
      }

      const token = generateToken(user.id, user.email, role);

      logger.info(`User registered successfully: ${email} (${role})`);

      const response: ApiResponse = {
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email, name: user.name, role },
        },
        message: SUCCESS_MESSAGES.REGISTERED,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error', error);
      throw error;
    }
  }

  static async login(req: Request, res: Response) {
    try {
      // Validate request
      const { email, password } = validateLoginRequest(req.body);

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
        logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        logger.warn(`Failed login attempt for: ${email}`);
        throw new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
      }

      // Log login history
      if (role === "STUDENT") {
        await prisma.loginHistory.create({
          data: {
            studentId: user.id,
            ip: req.ip || "unknown",
            userAgent: req.get("user-agent") || undefined,
          },
        });
      }

      const token = generateToken(user.id, user.email, role);

      logger.info(`User logged in successfully: ${email} (${role})`);

      const response: ApiResponse = {
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email, name: user.name, role },
        },
        message: SUCCESS_MESSAGES.LOGGED_IN,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.userId || !req.user?.role) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
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
        throw new ApiError(404, ERROR_MESSAGES.NOT_FOUND.replace('{resource}', 'User'), 'USER_NOT_FOUND');
      }

      logger.info(`Profile retrieved for: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        data: {
          user: { id: user.id, email: user.email, name: user.name, role },
        },
        message: SUCCESS_MESSAGES.PROFILE_RETRIEVED,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Profile retrieval error', error);
      throw error;
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    try {
      logger.info(`User logged out: ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: SUCCESS_MESSAGES.LOGGED_OUT,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Logout error', error);
      throw error;
    }
  }
}
