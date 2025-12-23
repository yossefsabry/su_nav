import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Strict typing: Only light or dark
type Theme = 'light' | 'dark';
type ColorScheme = 'light' | 'dark';

// Define colors
const lightColors = {
  background: '#F8F9FA',
  secondaryBackground: '#F0F2F5',
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
  searchBackground: '#E4E6EB',
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

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (coords?: { x: number; y: number }) => void;
  transitionState: {
    stage: 'idle' | 'capturing' | 'animating';
    x: number;
    y: number;
    snapshotUri: string | null;
    nextTheme: Theme | null;
  };
  completeCapture: (uri: string) => void;
  completeTransition: () => void;
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

// Cache theme in memory
let cachedTheme: Theme | null = null;
let isThemeLoaded = false;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();

  // Initialize state with strict 'light' or 'dark' defaults
  const [theme, setThemeState] = useState<Theme>(() => {
    if (cachedTheme && (cachedTheme === 'light' || cachedTheme === 'dark')) {
      return cachedTheme;
    }
    // Fallback to system preference mapping
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // initial color scheme matches theme
    return theme;
  });

  // Transition state
  const [transitionState, setTransitionState] = useState<{
    stage: 'idle' | 'capturing' | 'animating';
    x: number;
    y: number;
    snapshotUri: string | null;
    nextTheme: Theme | null;
  }>({
    stage: 'idle',
    x: 0,
    y: 0,
    snapshotUri: null,
    nextTheme: null,
  });

  useEffect(() => {
    if (!isThemeLoaded) {
      loadTheme();
    }
  }, []);

  // Ensure colorScheme stays synced with defined theme
  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        cachedTheme = savedTheme;
        setThemeState(savedTheme);
      } else {
        // If system/invalid, default to current system appearance or light
        const defaultTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        cachedTheme = defaultTheme;
        setThemeState(defaultTheme);
      }
      isThemeLoaded = true;
    } catch (error) {
      console.error('Error loading theme:', error);
      isThemeLoaded = true;
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

  const toggleTheme = (coords?: { x: number; y: number }) => {
    // Strictly toggle between light and dark
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    if (coords) {
      // Start capturing phase
      setTransitionState({
        stage: 'capturing',
        x: coords.x,
        y: coords.y,
        snapshotUri: null,
        nextTheme: nextTheme,
      });
    } else {
      // Just switch immediately
      setTheme(nextTheme);
    }
  };

  const completeCapture = (uri: string) => {
    // Snapshot is ready, now we switch the theme effectively immediately
    // The Transition Component will be displaying the snapshot on top
    if (transitionState.nextTheme) {
      // Update the actual theme state
      cachedTheme = transitionState.nextTheme;
      setThemeState(transitionState.nextTheme);
      AsyncStorage.setItem(THEME_STORAGE_KEY, transitionState.nextTheme).catch(console.error);

      // Move to animating stage
      setTransitionState(prev => ({
        ...prev,
        stage: 'animating',
        snapshotUri: uri
      }));
    }
  };

  const completeTransition = () => {
    setTransitionState({
      stage: 'idle',
      x: 0,
      y: 0,
      snapshotUri: null,
      nextTheme: null
    });
  };

  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        setTheme,
        toggleTheme,
        transitionState,
        completeCapture,
        completeTransition,
        colors
      }}
    >
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
