import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../utils/api';
import { STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { ChatMessage } from '../types';

export interface TutorState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export const useTutor = () => {
  const [state, setState] = useState<TutorState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Load chat history from storage
  const loadChatHistory = useCallback(async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (history) {
        const messages = JSON.parse(history).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setState((prev) => ({ ...prev, messages }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // Save chat history to storage
  const saveChatHistory = useCallback(async (messages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, []);

  const sendMessage = useCallback(
    async (message: string, context?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Add user message to state
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: message,
        isUser: true,
        timestamp: new Date(),
      };

      setState((prev) => ({ ...prev, messages: [...prev.messages, userMessage] }));

      try {
        const response = await apiClient.post('/ai/tutor', {
          message,
          context,
        });

        if (!response.success) {
          throw new Error(response.error || ERROR_MESSAGES.CHAT_FAILED);
        }

        const { response: tutorResponse } = response.data || {};
        if (!tutorResponse) {
          throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
        }

        // Add AI response to state
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text: tutorResponse,
          isUser: false,
          timestamp: new Date(),
        };

        const updatedMessages = [...state.messages, userMessage, aiMessage];
        setState((prev) => ({
          ...prev,
          messages: updatedMessages,
          isLoading: false,
        }));

        // Save to storage
        await saveChatHistory(updatedMessages);

        return { success: true, message: SUCCESS_MESSAGES.TUTOR_RESPONSE };
      } catch (error: any) {
        // Remove user message if request failed
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== userMessage.id),
          isLoading: false,
          error: error.message || ERROR_MESSAGES.CHAT_FAILED,
        }));
        return { success: false, error: error.message || ERROR_MESSAGES.CHAT_FAILED };
      }
    },
    [state.messages, saveChatHistory]
  );

  const generateQuiz = useCallback(async (text: string, questionCount: number = 5) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.post('/ai/generate-quiz', {
        text,
        questionCount,
      });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.QUIZ_GENERATION_FAILED);
      }

      const { quiz } = response.data || {};
      if (!quiz) {
        throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      return { success: true, data: quiz, message: SUCCESS_MESSAGES.QUIZ_GENERATED };
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

  const analyzeErrors = useCallback(async (wrongAnswers: any[]) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.post('/ai/analyze-errors', {
        wrongAnswers,
      });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.ANALYSIS_FAILED);
      }

      const { analysis } = response.data || {};
      if (!analysis) {
        throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      return { success: true, data: analysis, message: SUCCESS_MESSAGES.ERRORS_ANALYZED };
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

  const clearMessages = useCallback(async () => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
    await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadChatHistory,
    sendMessage,
    generateQuiz,
    analyzeErrors,
    clearMessages,
    clearError,
    messageCount: state.messages.length,
  };
};
