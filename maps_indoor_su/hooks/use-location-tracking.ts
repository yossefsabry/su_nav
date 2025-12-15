import { findIndoorPosition } from '@/services/indoor-positioning';
import { IndoorPosition, UserLocation } from '@/types/location';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export interface LocationTrackingState {
  userLocation: UserLocation | null;
  indoorPosition: IndoorPosition | null;
  isTracking: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
}

export function useLocationTracking() {
  const [state, setState] = useState<LocationTrackingState>({
    userLocation: null,
    indoorPosition: null,
    isTracking: false,
    error: null,
    permissionStatus: 'undetermined',
  });

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const magnetometerSubscription = useRef<any>(null);
  const headingRef = useRef(0);

  useEffect(() => {
    requestPermissions();

    return () => {
      stopTracking();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      setState(prev => ({
        ...prev,
        permissionStatus: status === 'granted' ? 'granted' : 'denied',
        error: status !== 'granted' ? 'Location permission denied' : null,
      }));

      if (status === 'granted') {
        startTracking();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to request location permission',
        permissionStatus: 'denied',
      }));
    }
  };

  const startTracking = async () => {
    try {
      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const initialHeading = typeof initialPosition.coords.heading === 'number' && !Number.isNaN(initialPosition.coords.heading)
        ? initialPosition.coords.heading
        : headingRef.current;

      headingRef.current = initialHeading;

      setState(prev => ({
        ...prev,
        userLocation: {
          latitude: initialPosition.coords.latitude,
          longitude: initialPosition.coords.longitude,
          altitude: initialPosition.coords.altitude,
          accuracy: initialPosition.coords.accuracy,
          heading: initialHeading,
          speed: initialPosition.coords.speed,
        },
        isTracking: true,
        error: null,
      }));

      // Start GPS tracking with faster updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 100, // Update every 100ms for smooth tracking
          distanceInterval: 0.5, // Update every 0.5 meter
        },
        (location) => {
          const { latitude, longitude, altitude, accuracy, heading, speed } = location.coords;
          const nextHeading = typeof heading === 'number' && !Number.isNaN(heading)
            ? heading
            : headingRef.current;

          headingRef.current = nextHeading;
          
          setState(prev => ({
            ...prev,
            userLocation: {
              latitude,
              longitude,
              altitude,
              accuracy,
              heading: nextHeading,
              speed,
            },
            isTracking: true,
            error: null,
          }));
        }
      );

      // Start magnetometer tracking for indoor positioning with faster updates
      Magnetometer.setUpdateInterval(100); // Update every 100ms for smooth heading
      
      magnetometerSubscription.current = Magnetometer.addListener((data) => {
        const { x, y, z } = data;
        
        // Calculate magnetic field magnitude
        const Bx = x * 100; // Convert to μT
        const By = y * 100;
        const Bz = z * 100;

        const headingRadians = Math.atan2(y, x);
        const normalizedHeading = ((headingRadians * (180 / Math.PI)) + 360) % 360;
        headingRef.current = normalizedHeading;

        // Find indoor position based on magnetic signature
        const indoorPos = findIndoorPosition({ Bx, By, Bz });
        
        if (indoorPos) {
          setState(prev => ({
            ...prev,
            indoorPosition: indoorPos,
          }));
        }

        setState(prev => ({
          ...prev,
          userLocation: prev.userLocation
            ? {
                ...prev.userLocation,
                heading: normalizedHeading,
              }
            : prev.userLocation,
        }));
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start location tracking',
        isTracking: false,
      }));
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (magnetometerSubscription.current) {
      magnetometerSubscription.current.remove();
      magnetometerSubscription.current = null;
    }

    setState(prev => ({
      ...prev,
      isTracking: false,
    }));
  };

  const refreshLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const { latitude, longitude, altitude, accuracy, heading, speed } = location.coords;
      const nextHeading = typeof heading === 'number' && !Number.isNaN(heading)
        ? heading
        : headingRef.current;

      headingRef.current = nextHeading;
      
      setState(prev => ({
        ...prev,
        userLocation: {
          latitude,
          longitude,
          altitude,
          accuracy,
          heading: nextHeading,
          speed,
        },
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh location',
      }));
    }
  };

  return {
    ...state,
    startTracking,
    stopTracking,
    refreshLocation,
  };
}

