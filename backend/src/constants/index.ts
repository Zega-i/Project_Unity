// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  INVALID_CREDENTIALS: 'Email atau password salah',
  UNAUTHORIZED: 'Tidak terauthorisasi',
  TOKEN_EXPIRED: 'Token telah kadaluarsa',
  TOKEN_INVALID: 'Token tidak valid',

  // Validation
  MISSING_REQUIRED_FIELD: 'Field wajib diisi: {field}',
  INVALID_EMAIL: 'Format email tidak valid',
  PASSWORD_TOO_SHORT: 'Password minimal 6 karakter',
  INVALID_ROLE: 'Role tidak valid (STUDENT/TEACHER/ADMIN)',

  // Quiz
  QUIZ_SESSION_NOT_FOUND: 'Session kuis tidak ditemukan',
  QUESTION_NOT_FOUND: 'Pertanyaan tidak ditemukan',
  INVALID_ANSWER: 'Jawaban tidak valid',

  // AI
  AI_ERROR: 'Terjadi kesalahan saat memanggil AI',
  INSUFFICIENT_TEXT: 'Teks terlalu pendek untuk generate kuis',

  // Database
  DATABASE_ERROR: 'Terjadi kesalahan database',
  NOT_FOUND: '{resource} tidak ditemukan',

  // Server
  INTERNAL_SERVER_ERROR: 'Terjadi kesalahan server',
  INVALID_REQUEST: 'Request tidak valid',
  METHOD_NOT_ALLOWED: 'Method tidak diizinkan',
  ROUTE_NOT_FOUND: 'Route tidak ditemukan',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTERED: 'Pendaftaran berhasil',
  LOGGED_IN: 'Login berhasil',
  LOGGED_OUT: 'Logout berhasil',
  QUIZ_STARTED: 'Kuis dimulai',
  ANSWER_SUBMITTED: 'Jawaban disimpan',
  QUIZ_FINISHED: 'Kuis selesai',
  PROFILE_RETRIEVED: 'Profil berhasil diambil',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10'),
};

// JWT
export const JWT = {
  EXPIRY: process.env.JWT_EXPIRY || '7d',
  ALGORITHM: 'HS256' as const,
};

// Quiz
export const QUIZ = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  DEFAULT_DIFFICULTY: 1,
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,
  DIFFICULTY_INCREMENT: 1,
};

// AI
export const AI = {
  MIN_TEXT_LENGTH: 10,
  MAX_TEXT_LENGTH: 10000,
  DEFAULT_TIMEOUT: 30000,
  MODEL: 'gemini-pro',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Roles
export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
