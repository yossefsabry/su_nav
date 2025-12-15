import { LocationPoint, MagneticFieldData } from '@/types/location';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export function DataCollector() {
  const [locationData, setLocationData] = useState<LocationPoint[]>([]);
  const [magneticData, setMagneticData] = useState<MagneticFieldData[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(1);

  const collectDataPoint = async () => {
    try {
      // Get GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      // Get magnetometer reading
      const magnetometer = await Magnetometer.isAvailableAsync();
      if (!magnetometer) {
        Alert.alert('Error', 'Magnetometer not available on this device');
        return;
      }

      // Collect single reading
      const subscription = Magnetometer.addListener((data) => {
        const { x, y, z } = data;
        const Bx = (x * 100).toFixed(2);
        const By = (y * 100).toFixed(2);
        const Bz = (z * 100).toFixed(2);

        // Create location point
        const locationPoint: LocationPoint = {
          id: Date.now(),
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          altitude: location.coords.altitude || 0,
          accuracy: location.coords.accuracy || 0,
          timestamp: new Date().toISOString(),
          label: currentLabel.toString(),
        };

        // Create magnetic point (x, y would be set manually based on indoor coordinates)
        const magneticPoint: MagneticFieldData = {
          x: 0, // TODO: Set based on your indoor coordinate system
          y: 0, // TODO: Set based on your indoor coordinate system
          Bx,
          By,
          Bz,
          timestamp: new Date().toISOString(),
        };

        setLocationData(prev => [...prev, locationPoint]);
        setMagneticData(prev => [...prev, magneticPoint]);
        setCurrentLabel(prev => prev + 1);

        subscription.remove();

        Alert.alert(
          'Success',
          `Data point ${currentLabel} collected!\nLat: ${location.coords.latitude.toFixed(6)}\nLon: ${location.coords.longitude.toFixed(6)}\nMagnetic: ${Bx}, ${By}, ${Bz}`,
          [{ text: 'OK' }]
        );
      });

      // Remove subscription after 1 second
      setTimeout(() => {
        subscription.remove();
      }, 1000);

    } catch (error) {
      Alert.alert('Error', 'Failed to collect data point');
      console.error(error);
    }
  };

  const exportData = async () => {
    try {
      const locationJson = JSON.stringify(locationData, null, 2);
      const magneticJson = JSON.stringify(magneticData, null, 2);

      const message = `
=== LOCATION POINTS ===
${locationJson}

=== MAGNETIC DATA ===
${magneticJson}
      `;

      await Share.share({
        message,
        title: 'Indoor Map Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const clearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all collected data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setLocationData([]);
            setMagneticData([]);
            setCurrentLabel(1);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="analytics" size={48} color="#007AFF" />
          <Text style={styles.title}>Data Collection Tool</Text>
          <Text style={styles.subtitle}>
            Collect GPS and magnetic field data for indoor mapping
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <BlurView intensity={80} tint="dark" style={styles.statusBlur}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{locationData.length}</Text>
                <Text style={styles.statusLabel}>Location Points</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{magneticData.length}</Text>
                <Text style={styles.statusLabel}>Magnetic Points</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{currentLabel}</Text>
                <Text style={styles.statusLabel}>Next Label</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <BlurView intensity={80} tint="dark" style={styles.instructionsBlur}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.instructionTitle}>How to Use</Text>
            </View>
            <Text style={styles.instructionText}>
              1. Move to a specific location in your indoor space{'\n'}
              2. Tap "Collect Point" to record GPS and magnetic data{'\n'}
              3. Repeat for multiple locations{'\n'}
              4. Tap "Export Data" to save your data{'\n'}
              5. Copy the data to location_points.json and ground_right.json
            </Text>
          </BlurView>
        </View>

        {/* Collect Button */}
        <TouchableOpacity
          style={styles.collectButton}
          onPress={collectDataPoint}
          disabled={isCollecting}
        >
          <BlurView intensity={80} tint="light" style={styles.collectButtonBlur}>
            <Ionicons name="radio-button-on" size={32} color="#fff" />
            <Text style={styles.collectButtonText}>Collect Point #{currentLabel}</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={exportData}
            disabled={locationData.length === 0}
          >
            <Ionicons name="share" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearData}
            disabled={locationData.length === 0}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Data Preview */}
        {locationData.length > 0 && (
          <View style={styles.previewCard}>
            <BlurView intensity={80} tint="dark" style={styles.previewBlur}>
              <Text style={styles.previewTitle}>Recent Points</Text>
              {locationData.slice(-3).reverse().map((point, index) => (
                <View key={point.id} style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Point {point.label}</Text>
                  <Text style={styles.previewCoords}>
                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.previewMagnetic}>
                    Magnetic: {magneticData[magneticData.length - 1 - index]?.Bx},{' '}
                    {magneticData[magneticData.length - 1 - index]?.By},{' '}
                    {magneticData[magneticData.length - 1 - index]?.Bz} μT
                  </Text>
                </View>
              ))}
            </BlurView>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <BlurView intensity={80} tint="dark" style={styles.tipsBlur}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color="#FFD60A" />
              <Text style={styles.tipTitle}>Pro Tips</Text>
            </View>
            <Text style={styles.tipText}>
              • Calibrate magnetometer before collecting (wave phone in figure-8){'\n'}
              • Collect multiple points for better accuracy{'\n'}
              • Stay still for 2 seconds at each location{'\n'}
              • Collect data at consistent height{'\n'}
              • Mark physical locations for future reference
            </Text>
          </BlurView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statusBlur: {
    padding: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  instructionsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  instructionsBlur: {
    padding: 20,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
  },
  collectButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#007AFF',
  },
  collectButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  collectButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewBlur: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  previewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  previewCoords: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
  },
  previewMagnetic: {
    fontSize: 12,
    color: '#999',
  },
  tipsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipsBlur: {
    padding: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
  },
});

