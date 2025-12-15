import { ARNavigationComponent } from '@/components/ar-navigation';
import { MapViewComponent } from '@/components/map-view';
import { IndoorMapView } from '@/components/indoor-map-view';
import { getLocationPoints } from '@/services/indoor-positioning';
import { LocationPoint } from '@/types/location';
import { useTheme } from '@/contexts/theme-context';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View, Animated, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const { colorScheme, colors } = useTheme();
  const { locationId } = useLocalSearchParams();
  const [showAR, setShowAR] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<LocationPoint | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [useIndoorMap, setUseIndoorMap] = useState(true); // Toggle between indoor/outdoor
  const mapComponentRef = useRef<any>(null);
  const indoorMapRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Immediate load - no artificial delay
    setIsMapLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (locationId && mapComponentRef.current && mapComponentRef.current.handlePointPress) {
      const points = getLocationPoints();
      const point = points.find(p => p.id === parseInt(locationId as string));
      if (point) {
        setTimeout(() => {
          mapComponentRef.current.handlePointPress(point);
        }, 500);
      }
    }
  }, [locationId]);

  const handleCameraPress = () => {
    // Get selected point from map for AR navigation
    if (mapComponentRef.current && mapComponentRef.current.getSelectedPoint) {
      const point = mapComponentRef.current.getSelectedPoint();
      setSelectedDestination(point);
    }
    setShowAR(true);
  };

  if (showAR) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <ARNavigationComponent 
          onClose={() => {
            setShowAR(false);
            setSelectedDestination(null);
          }}
          destination={selectedDestination}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        
        {/* Map Type Toggle */}
        <View style={styles.mapToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, useIndoorMap && styles.toggleButtonActive]}
            onPress={() => setUseIndoorMap(true)}
          >
            <Ionicons 
              name="business" 
              size={20} 
              color={useIndoorMap ? '#4285F4' : '#666'} 
            />
            <Text style={[styles.toggleText, useIndoorMap && styles.toggleTextActive]}>
              Indoor
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, !useIndoorMap && styles.toggleButtonActive]}
            onPress={() => setUseIndoorMap(false)}
          >
            <Ionicons 
              name="map" 
              size={20} 
              color={!useIndoorMap ? '#4285F4' : '#666'} 
            />
            <Text style={[styles.toggleText, !useIndoorMap && styles.toggleTextActive]}>
              Outdoor
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {useIndoorMap ? (
            <IndoorMapView
              ref={indoorMapRef}
              onARPress={handleCameraPress}
            />
          ) : (
            <MapViewComponent
              ref={mapComponentRef}
              onCameraPress={handleCameraPress}
            />
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mapToggle: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#E8F0FE',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#4285F4',
  },
});

