import React, { createContext, useContext, ReactNode } from 'react';
import { useQuiz, QuizState } from '../hooks/useQuiz';
import { Question, QuizSession } from '../types';

interface QuizContextType extends QuizState {
  startQuiz: (classId: string, questionCount?: number) => Promise<{ success: boolean; message?: string; error?: string }>;
  submitAnswer: (questionId: string, answer: string) => Promise<{ success: boolean; data?: any; message?: string; error?: string }>;
  finishQuiz: () => Promise<{ success: boolean; data?: any; message?: string; error?: string }>;
  moveToNextQuestion: () => void;
  moveToPreviousQuestion: () => void;
  resetQuiz: () => void;
  clearError: () => void;
  currentQuestion: Question | null;
  progress: number;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const quiz = useQuiz();

  return (
    <QuizContext.Provider
      value={{
        ...quiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used within QuizProvider');
  }
  return context;
};
