import { useLocationTracking } from '@/hooks/use-location-tracking';
import { BASE_LOCATION, isWithinGeofence } from '@/services/indoor-positioning';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { userLocation, isTracking, refreshLocation } = useLocationTracking();
  const [geofenceStatus, setGeofenceStatus] = useState<{ isWithin: boolean; distance: number } | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const status = isWithinGeofence(userLocation.latitude, userLocation.longitude);
      setGeofenceStatus(status);
    }
  }, [userLocation]);

  const handleNavigateToMap = () => {
    router.push('/map');
  };

  const handleNavigateToSchedule = () => {
    router.push('/schedule');
  };

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons name="location" size={80} color="#007AFF" />
          </Animated.View>
          <Text style={styles.loadingTitle}>Getting Your Location...</Text>
          <Text style={styles.loadingSubtitle}>Please wait while we find you</Text>
          
          {!isTracking && (
            <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (geofenceStatus && !geofenceStatus.isWithin) {
    const distanceToLocation = geofenceStatus.distance - BASE_LOCATION.radius;
    
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="location-outline" size={80} color="#FF3B30" />
          </View>
        </Animated.View>

        <Text style={styles.title}>Out of Range</Text>
        <Text style={styles.subtitle}>You are too far from the mapped area</Text>

        <View style={styles.distanceCard}>
          <BlurView intensity={80} tint="dark" style={styles.distanceBlur}>
            <View style={styles.distanceRow}>
              <Ionicons name="navigate" size={24} color="#FF9500" />
              <View style={styles.distanceInfo}>
                <Text style={styles.distanceLabel}>Distance to Area</Text>
                <Text style={styles.distanceValue}>
                  {distanceToLocation > 1000 
                    ? `${(distanceToLocation / 1000).toFixed(1)} km away`
                    : `${Math.round(distanceToLocation)} meters away`
                  }
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.infoCard}>
          <BlurView intensity={80} tint="dark" style={styles.infoBlur}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.infoTitle}>Mapped Area Location</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Latitude:</Text>
              <Text style={styles.infoValue}>{BASE_LOCATION.latitude.toFixed(6)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Longitude:</Text>
              <Text style={styles.infoValue}>{BASE_LOCATION.longitude.toFixed(6)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Coverage Radius:</Text>
              <Text style={styles.infoValue}>
                {BASE_LOCATION.radius}m ({(BASE_LOCATION.radius / 1000).toFixed(1)} km)
              </Text>
            </View>
          </BlurView>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
          <BlurView intensity={80} tint="light" style={styles.refreshBlur}>
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.refreshText}>Check Again</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.successContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </View>
        </Animated.View>

        <Text style={styles.title}>You're in Range!</Text>
        <Text style={styles.subtitle}>Ready to navigate</Text>

        <View style={styles.statusCard}>
          <BlurView intensity={80} tint="dark" style={styles.statusBlur}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons name="location" size={32} color="#007AFF" />
                <Text style={styles.statusLabel}>Your Location</Text>
                <Text style={styles.statusValue}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons name="navigate-circle" size={32} color="#34C759" />
                <Text style={styles.statusLabel}>Distance from Center</Text>
                <Text style={styles.statusValue}>
                  {geofenceStatus ? `${Math.round(geofenceStatus.distance)}m` : 'Calculating...'}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigateToMap}>
          <View style={styles.navigateButtonInner}>
            <Ionicons name="map" size={32} color="#fff" />
            <Text style={styles.navigateButtonText}>Open Map & Navigate</Text>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scheduleButton} onPress={handleNavigateToSchedule}>
          <View style={styles.navigateButtonInner}>
            <Ionicons name="calendar" size={32} color="#fff" />
            <Text style={styles.navigateButtonText}>View Schedule</Text>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.featuresCard}>
          <BlurView intensity={80} tint="dark" style={styles.featuresBlur}>
            <Text style={styles.featuresTitle}>Features Available</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="search" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Search for locations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="navigate" size={20} color="#34C759" />
              <Text style={styles.featureText}>Turn-by-turn navigation</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="camera" size={20} color="#FF9500" />
              <Text style={styles.featureText}>AR camera view</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={20} color="#FF9500" />
              <Text style={styles.featureText}>Weekly schedule planner</Text>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  iconCircleSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 32,
    textAlign: 'center',
  },
  distanceCard: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  distanceBlur: {
    padding: 20,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceInfo: {
    marginLeft: 16,
    flex: 1,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  infoCard: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  infoBlur: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#007AFF',
  },
  refreshBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  statusCard: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusBlur: {
    padding: 24,
  },
  statusRow: {
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  navigateButton: {
    width: width - 40,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scheduleButton: {
    width: width - 40,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    marginBottom: 20,
    overflow: 'hidden',
  },
  navigateButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  navigateButtonText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  featuresCard: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuresBlur: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
});

