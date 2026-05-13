import { useCallback, useState } from 'react';
import { apiClient } from '../utils/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { Question, QuizSession } from '../types';

export interface QuizState {
  session: QuizSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
}

export const useQuiz = () => {
  const [state, setState] = useState<QuizState>({
    session: null,
    questions: [],
    currentQuestionIndex: 0,
    isLoading: false,
    error: null,
  });

  const startQuiz = useCallback(async (classId: string, questionCount: number = 5) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.post('/quiz/start', { classId, questionCount });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      const { sessionId, questions } = response.data || {};
      if (!sessionId || !questions) {
        throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      setState({
        session: {
          id: sessionId,
          studentId: '',
          classId,
          startedAt: new Date().toISOString(),
          totalQuestions: questions.length,
          correctAnswers: 0,
          status: 'IN_PROGRESS',
        },
        questions,
        currentQuestionIndex: 0,
        isLoading: false,
        error: null,
      });

      return { success: true, message: SUCCESS_MESSAGES.QUIZ_STARTED };
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

  const submitAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!state.session) {
      return { success: false, error: 'No active quiz session' };
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await apiClient.post('/quiz/answer', {
        sessionId: state.session.id,
        questionId,
        answer,
      });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      const { isCorrect } = response.data || {};

      // Update session if answer is correct
      if (isCorrect && state.session) {
        setState((prev) => ({
          ...prev,
          session: prev.session
            ? {
                ...prev.session,
                correctAnswers: prev.session.correctAnswers + 1,
              }
            : null,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }

      return { success: true, data: { isCorrect }, message: SUCCESS_MESSAGES.ANSWER_SUBMITTED };
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [state.session]);

  const finishQuiz = useCallback(async () => {
    if (!state.session) {
      return { success: false, error: 'No active quiz session' };
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await apiClient.post('/quiz/finish', {
        sessionId: state.session.id,
      });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      const { score, correctAnswers, totalQuestions } = response.data || {};

      setState((prev) => ({
        ...prev,
        session: prev.session
          ? {
              ...prev.session,
              endedAt: new Date().toISOString(),
              score,
              correctAnswers,
              status: 'COMPLETED',
            }
          : null,
        isLoading: false,
      }));

      return {
        success: true,
        data: { score, correctAnswers, totalQuestions },
        message: SUCCESS_MESSAGES.QUIZ_COMPLETED,
      };
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [state.session]);

  const moveToNextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.min(
        prev.currentQuestionIndex + 1,
        prev.questions.length - 1
      ),
    }));
  }, []);

  const moveToPreviousQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      session: null,
      questions: [],
      currentQuestionIndex: 0,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startQuiz,
    submitAnswer,
    finishQuiz,
    moveToNextQuestion,
    moveToPreviousQuestion,
    resetQuiz,
    clearError,
    currentQuestion: state.questions[state.currentQuestionIndex] || null,
    progress: state.questions.length > 0
      ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100
      : 0,
  };
};
