import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { ThemeProvider } from '@/contexts/theme-context';
import { ThemeTransition } from '@/components/theme-transition';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { preloadAppData } from '@/services/app-init';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Suppress keep-awake errors (non-critical)
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Unable to activate keep awake')
  ) {
    return;
  }
  originalConsoleError(...args);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Configure system UI for edge-to-edge display
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('transparent');
    }
  }, []);

  // Preload critical app data on startup
  useEffect(() => {
    preloadAppData();
  }, []);

  // Handle unhandled promise rejections (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Unable to activate keep awake')) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handler as any);
    return () => window.removeEventListener('unhandledrejection', handler as any);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemeTransition>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </NavigationThemeProvider>
          </ThemeTransition>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
