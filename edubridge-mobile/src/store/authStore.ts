import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
}

class AuthStore {
  private state: AuthState = {
    token: null,
    user: null,
  };

  async init() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const user = await AsyncStorage.getItem('auth_user');
      if (token) this.state.token = token;
      if (user) this.state.user = JSON.parse(user);
    } catch (error) {
      console.error('Error initializing auth store:', error);
    }
  }

  async setAuth(token: string, user: any) {
    this.state.token = token;
    this.state.user = user;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
  }

  async clearAuth() {
    this.state.token = null;
    this.state.user = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
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