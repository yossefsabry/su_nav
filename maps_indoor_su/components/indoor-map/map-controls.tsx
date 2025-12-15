// Map Controls - Zoom, floor selector, and other controls
// Adapted from mockup for React Native

import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  currentFloor?: number;
  totalFloors?: number;
  onFloorChange?: (floor: number) => void;
  showFloorSelector?: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  currentFloor = 0,
  totalFloors = 4,
  onFloorChange,
  showFloorSelector = true,
}: MapControlsProps) {
  return (
    <View style={styles.container}>
      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        {onZoomIn && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onZoomIn}
          >
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {onZoomOut && (
          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonMiddle]}
            onPress={onZoomOut}
          >
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {onReset && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onReset}
          >
            <Ionicons name="refresh" size={20} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      {/* Floor Selector */}
      {showFloorSelector && totalFloors > 1 && onFloorChange && (
        <View style={styles.floorSelector}>
          <Text style={styles.floorLabel}>Floor</Text>
          
          {Array.from({ length: totalFloors }, (_, i) => i).map((floor) => (
            <TouchableOpacity
              key={floor}
              style={[
                styles.floorButton,
                currentFloor === floor && styles.floorButtonActive,
              ]}
              onPress={() => onFloorChange(floor)}
            >
              <Text
                style={[
                  styles.floorButtonText,
                  currentFloor === floor && styles.floorButtonTextActive,
                ]}
              >
                {floor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: 100,
    zIndex: 100,
  },
  zoomControls: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonMiddle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  floorSelector: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  floorButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 2,
  },
  floorButtonActive: {
    backgroundColor: '#4285f4',
  },
  floorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  floorButtonTextActive: {
    color: '#fff',
  },
});
