export const formatScore = (score: number | undefined | null): string => {
  if (score === null || score === undefined) return '-';
  return `${Math.round(score)}%`;
};

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}j`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const truncateText = (text: string, length: number = 50): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatQuestionType = (type: string): string => {
  const types: { [key: string]: string } = {
    MULTIPLE_CHOICE: 'Pilihan Ganda',
    SHORT_ANSWER: 'Jawaban Singkat',
    TRUE_FALSE: 'Benar/Salah',
    ESSAY: 'Essay',
  };
  return types[type] || type;
};

export const formatMaterialType = (type: string): string => {
  const types: { [key: string]: string } = {
    PDF: 'PDF',
    VIDEO: 'Video',
    ARTICLE: 'Artikel',
    INTERACTIVE: 'Interaktif',
    EXERCISE: 'Latihan',
  };
  return types[type] || type;
};

export const getQuestionTypeIcon = (type: string): string => {
  const icons: { [key: string]: string } = {
    MULTIPLE_CHOICE: '📋',
    SHORT_ANSWER: '✏️',
    TRUE_FALSE: '✓',
    ESSAY: '📝',
  };
  return icons[type] || '❓';
};

export const getMaterialTypeIcon = (type: string): string => {
  const icons: { [key: string]: string } = {
    PDF: '📄',
    VIDEO: '🎥',
    ARTICLE: '📰',
    INTERACTIVE: '🎮',
    EXERCISE: '📚',
  };
  return icons[type] || '📦';
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#FFC107'; // Orange
  return '#F44336'; // Red
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Sempurna';
  if (score >= 80) return 'Sangat Baik';
  if (score >= 70) return 'Baik';
  if (score >= 60) return 'Cukup';
  return 'Perlu Ditingkatkan';
};
