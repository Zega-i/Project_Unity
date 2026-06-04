import axios from 'axios';
import { authStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.15:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (email: string, password: string, name: string, role: string, extra: any = {}) => {
    const response = await api.post('/auth/register', { email, password, name, role, ...extra });
    return response.data.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/profile/update', data);
    return response.data;
  },
  uploadAvatar: async (formData: any) => {
    const response = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const notificationsAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export const quizAPI = {
  startQuiz: async (classId: string, questionCount: number = 5) => {
    const response = await api.post('/quiz/start', { classId, questionCount });
    return response.data;
  },
  answerQuestion: async (sessionId: string, questionId: string, answer: string, timeSpent: number = 30) => {
    const response = await api.post('/quiz/answer', { sessionId, questionId, answer, timeSpent });
    return response.data;
  },
  finishQuiz: async (sessionId: string) => {
    const response = await api.post('/quiz/finish', { sessionId });
    return response.data;
  },
};

export const aiAPI = {
  tutorChat: async (message: string, context?: any) => {
    const response = await api.post('/ai/tutor', { message, context });
    return response.data;
  },
  generateQuiz: async (text: string, questionCount: number = 5, materialId?: string) => {
    const response = await api.post('/ai/generate-quiz', { text, questionCount, materialId });
    return response.data;
  },
  generateAssignment: async (text: string, materialId?: string) => {
    const response = await api.post('/ai/generate-assignment', { text, materialId });
    return response.data;
  },
  analyzeRisk: async (studentId: string, name: string, avgScore: number) => {
    const response = await api.post('/ai/analyze-risk', { studentId, name, avgScore });
    return response.data;
  },
  analyzeErrors: async (wrongAnswers: any[]) => {
    const response = await api.post('/ai/analyze-errors', { wrongAnswers });
    return response.data;
  },
  getLearningPath: async () => {
    const response = await api.get('/ai/learning-path');
    return response.data;
  },
  generateLessonPlan: async (text: string, materialId?: string) => {
    const response = await api.post('/ai/generate-lesson-plan', { text, materialId });
    return response.data;
  },
};

export const classAPI = {
  getMyClasses: async () => {
    const response = await api.get('/class/my-classes');
    return response.data;
  },
  joinClass: async (code: string) => {
    const response = await api.post('/class/join', { code });
    return response.data;
  },
  getClassDetail: async (classId: string) => {
    const response = await api.get(`/class/${classId}`);
    return response.data;
  },
  getClassAssignments: async (classId: string) => {
    const response = await api.get(`/class/${classId}/assignments`);
    return response.data;
  },
  getClassQuizzes: async (classId: string) => {
    const response = await api.get(`/class/${classId}/quizzes`);
    return response.data;
  },
};

export const progressAPI = {
  getMyProgress: async () => {
    const response = await api.get('/progress/me');
    return response.data;
  },
  getCompletedMaterials: async () => {
    const response = await api.get('/progress/completed-materials');
    return response.data;
  },
  getQuizHistory: async () => {
    const response = await api.get('/progress/quiz-history');
    return response.data;
  },
  markAsCompleted: async (materialId: string) => {
    const response = await api.post('/progress/complete', { materialId });
    return response.data;
  },
  submitQuizResult: async (data: { classId: string; quizId?: string; score: number; totalQuestions: number; correctAnswers: number }) => {
    const response = await api.post('/progress/quiz-result', data);
    return response.data;
  },
  getQuizResults: async (classId: string) => {
    const response = await api.get(`/progress/quiz-results/${classId}`);
    return response.data;
  },
};

export const teacherAPI = {
  getMyClasses: async () => {
    const response = await api.get('/teacher/my-classes');
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/teacher/dashboard');
    return response.data.data;
  },
  addMaterial: async (classId: string, data: { title: string; description: string; fileUrl?: string; type?: string; fileBase64?: string; fileName?: string }) => {
    const response = await api.post(`/teacher/class/${classId}/material`, data);
    return response.data;
  },
  updateMaterial: async (materialId: string, data: { title: string; description: string }) => {
    const response = await api.put(`/teacher/material/${materialId}`, data);
    return response.data;
  },
  deleteMaterial: async (materialId: string) => {
    const response = await api.delete(`/teacher/material/${materialId}`);
    return response.data;
  },
  addAssignment: async (classId: string, data: { title: string; description: string; deadline: string; points: number }) => {
    const response = await api.post(`/teacher/class/${classId}/assignment`, data);
    return response.data;
  },
  deleteAssignment: async (assignmentId: string) => {
    const response = await api.delete(`/teacher/assignment/${assignmentId}`);
    return response.data;
  },
  getClassStudents: async (classId: string) => {
    const response = await api.get(`/teacher/class/${classId}/students`);
    return response.data.data;
  },
  getClassMaterials: async (classId: string) => {
    const response = await api.get(`/teacher/class/${classId}/materials`);
    return response.data;
  },
  createClass: async (data: { name: string; level: string; schedule: string; description: string; token: string }) => {
    const response = await api.post('/teacher/class', data);
    return response.data;
  },
  archiveClass: async (classId: string, archived: boolean) => {
    const response = await api.put(`/teacher/class/${classId}/archive`, { archived });
    return response.data;
  },
  getClassAssignments: async (classId: string) => {
    const response = await api.get(`/teacher/class/${classId}/assignments`);
    return response.data;
  },
  getClassQuizzes: async (classId: string) => {
    const response = await api.get(`/teacher/class/${classId}/quizzes`);
    return response.data;
  },
  addQuiz: async (classId: string, data: { title: string; duration: string; questions: any[]; shuffle?: boolean; showResult?: boolean; autoGrade?: boolean }) => {
    const response = await api.post(`/teacher/class/${classId}/quiz`, data);
    return response.data;
  },
  deleteQuiz: async (quizId: string) => {
    const response = await api.delete(`/teacher/quiz/${quizId}`);
    return response.data;
  },
  getAllStudents: async () => {
    const response = await api.get('/teacher/students');
    return response.data;
  },
  getStudentPerformance: async (studentId: string, kelas?: string) => {
    const response = await api.get(`/teacher/student/${studentId}/performance`, {
      params: { kelas }
    });
    return response.data;
  },
};

export default api;