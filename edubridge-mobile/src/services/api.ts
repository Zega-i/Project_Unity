import axios from 'axios';
import { authStore } from '../store/authStore';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (email: string, password: string, name: string, role: string) => {
    const response = await api.post('/auth/register', { email, password, name, role });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const quizAPI = {
  startQuiz: async (classId: string, questionCount: number = 5) => {
    const response = await api.post('/quiz/start', { classId, questionCount });
    return response.data;
  },
  answerQuestion: async (sessionId: string, questionId: string, answer: string) => {
    const response = await api.post('/quiz/answer', { sessionId, questionId, answer });
    return response.data;
  },
  finishQuiz: async (sessionId: string) => {
    const response = await api.post('/quiz/finish', { sessionId });
    return response.data;
  },
};

export const aiAPI = {
  tutorChat: async (message: string, context?: string) => {
    const response = await api.post('/ai/tutor', { message, context });
    return response.data;
  },
  generateQuiz: async (text: string, questionCount: number = 5) => {
    const response = await api.post('/ai/generate-quiz', { text, questionCount });
    return response.data;
  },
};

export default api;