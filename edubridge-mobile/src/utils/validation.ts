import { VALIDATION, ERROR_MESSAGES } from '../constants';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim() === '') {
    return { field: 'email', message: 'Email wajib diisi' };
  }
  if (email.length > 100) {
    return { field: 'email', message: 'Email terlalu panjang' };
  }
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { field: 'email', message: ERROR_MESSAGES.INVALID_EMAIL };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password || password.trim() === '') {
    return { field: 'password', message: 'Password wajib diisi' };
  }
  if (password.length < VALIDATION.PASSWORD_MIN) {
    return { field: 'password', message: ERROR_MESSAGES.INVALID_PASSWORD };
  }
  if (password.length > VALIDATION.PASSWORD_MAX) {
    return { field: 'password', message: 'Password terlalu panjang' };
  }
  return null;
};

export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim() === '') {
    return { field: 'name', message: 'Nama wajib diisi' };
  }
  if (name.length < VALIDATION.NAME_MIN) {
    return { field: 'name', message: 'Nama terlalu pendek' };
  }
  if (name.length > VALIDATION.NAME_MAX) {
    return { field: 'name', message: 'Nama terlalu panjang' };
  }
  return null;
};

export const validateRole = (role: string): ValidationError | null => {
  const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
  if (!role || role.trim() === '') {
    return { field: 'role', message: 'Role wajib diisi' };
  }
  if (!validRoles.includes(role)) {
    return { field: 'role', message: ERROR_MESSAGES.INVALID_ROLE };
  }
  return null;
};

export const validateMessage = (message: string): ValidationError | null => {
  if (!message || message.trim() === '') {
    return { field: 'message', message: 'Pesan wajib diisi' };
  }
  if (message.length > VALIDATION.MESSAGE_MAX) {
    return { field: 'message', message: `Pesan terlalu panjang (max ${VALIDATION.MESSAGE_MAX} karakter)` };
  }
  return null;
};

export const validateQuizText = (text: string): ValidationError | null => {
  if (!text || text.trim() === '') {
    return { field: 'text', message: 'Teks wajib diisi' };
  }
  if (text.length < 10) {
    return { field: 'text', message: 'Teks minimal 10 karakter' };
  }
  if (text.length > VALIDATION.TEXT_MAX) {
    return { field: 'text', message: `Teks terlalu panjang (max ${VALIDATION.TEXT_MAX} karakter)` };
  }
  return null;
};

export const validateLoginForm = (email: string, password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  return errors;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  name: string,
  role: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const roleError = validateRole(role);
  if (roleError) errors.push(roleError);

  return errors;
};

export const formatValidationError = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  return errors.map((e) => e.message).join('\n');
};

export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
};
