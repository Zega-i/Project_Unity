import React, { createContext, useContext, ReactNode } from 'react';
import { useTutor, TutorState } from '../hooks/useTutor';
import { ChatMessage } from '../types';

interface TutorContextType extends TutorState {
  loadChatHistory: () => Promise<void>;
  sendMessage: (message: string, context?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  generateQuiz: (text: string, questionCount?: number) => Promise<{ success: boolean; data?: any; message?: string; error?: string }>;
  analyzeErrors: (wrongAnswers: any[]) => Promise<{ success: boolean; data?: any; message?: string; error?: string }>;
  clearMessages: () => Promise<void>;
  clearError: () => void;
  messageCount: number;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider = ({ children }: { children: ReactNode }) => {
  const tutor = useTutor();

  return (
    <TutorContext.Provider value={tutor}>
      {children}
    </TutorContext.Provider>
  );
};

export const useTutorContext = () => {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error('useTutorContext must be used within TutorProvider');
  }
  return context;
};
