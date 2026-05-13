import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { authStore } from './src/store/authStore';
import { AuthProvider } from './src/contexts/AuthContext';
import { QuizProvider } from './src/contexts/QuizContext';
import { TutorProvider } from './src/contexts/TutorContext';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await authStore.init();
      setIsLoggedIn(!!authStore.getToken());
      setIsReady(true);
    };
    checkAuth();

    const unsubscribe = authStore.subscribe((state) => {
      setIsLoggedIn(!!state.token);
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QuizProvider>
          <TutorProvider>
            <NavigationContainer>
              <AppNavigator isLoggedIn={isLoggedIn} />
            </NavigationContainer>
          </TutorProvider>
        </QuizProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}