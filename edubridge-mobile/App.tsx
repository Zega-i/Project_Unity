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
          } catch {
            // Token invalid/expired → clear and go to login
            await authStore.clearAuth();
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
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