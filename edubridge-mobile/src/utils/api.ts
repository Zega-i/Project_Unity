import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import { ApiResponse } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiCallOptions extends RequestOptions {
  requiresAuth?: boolean;
  retries?: number;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string = API_BASE_URL;
  private timeout: number = API_CONFIG.TIMEOUT;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.timeout,
      requiresAuth = true,
      retries = API_CONFIG.RETRY_ATTEMPTS,
    } = options;

    let authToken: string | null = null;
    if (requiresAuth) {
      authToken = await this.getAuthToken();
      if (!authToken) {
        throw {
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
          message: ERROR_MESSAGES.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
        };
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const makeCall = async (): Promise<ApiResponse<T>> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: ERROR_MESSAGES.SOMETHING_WENT_WRONG,
          }));
          throw {
            success: false,
            error: errorData.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
            message: errorData.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
            timestamp: new Date().toISOString(),
          };
        }

        const data: ApiResponse<T> = await response.json();
        return data;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw {
            success: false,
            error: ERROR_MESSAGES.REQUEST_TIMEOUT,
            message: ERROR_MESSAGES.REQUEST_TIMEOUT,
            timestamp: new Date().toISOString(),
          };
        }
        throw error;
      }
    };

    let lastError: any;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await makeCall();
      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1))
          );
        }
      }
    }

    throw lastError || {
      success: false,
      error: ERROR_MESSAGES.NETWORK_ERROR,
      message: ERROR_MESSAGES.NETWORK_ERROR,
      timestamp: new Date().toISOString(),
    };
  }

  async get<T = any>(endpoint: string, options?: ApiCallOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, options?: ApiCallOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

export const apiClient = ApiClient.getInstance();
