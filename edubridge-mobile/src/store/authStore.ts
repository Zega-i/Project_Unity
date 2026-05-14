import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    school?: string;
    className?: string;
    grade?: number;
    dateOfBirth?: string;
    address?: string;
    parentName?: string;
    parentPhone?: string;
    nisn?: string;
    subject?: string;
  } | null;
}

type Listener = (state: AuthState) => void;

class AuthStore {
  private state: AuthState = {
    token: null,
    user: null,
  };
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    console.log('AuthStore: Notifying listeners, token exists:', !!this.state.token);
    this.listeners.forEach((listener) => listener(this.state));
  }

  async init() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const user = await AsyncStorage.getItem('auth_user');
      if (token) this.state.token = token;
      if (user) this.state.user = JSON.parse(user);
      this.notify();
    } catch (error) {
      console.error('Error initializing auth store:', error);
    }
  }

  async setAuth(token: string, user: any) {
    this.state.token = token;
    this.state.user = user;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    this.notify();
  }

  async clearAuth() {
    this.state.token = null;
    this.state.user = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    this.notify();
  }

  async logout() {
    await this.clearAuth();
  }

  async getToken() {
    return this.state.token || (await AsyncStorage.getItem('auth_token'));
  }

  async getUser() {
    if (this.state.user) return this.state.user;
    const user = await AsyncStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }

  getTokenSync() {
    return this.state.token;
  }

  getUserSync() {
    return this.state.user;
  }
}

export const authStore = new AuthStore();