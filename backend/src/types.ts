import { Request } from "express";

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  code?: string;
}

export class ApiError extends Error {
  public code?: string;
  
  constructor(public statusCode: number, public message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
