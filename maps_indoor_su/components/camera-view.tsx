import { useCamera } from '@/hooks/use-camera';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CameraViewComponentProps {
  onClose: () => void;
}

export function CameraViewComponent({ onClose }: CameraViewComponentProps) {
  const { hasPermission, requestPermission } = useCamera();
  const { userLocation, indoorPosition } = useLocationTracking();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setIsFlashOn(current => !current);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#666" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            Please grant camera permission to use AR navigation features
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={isFlashOn}
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onClose}>
            <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
              <Ionicons name="close" size={28} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.topRight}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
                <Ionicons 
                  name={isFlashOn ? "flash" : "flash-off"} 
                  size={24} 
                  color={isFlashOn ? "#FFD60A" : "#fff"} 
                />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        {/* AR Overlay - Location Information */}
        <View style={styles.arOverlay}>
          {/* Crosshair */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairLine} />
            <View style={[styles.crosshairLine, styles.crosshairLineVertical]} />
            <View style={styles.crosshairCenter} />
          </View>

          {/* Location Info Card */}
          {(userLocation || indoorPosition) && (
            <View style={styles.locationInfoCard}>
              <BlurView intensity={80} tint="dark" style={styles.locationInfoBlur}>
                <View style={styles.locationInfoHeader}>
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <Text style={styles.locationInfoTitle}>Current Position</Text>
                </View>

                {userLocation && (
                  <View style={styles.locationInfoRow}>
                    <Text style={styles.locationInfoLabel}>GPS:</Text>
                    <Text style={styles.locationInfoValue}>
                      {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}

                {indoorPosition && (
                  <View style={styles.locationInfoRow}>
                    <Text style={styles.locationInfoLabel}>Indoor:</Text>
                    <Text style={styles.locationInfoValue}>
                      X:{indoorPosition.x} Y:{indoorPosition.y} ({indoorPosition.confidence.toFixed(0)}%)
                    </Text>
                  </View>
                )}

                {userLocation?.heading && (
                  <View style={styles.locationInfoRow}>
                    <Text style={styles.locationInfoLabel}>Heading:</Text>
                    <Text style={styles.locationInfoValue}>
                      {userLocation.heading.toFixed(0)}°
                    </Text>
                  </View>
                )}
              </BlurView>
            </View>
          )}

          {/* Direction Indicator */}
          {userLocation?.heading && (
            <View style={styles.compassContainer}>
              <BlurView intensity={80} tint="dark" style={styles.compassBlur}>
                <Ionicons 
                  name="navigate" 
                  size={32} 
                  color="#007AFF"
                  style={{ 
                    transform: [{ rotate: `${userLocation.heading}deg` }] 
                  }}
                />
                <Text style={styles.compassText}>
                  {userLocation.heading.toFixed(0)}°
                </Text>
              </BlurView>
            </View>
          )}
        </View>

        {/* Bottom Instructions */}
        <View style={styles.bottomInstructions}>
          <BlurView intensity={80} tint="dark" style={styles.instructionsBlur}>
            <Ionicons name="information-circle" size={20} color="#fff" />
            <Text style={styles.instructionsText}>
              Point camera at landmarks to navigate
            </Text>
          </BlurView>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshair: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairLine: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: '#007AFF',
  },
  crosshairLineVertical: {
    width: 2,
    height: 40,
  },
  crosshairCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  locationInfoCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  locationInfoBlur: {
    padding: 16,
  },
  locationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationInfoLabel: {
    fontSize: 14,
    color: '#999',
    width: 70,
  },
  locationInfoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  compassContainer: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  compassBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bottomInstructions: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionsBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  instructionsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
  },
});

