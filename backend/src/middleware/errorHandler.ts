import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorResponse } from '../types';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();

  // Handle ApiError
  if (error instanceof ApiError) {
    logger.warn(`API Error [${error.statusCode}]`, {
      message: error.message,
      code: error.code,
      path: req.path,
      method: req.method,
    });

    const response: ErrorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp,
    };

    return res.status(error.statusCode).json(response);
  }

  // Handle Validation Error (from express-validator or similar)
  if (error.name === 'ValidationError') {
    logger.warn('Validation Error', {
      message: error.message,
      path: req.path,
    });

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      timestamp,
    });
  }

  // Handle Database Errors (Prisma)
  if (error.name === 'PrismaClientKnownRequestError' || (error as any).code?.startsWith('P')) {
    logger.error('Database Error', error);
    const prismaError = error as any;
    let msg = ERROR_MESSAGES.DATABASE_ERROR;

    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'Data';
      msg = `${field} sudah digunakan oleh akun lain`;
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: msg,
      code: 'DATABASE_ERROR',
      timestamp,
    });
  }

  // Handle JWT Errors
  if (error.name === 'JsonWebTokenError') {
    logger.warn('JWT Error', error.message);

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_INVALID,
      code: 'TOKEN_INVALID',
      timestamp,
    });
  }

  if (error.name === 'TokenExpiredError') {
    logger.warn('Token Expired');

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
      code: 'TOKEN_EXPIRED',
      timestamp,
    });
  }

  // Handle Syntax Errors (JSON parsing)
  if (error instanceof SyntaxError && 'body' in error) {
    logger.warn('JSON Parse Error', error.message);

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
      timestamp,
    });
  }

  // Unknown error
  logger.error('Unexpected Error', error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_SERVER_ERROR',
    timestamp,
  });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
