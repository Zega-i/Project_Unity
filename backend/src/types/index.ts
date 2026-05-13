// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Quiz Types
export interface QuizStartRequest {
  classId: string;
  questionCount?: number;
}

export interface QuizAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

export interface QuizFinishRequest {
  sessionId: string;
}

// AI Types
export interface TutorChatRequest {
  message: string;
  context?: string;
}

export interface GenerateQuizRequest {
  text: string;
  questionCount?: number;
}

export interface AnalyzeErrorsRequest {
  wrongAnswers: Array<{
    question: string;
    answer: string;
    correct: string;
  }>;
}

// Error Types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}
