import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { authStore } from '../store/authStore';

export interface Colors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  error: string;
  success: string;
  warning: string;
  disabled: string;
  placeholder: string;
  card: string;
  shadow: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  colors: Colors;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const LIGHT_COLORS: Colors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#F1F5F9',
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  disabled: '#CBD5E1',
  placeholder: '#94A3B8',
  card: '#FFFFFF',
  shadow: '#000000',
};

const DARK_COLORS: Colors = {
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  primary: '#A78BFA',
  primaryLight: '#312E81',
  error: '#FCA5A5',
  success: '#6EE7B7',
  warning: '#FCD34D',
  disabled: '#64748B',
  placeholder: '#64748B',
  card: '#1E293B',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const user = authStore.getUserSync();
        if (user && typeof user.darkModeEnabled === 'boolean') {
          setIsDarkMode(user.darkModeEnabled);
        } else if (systemColorScheme === 'dark') {
          setIsDarkMode(true);
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
        if (systemColorScheme === 'dark') {
          setIsDarkMode(true);
        }
      }
      setIsLoaded(true);
    };

    loadThemePreference();
  }, [systemColorScheme]);

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);

    try {
      const user = authStore.getUserSync();
      if (user) {
        // Update user in store
        await authStore.setAuth(await authStore.getToken() || '', {
          ...user,
          darkModeEnabled: newValue,
        });

        // Send to backend
        try {
          const response = await fetch('http://your-backend-url/api/profile/preferences', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await authStore.getToken()}`,
            },
            body: JSON.stringify({ darkModeEnabled: newValue }),
          });

          if (!response.ok) {
            console.warn('Failed to sync dark mode preference to backend');
          }
        } catch (syncError) {
          console.warn('Failed to sync dark mode to backend:', syncError);
        }
      }
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const setDarkMode = async (isDark: boolean) => {
    setIsDarkMode(isDark);

    try {
      const user = authStore.getUserSync();
      if (user) {
        await authStore.setAuth(await authStore.getToken() || '', {
          ...user,
          darkModeEnabled: isDark,
        });

        try {
          await fetch('http://your-backend-url/api/profile/preferences', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await authStore.getToken()}`,
            },
            body: JSON.stringify({ darkModeEnabled: isDark }),
          });
        } catch (syncError) {
          console.warn('Failed to sync dark mode to backend:', syncError);
        }
      }
    } catch (error) {
      console.error('Error setting dark mode:', error);
    }
  };

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
