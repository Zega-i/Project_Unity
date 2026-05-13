import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthState } from '../hooks/useAuth';

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

interface AuthContextType extends AuthState {
  login: (params: LoginParams) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<{ success: boolean; message?: string; error?: string }>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
