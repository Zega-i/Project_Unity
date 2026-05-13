import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../utils/api';
import { STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { AuthUser } from '../types';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        ]);

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setState({
            user,
            token,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (params: LoginParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.post('/auth/login', params, { requiresAuth: false });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      const { token, user } = response.data || {};
      if (!token || !user) {
        throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role),
      ]);

      setState({
        user,
        token,
        isLoading: false,
        error: null,
      });

      return { success: true, message: SUCCESS_MESSAGES.LOGGED_IN };
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.post('/auth/register', params, { requiresAuth: false });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      const { token, user } = response.data || {};
      if (!token || !user) {
        throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role),
      ]);

      setState({
        user,
        token,
        isLoading: false,
        error: null,
      });

      return { success: true, message: SUCCESS_MESSAGES.REGISTERED };
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE),
      AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY),
    ]);

    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });

    return { success: true, message: SUCCESS_MESSAGES.LOGGED_OUT };
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!state.token,
  };
};
