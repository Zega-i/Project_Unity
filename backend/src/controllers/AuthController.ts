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
      const validatedData = validateRegisterRequest(req.body);
      const { email, password, name, role, school, nip, subjectTaught } = validatedData;

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
            phone: validatedData.phone || null,
          },
        });
      } else if (role === "TEACHER") {
        user = await prisma.teacher.create({
          data: {
            email,
            password: hashedPassword,
            name,
            nip: nip || null,
            subjectTaught: subjectTaught || null,
            school: school || null,
            phone: validatedData.phone || null,
            position: validatedData.position || null,
          },
        });
      } else {
        user = await prisma.student.create({
          data: {
            email,
            password: hashedPassword,
            name,
            grade: parseInt(validatedData.grade) || 10,
            className: validatedData.className || null,
            school: school || null,
            nisn: validatedData.nisn || null,
            dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
            address: validatedData.address || null,
            parentName: validatedData.parentName || null,
            parentPhone: validatedData.parentPhone || null,
          },
        });
      }

      const token = generateToken(user.id, user.email, role);

      logger.info(`User registered successfully: ${email} (${role})`);

      const response: ApiResponse = {
        success: true,
        data: {
          token,
          user: { 
            id: user.id, email: user.email, name: user.name, role,
            school: user.school, className: user.className, grade: user.grade, dateOfBirth: user.dateOfBirth,
            nip: user.nip, subject: user.subjectTaught
          },
        },
        message: SUCCESS_MESSAGES.REGISTERED,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Registration error detail:', error);
      
      // Handle Prisma unique constraint errors
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'data';
        throw new ApiError(409, `Pendaftaran gagal: ${field} sudah terdaftar`, 'CONFLICT');
      }

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
          user: { 
            id: user.id, email: user.email, name: user.name, role,
            school: user.school, className: user.className, grade: user.grade, dateOfBirth: user.dateOfBirth,
            nip: user.nip, subject: user.subjectTaught
          },
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
          token: '',
          user: {
            id: user.id, email: user.email, name: user.name, role,
            school: user.school, className: user.className, grade: user.grade, dateOfBirth: user.dateOfBirth,
            nip: user.nip, subject: user.subjectTaught
          },
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

  static async changePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, 'Old password, new password, and confirmation are required', 'MISSING_FIELDS');
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, 'New password and confirmation do not match', 'PASSWORD_MISMATCH');
      }

      if (newPassword.length < 8) {
        throw new ApiError(400, 'New password must be at least 8 characters', 'PASSWORD_TOO_SHORT');
      }

      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        throw new ApiError(400, 'Password must contain uppercase, lowercase, number, and special character', 'WEAK_PASSWORD');
      }

      if (oldPassword === newPassword) {
        throw new ApiError(400, 'New password must be different from old password', 'SAME_PASSWORD');
      }

      const role = req.user?.role || '';
      let user: any = null;

      if (role === 'STUDENT') {
        user = await prisma.student.findUnique({ where: { id: req.userId } });
      } else if (role === 'TEACHER') {
        user = await prisma.teacher.findUnique({ where: { id: req.userId } });
      } else if (role === 'ADMIN') {
        user = await prisma.admin.findUnique({ where: { id: req.userId } });
      }

      if (!user) {
        throw new ApiError(404, ERROR_MESSAGES.NOT_FOUND.replace('{resource}', 'User'), 'USER_NOT_FOUND');
      }

      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        throw new ApiError(401, 'Old password is incorrect', 'INVALID_OLD_PASSWORD');
      }

      const hashedPassword = await bcrypt.hash(newPassword, VALIDATION.BCRYPT_ROUNDS);

      if (role === 'STUDENT') {
        await prisma.student.update({
          where: { id: req.userId },
          data: {
            password: hashedPassword,
            passwordUpdatedAt: new Date()
          }
        });
      } else if (role === 'TEACHER') {
        await prisma.teacher.update({
          where: { id: req.userId },
          data: { 
            password: hashedPassword,
            passwordUpdatedAt: new Date()
          }
        });
      } else if (role === 'ADMIN') {
        await prisma.admin.update({
          where: { id: req.userId },
          data: { 
            password: hashedPassword,
            passwordUpdatedAt: new Date()
          }
        });
      }

      logger.info(`Password changed for user: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Change password error', error);
      throw error;
    }
  }
}
