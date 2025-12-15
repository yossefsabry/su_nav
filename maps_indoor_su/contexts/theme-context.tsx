import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#FFFFFF',
  secondaryBackground: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  tertiaryText: '#999999',
  border: '#E0E0E0',
  primary: '#007AFF',
  secondary: '#FF9500',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FFCC00',
  tint: '#007AFF',
  tabIconDefault: '#666666',
  tabIconSelected: '#007AFF',
  searchBackground: '#F5F5F5',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors = {
  background: '#000000',
  secondaryBackground: '#1C1C1E',
  cardBackground: '#2C2C2E',
  text: '#FFFFFF',
  secondaryText: '#EBEBF5',
  tertiaryText: '#8E8E93',
  border: '#38383A',
  primary: '#0A84FF',
  secondary: '#FF9F0A',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FFD60A',
  tint: '#0A84FF',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#0A84FF',
  searchBackground: '#38383A',
  shadow: 'rgba(255, 255, 255, 0.1)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

// Cache theme in memory
let cachedTheme: Theme | null = null;
let isThemeLoaded = false;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<Theme>(() => cachedTheme || 'system');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme || 'light');
  const [isLoading, setIsLoading] = useState(!isThemeLoaded);

  useEffect(() => {
    if (!isThemeLoaded) {
      loadTheme();
    }
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setColorScheme(systemColorScheme || 'light');
    } else {
      setColorScheme(theme);
    }
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        cachedTheme = savedTheme as Theme;
        setThemeState(savedTheme as Theme);
      }
      isThemeLoaded = true;
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading theme:', error);
      isThemeLoaded = true;
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      cachedTheme = newTheme;
      setThemeState(newTheme);
      AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch(err => 
        console.error('Error saving theme:', err)
      );
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  // Don't block rendering on theme load
  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
