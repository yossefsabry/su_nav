import { BASE_LOCATION } from '@/services/indoor-positioning';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface GeofenceScreenProps {
  distance: number;
  onRefresh: () => void;
}

export function GeofenceScreen({ distance, onRefresh }: GeofenceScreenProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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

  const distanceToLocation = distance - BASE_LOCATION.radius;

  return (
    <View style={styles.container}>
      {/* Animated Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="location-outline" size={80} color="#FF3B30" />
        </View>
      </Animated.View>

      {/* Main Message */}
      <Text style={styles.title}>Out of Range</Text>
      <Text style={styles.subtitle}>
        You are too far from the mapped area
      </Text>

      {/* Distance Card */}
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

      {/* Location Info */}
      <View style={styles.infoCard}>
        <BlurView intensity={80} tint="dark" style={styles.infoBlur}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Mapped Area Location</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latitude:</Text>
            <Text style={styles.infoValue}>
              {BASE_LOCATION.latitude.toFixed(6)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Longitude:</Text>
            <Text style={styles.infoValue}>
              {BASE_LOCATION.longitude.toFixed(6)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coverage Radius:</Text>
            <Text style={styles.infoValue}>
              {BASE_LOCATION.radius}m ({(BASE_LOCATION.radius / 1000).toFixed(1)} km)
            </Text>
          </View>
        </BlurView>
      </View>

      {/* Instructions */}
      <View style={styles.instructionCard}>
        <BlurView intensity={80} tint="dark" style={styles.instructionBlur}>
          <View style={styles.instructionRow}>
            <Ionicons name="walk" size={20} color="#34C759" />
            <Text style={styles.instructionText}>
              Move closer to the location to access the indoor map
            </Text>
          </View>
        </BlurView>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <BlurView intensity={80} tint="light" style={styles.refreshBlur}>
          <Ionicons name="refresh" size={24} color="#fff" />
          <Text style={styles.refreshText}>Check Again</Text>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  iconContainer: {
    marginBottom: 32,
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
    marginBottom: 20,
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
  instructionCard: {
    width: width - 40,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  instructionBlur: {
    padding: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#fff',
    flex: 1,
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
});

