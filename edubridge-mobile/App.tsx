import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { authStore } from './src/store/authStore';
import { authAPI } from './src/services/api';
import { AuthProvider } from './src/contexts/AuthContext';
import { QuizProvider } from './src/contexts/QuizContext';
import { TutorProvider } from './src/contexts/TutorContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { HapticProvider } from './src/contexts/HapticContext';

const PURPLE = '#7C3AED';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Load token from AsyncStorage
        await authStore.init();
        const token = await authStore.getToken();

        if (token) {
          // Validate token against server
          try {
            await authAPI.getProfile();
            setIsLoggedIn(true); // Token valid
          } catch (error: any) {
            console.warn('[checkAuth] Profile check failed:', {
              message: error?.message,
              status: error?.response?.status,
              data: error?.response?.data,
            });
            // Only clear auth if the server explicitly returns 401/403 (unauthorized)
            const isUnauthorized = error?.response && (error.response.status === 401 || error.response.status === 403);
            if (isUnauthorized) {
              await authStore.clearAuth();
              setIsLoggedIn(false);
            } else {
              // Network or temporary server error: assume token is still valid (offline fallback)
              console.log('[checkAuth] Connection error, keeping session:', error?.message || error);
              setIsLoggedIn(true);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (outerError: any) {
        console.error('[checkAuth] Outer error:', outerError);
        setIsLoggedIn(false);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();

    const unsubscribe = authStore.subscribe((state) => {
      setIsLoggedIn(!!state.token);
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <HapticProvider>
          <AuthProvider>
            <QuizProvider>
              <TutorProvider>
                <NavigationContainer>
                  <AppNavigator isLoggedIn={isLoggedIn} />
                </NavigationContainer>
              </TutorProvider>
            </QuizProvider>
          </AuthProvider>
        </HapticProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}