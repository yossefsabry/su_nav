import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocationPoints } from './indoor-positioning';
import { scheduleStorage } from './schedule-storage';

/**
 * Preload critical app data for faster startup
 * This runs asynchronously without blocking the UI
 */
export async function preloadAppData() {
  try {
    // Preload in parallel for maximum speed
    await Promise.all([
      // Preload location points (triggers cache)
      getLocationPoints(),
      
      // Preload schedule data (triggers cache)
      scheduleStorage.getAll(),
      
      // Preload theme preference (already cached in theme-context)
      AsyncStorage.getItem('@app_theme').catch(() => null),
    ]);
    
    console.log('[AppInit] Critical data preloaded successfully');
  } catch (error) {
    console.error('[AppInit] Error preloading data:', error);
    // Don't throw - let app continue even if preload fails
  }
}

/**
 * Clear all app caches (useful for debugging or data corruption issues)
 */
export async function clearAppCaches() {
  try {
    await AsyncStorage.clear();
    console.log('[AppInit] All caches cleared');
  } catch (error) {
    console.error('[AppInit] Error clearing caches:', error);
  }
}
