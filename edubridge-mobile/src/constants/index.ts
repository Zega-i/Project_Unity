// Error Messages
export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Gagal terhubung ke server',
  REQUEST_TIMEOUT: 'Permintaan timeout, coba lagi',
  OFFLINE: 'Anda sedang offline',

  // Auth
  INVALID_CREDENTIALS: 'Email atau password salah',
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  UNAUTHORIZED: 'Tidak terautentikasi',
  SESSION_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
  WEAK_PASSWORD: 'Password terlalu lemah',

  // Validation
  REQUIRED_FIELD: 'Wajib diisi: {field}',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PASSWORD: 'Password minimal 6 karakter',
  INVALID_NAME: 'Nama minimal 2 karakter',
  INVALID_ROLE: 'Role tidak valid',

  // Quiz
  QUIZ_NOT_FOUND: 'Kuis tidak ditemukan',
  QUESTION_NOT_FOUND: 'Pertanyaan tidak ditemukan',
  QUIZ_SESSION_EXPIRED: 'Session kuis telah berakhir',
  INVALID_ANSWER: 'Jawaban tidak valid',

  // AI Tutor
  CHAT_FAILED: 'Gagal mengirim pesan ke tutor',
  QUIZ_GENERATION_FAILED: 'Gagal membuat kuis',
  ANALYSIS_FAILED: 'Gagal menganalisis kesalahan',

  // General
  SOMETHING_WENT_WRONG: 'Terjadi kesalahan, coba lagi',
  NOT_FOUND: '{resource} tidak ditemukan',
  FORBIDDEN: 'Anda tidak memiliki akses',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTERED: 'Pendaftaran berhasil',
  LOGGED_IN: 'Login berhasil',
  LOGGED_OUT: 'Logout berhasil',
  PROFILE_UPDATED: 'Profil berhasil diperbarui',
  QUIZ_STARTED: 'Kuis dimulai',
  ANSWER_SUBMITTED: 'Jawaban diterima',
  QUIZ_COMPLETED: 'Kuis selesai',
  TUTOR_RESPONSE: 'Respons dari AI tutor',
  QUIZ_GENERATED: 'Kuis berhasil dibuat',
  ERRORS_ANALYZED: 'Analisis kesalahan selesai',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 50,
  NAME_MIN: 2,
  NAME_MAX: 100,
  MESSAGE_MAX: 5000,
  TEXT_MAX: 50000,
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: 'bottom',
};

// Animation Configuration
export const ANIMATION = {
  DURATION: 300,
  ENABLED: true,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_ROLE: 'user_role',
  QUIZ_PROGRESS: 'quiz_progress',
  CHAT_HISTORY: 'chat_history',
  RECENT_SCORES: 'recent_scores',
};

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SHORT_ANSWER: 'SHORT_ANSWER',
  TRUE_FALSE: 'TRUE_FALSE',
  ESSAY: 'ESSAY',
};

// Quiz Status
export const QUIZ_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};

// Material Types
export const MATERIAL_TYPES = {
  PDF: 'PDF',
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  INTERACTIVE: 'INTERACTIVE',
  EXERCISE: 'EXERCISE',
};
