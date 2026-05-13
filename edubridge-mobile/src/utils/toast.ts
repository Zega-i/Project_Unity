import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

export const showToast = (
  message: string,
  type: ToastType = 'info',
  options?: ToastOptions
) => {
  const title = {
    success: 'Berhasil',
    error: 'Kesalahan',
    warning: 'Peringatan',
    info: 'Informasi',
  }[type];

  // Using Alert for now since Toast is not available
  // In production, use a toast library like react-native-toast-message
  Alert.alert(title, message);
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'success', options);
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'error', options);
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'warning', options);
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'info', options);
};
