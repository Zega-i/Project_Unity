import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { authStore } from './src/store/authStore';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await authStore.getToken();
      setIsLoggedIn(!!token);
      setIsReady(true);
    };

    checkAuth();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator isLoggedIn={isLoggedIn} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}