// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Quiz Types
export interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'TRUE_FALSE' | 'ESSAY';
  options: string[];
  difficulty: number;
}

export interface QuizSession {
  id: string;
  studentId: string;
  classId: string;
  startedAt: string;
  endedAt?: string;
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export interface QuizAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Material Types
export interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'VIDEO' | 'ARTICLE' | 'INTERACTIVE' | 'EXERCISE';
  url?: string;
  aiGenerated: boolean;
}

// Student Stats
export interface StudentStats {
  materialsCompleted: number;
  averageScore: number;
  learningStreak: number;
  xpPoints: number;
}

// Teacher Stats
export interface TeacherStats {
  classesManaged: number;
  totalStudents: number;
  averageClassScore: number;
  atRiskCount: number;
}

// At-Risk Student
export interface AtRiskStudent {
  id: string;
  name: string;
  className: string;
  riskPercentage: number;
}

// Loading State
export interface LoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

// Navigation Params
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  StudentTabs: undefined;
  TeacherTabs: undefined;
};

export type StudentTabParamList = {
  StudentDashboard: undefined;
  Quiz: undefined;
  AITutor: undefined;
  Progress: undefined;
  StudentProfile: undefined;
};

export type TeacherTabParamList = {
  TeacherDashboard: undefined;
  TeacherProfile: undefined;
};
