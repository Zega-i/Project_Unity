import { VALIDATION, ERROR_MESSAGES } from '../constants';
import { ApiError } from '../types';

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(422, message, 'VALIDATION_ERROR');
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    return 'Password terlalu panjang';
  }
  return null;
};

export const validateName = (name: string): string | null => {
  if (name.length < VALIDATION.NAME_MIN_LENGTH) {
    return 'Nama terlalu pendek';
  }
  if (name.length > VALIDATION.NAME_MAX_LENGTH) {
    return 'Nama terlalu panjang';
  }
  return null;
};

export const validateEmail2 = (email: string): string | null => {
  if (!email) {
    return 'Email harus diisi';
  }
  if (email.length > VALIDATION.EMAIL_MAX_LENGTH) {
    return 'Email terlalu panjang';
  }
  if (!validateEmail(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

export const validateRole = (role: string): string | null => {
  const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
  if (!validRoles.includes(role)) {
    return ERROR_MESSAGES.INVALID_ROLE;
  }
  return null;
};

export const validateRegisterRequest = (body: any) => {
  const { email, password, name, role } = body;

  // Validate presence
  if (!email) throw new ValidationError('Email wajib diisi');
  if (!password) throw new ValidationError('Password wajib diisi');
  if (!name) throw new ValidationError('Nama wajib diisi');
  if (!role) throw new ValidationError('Role wajib diisi');

  // Validate format
  const emailError = validateEmail2(email);
  if (emailError) throw new ValidationError(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) throw new ValidationError(passwordError);

  const nameError = validateName(name);
  if (nameError) throw new ValidationError(nameError);

  const roleError = validateRole(role);
  if (roleError) throw new ValidationError(roleError);

  return { email, password, name, role };
};

export const validateLoginRequest = (body: any) => {
  const { email, password } = body;

  if (!email) throw new ValidationError('Email wajib diisi');
  if (!password) throw new ValidationError('Password wajib diisi');

  const emailError = validateEmail2(email);
  if (emailError) throw new ValidationError(emailError);

  return { email, password };
};

export const validateQuizStartRequest = (body: any) => {
  const { classId, questionCount } = body;

  if (!classId) throw new ValidationError('classId wajib diisi');

  const qCount = questionCount || 5;
  if (qCount < 1 || qCount > 50) {
    throw new ValidationError('Jumlah soal harus antara 1-50');
  }

  return { classId, questionCount: qCount };
};

export const validateAnswerQuestionRequest = (body: any) => {
  const { sessionId, questionId, answer } = body;

  if (!sessionId) throw new ValidationError('sessionId wajib diisi');
  if (!questionId) throw new ValidationError('questionId wajib diisi');
  if (answer === undefined || answer === null || answer === '') {
    throw new ValidationError('Jawaban wajib diisi');
  }

  return { sessionId, questionId, answer };
};

export const validateFinishQuizRequest = (body: any) => {
  const { sessionId } = body;

  if (!sessionId) throw new ValidationError('sessionId wajib diisi');

  return { sessionId };
};

export const validateTutorChatRequest = (body: any) => {
  const { message, context } = body;

  if (!message) throw new ValidationError('Pesan wajib diisi');
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new ValidationError('Pesan tidak boleh kosong');
  }
  if (message.length > 5000) {
    throw new ValidationError('Pesan terlalu panjang (max 5000 karakter)');
  }

  return { message: message.trim(), context };
};

export const validateGenerateQuizRequest = (body: any) => {
  const { text, questionCount } = body;

  if (!text) throw new ValidationError('Teks wajib diisi');
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new ValidationError('Teks tidak boleh kosong');
  }
  if (text.length < 10) {
    throw new ValidationError(ERROR_MESSAGES.INSUFFICIENT_TEXT);
  }
  if (text.length > 50000) {
    throw new ValidationError('Teks terlalu panjang (max 50000 karakter)');
  }

  const qCount = questionCount || 5;
  if (qCount < 1 || qCount > 50) {
    throw new ValidationError('Jumlah soal harus antara 1-50');
  }

  return { text: text.trim(), questionCount: qCount };
};

export const validateAnalyzeErrorsRequest = (body: any) => {
  const { wrongAnswers } = body;

  if (!wrongAnswers) throw new ValidationError('wrongAnswers wajib diisi');
  if (!Array.isArray(wrongAnswers)) {
    throw new ValidationError('wrongAnswers harus berupa array');
  }
  if (wrongAnswers.length === 0) {
    throw new ValidationError('wrongAnswers tidak boleh kosong');
  }

  return { wrongAnswers };
};
