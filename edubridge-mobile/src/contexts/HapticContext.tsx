import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { authStore } from '../store/authStore';

interface HapticContextType {
  isHapticEnabled: boolean;
  toggleHaptic: () => void;
  setHaptic: (enabled: boolean) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

const HapticContext = createContext<HapticContextType | undefined>(undefined);

export const HapticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadHapticPreference = async () => {
      try {
        const user = authStore.getUserSync();
        if (user && typeof user.hapticEnabled === 'boolean') {
          setIsHapticEnabled(user.hapticEnabled);
        }
      } catch (error) {
        console.log('Error loading haptic preference:', error);
        setIsHapticEnabled(true);
      }
      setIsLoaded(true);
    };

    loadHapticPreference();
  }, []);

  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    if (!isHapticEnabled) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  };

  const toggleHaptic = async () => {
    const newValue = !isHapticEnabled;
    setIsHapticEnabled(newValue);

    try {
      const user = authStore.getUserSync();
      if (user) {
        await authStore.setAuth(await authStore.getToken() || '', {
          ...user,
          hapticEnabled: newValue,
        });

        try {
          await fetch('http://your-backend-url/api/profile/preferences', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await authStore.getToken()}`,
            },
            body: JSON.stringify({ hapticEnabled: newValue }),
          });
        } catch (syncError) {
          console.warn('Failed to sync haptic preference to backend:', syncError);
        }
      }
    } catch (error) {
      console.error('Error toggling haptic:', error);
    }
  };

  const setHaptic = async (enabled: boolean) => {
    setIsHapticEnabled(enabled);

    try {
      const user = authStore.getUserSync();
      if (user) {
        await authStore.setAuth(await authStore.getToken() || '', {
          ...user,
          hapticEnabled: enabled,
        });

        try {
          await fetch('http://your-backend-url/api/profile/preferences', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await authStore.getToken()}`,
            },
            body: JSON.stringify({ hapticEnabled: enabled }),
          });
        } catch (syncError) {
          console.warn('Failed to sync haptic preference to backend:', syncError);
        }
      }
    } catch (error) {
      console.error('Error setting haptic:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <HapticContext.Provider value={{ isHapticEnabled, toggleHaptic, setHaptic, triggerHaptic }}>
      {children}
    </HapticContext.Provider>
  );
};

export const useHaptic = (): HapticContextType => {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHaptic must be used within HapticProvider');
  }
  return context;
};
