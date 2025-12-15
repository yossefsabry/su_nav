import { useCamera } from '@/hooks/use-camera';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { calculateBearing, calculateGPSDistance, getCompassDirection } from '@/services/indoor-positioning';
import { LocationPoint } from '@/types/location';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface ARNavigationProps {
  onClose: () => void;
  destination?: LocationPoint | null;
}

interface DirectionDot {
  id: string;
  angle: number; // Angle relative to user heading
  distance: number;
  isMain: boolean;
}

export function ARNavigationComponent({ onClose, destination }: ARNavigationProps) {
  const { hasPermission, requestPermission } = useCamera();
  const { userLocation } = useLocationTracking();
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [directionDots, setDirectionDots] = useState<DirectionDot[]>([]);
  const cameraRef = useRef<CameraView>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for dots
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, []);

  // Calculate direction dots based on destination and user heading
  useEffect(() => {
    if (!destination || !userLocation) {
      setDirectionDots([]);
      return;
    }

    const bearing = calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    const userHeading = userLocation.heading || 0;
    const distance = calculateGPSDistance(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    // Calculate relative angle (-180 to 180)
    let relativeAngle = bearing - userHeading;
    if (relativeAngle > 180) relativeAngle -= 360;
    if (relativeAngle < -180) relativeAngle += 360;

    // Create dots to guide the user
    const dots: DirectionDot[] = [];
    
    // Main direction dot
    dots.push({
      id: 'main',
      angle: relativeAngle,
      distance: distance,
      isMain: true,
    });

    // Add helper dots if destination is not in front view
    if (Math.abs(relativeAngle) > 30) {
      // Add intermediate dots to show turning direction
      const step = relativeAngle > 0 ? 20 : -20;
      let currentAngle = step;
      let dotCount = 0;
      
      while (Math.abs(currentAngle) < Math.abs(relativeAngle) && dotCount < 3) {
        dots.push({
          id: `helper-${dotCount}`,
          angle: currentAngle,
          distance: distance,
          isMain: false,
        });
        currentAngle += step;
        dotCount++;
      }
    }

    setDirectionDots(dots);
  }, [destination, userLocation?.heading, userLocation?.latitude, userLocation?.longitude]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setIsFlashOn(current => !current);
  };

  // Calculate screen position for dot based on angle
  const getDotPosition = (angle: number) => {
    // Map angle to screen position
    // Camera FOV is approximately 60-70 degrees
    const fov = 65;
    const halfFov = fov / 2;
    
    // If dot is outside FOV, clamp to edge
    const clampedAngle = Math.max(-halfFov, Math.min(halfFov, angle));
    
    // Convert angle to horizontal position (0 = center, -1 = left edge, 1 = right edge)
    const normalizedX = clampedAngle / halfFov;
    
    // Convert to screen coordinates
    const x = (width / 2) + (normalizedX * (width / 2) * 0.8); // 0.8 to add padding
    const y = height * 0.4; // Position dots at 40% from top
    
    return { x, y, isOffScreen: Math.abs(angle) > halfFov };
  };

  const getDistanceInfo = () => {
    if (!destination || !userLocation) return null;
    
    const distance = calculateGPSDistance(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );
    
    const bearing = calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );
    
    const direction = getCompassDirection(bearing);
    
    return {
      distance: Math.round(distance),
      direction,
      eta: Math.ceil(distance / 1.4 / 60), // Walking speed 1.4 m/s
    };
  };

  const distanceInfo = getDistanceInfo();

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
            Please grant camera permission to use AR navigation
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
        onMountError={(error) => {
          console.log('Camera mount error:', error);
        }}
      >
        {/* Top Controls */}
        <View style={[styles.topControls, { top: insets.top + 16 }]}>
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

        {/* AR Overlay - Direction Dots */}
        <View style={styles.arOverlay} pointerEvents="none">
          {/* Horizon Line */}
          <View style={styles.horizonLine} />
          
          {/* Direction Dots */}
          {directionDots.map((dot) => {
            const position = getDotPosition(dot.angle);
            
            if (position.isOffScreen && !dot.isMain) {
              return null; // Don't show helper dots if off-screen
            }

            return (
              <View
                key={dot.id}
                style={[
                  styles.dotContainer,
                  {
                    left: position.x - 20,
                    top: position.y - 20,
                  },
                ]}
              >
                {dot.isMain ? (
                  <Animated.View
                    style={[
                      styles.mainDot,
                      {
                        transform: [{ scale: pulseAnim }],
                        opacity: position.isOffScreen ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="navigate" size={32} color="#fff" />
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      styles.helperDot,
                      {
                        opacity: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.8],
                        }),
                      },
                    ]}
                  />
                )}
                
                {/* Distance label for main dot */}
                {dot.isMain && distanceInfo && (
                  <View style={styles.distanceLabel}>
                    <BlurView intensity={80} tint="dark" style={styles.distanceLabelBlur}>
                      <Text style={styles.distanceLabelText}>
                        {distanceInfo.distance}m
                      </Text>
                    </BlurView>
                  </View>
                )}
              </View>
            );
          })}

          {/* Center Crosshair */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairLine} />
            <View style={[styles.crosshairLine, styles.crosshairLineVertical]} />
            <View style={styles.crosshairCenter} />
          </View>
        </View>

        {/* Destination Info Card */}
        {destination && distanceInfo && (
          <View style={[styles.destinationCard, { top: insets.top + 90 }]}>
            <BlurView intensity={90} tint="dark" style={styles.destinationCardBlur}>
              <View style={styles.destinationHeader}>
                <Ionicons name="location" size={24} color="#34C759" />
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationTitle} numberOfLines={1}>
                    {destination.label}
                  </Text>
                  <View style={styles.destinationMeta}>
                    <Text style={styles.destinationMetaText}>
                      {distanceInfo.distance}m
                    </Text>
                    <Text style={styles.destinationDot}>•</Text>
                    <Text style={styles.destinationMetaText}>
                      {distanceInfo.direction}
                    </Text>
                    <Text style={styles.destinationDot}>•</Text>
                    <Text style={styles.destinationMetaText}>
                      {distanceInfo.eta} min
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        )}

        {/* Instructions */}
        {destination ? (
          <View style={[styles.bottomInstructions, { bottom: insets.bottom + 40 }]}>
            <BlurView intensity={80} tint="dark" style={styles.instructionsBlur}>
              <Ionicons name="navigate-circle" size={20} color="#34C759" />
              <Text style={styles.instructionsText}>
                Follow the blue dots to your destination
              </Text>
            </BlurView>
          </View>
        ) : (
          <View style={[styles.bottomInstructions, { bottom: insets.bottom + 40 }]}>
            <BlurView intensity={80} tint="dark" style={styles.instructionsBlur}>
              <Ionicons name="information-circle" size={20} color="#fff" />
              <Text style={styles.instructionsText}>
                Select a destination from the map to start AR navigation
              </Text>
            </BlurView>
          </View>
        )}

        {/* Compass */}
        {userLocation?.heading !== null && userLocation?.heading !== undefined && (
          <View style={[styles.compassContainer, { bottom: insets.bottom + 140 }]}>
            <BlurView intensity={80} tint="dark" style={styles.compassBlur}>
              <Ionicons 
                name="compass" 
                size={32} 
                color="#007AFF"
                style={{ 
                  transform: [{ rotate: `${userLocation.heading}deg` }] 
                }}
              />
              <Text style={styles.compassText}>
                {Math.round(userLocation.heading)}°
              </Text>
            </BlurView>
          </View>
        )}
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizonLine: {
    position: 'absolute',
    top: height * 0.4,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  helperDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  distanceLabel: {
    position: 'absolute',
    bottom: -35,
    borderRadius: 8,
    overflow: 'hidden',
  },
  distanceLabelBlur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  distanceLabelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  crosshair: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairLine: {
    position: 'absolute',
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  crosshairLineVertical: {
    width: 2,
    height: 30,
  },
  crosshairCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  destinationCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  destinationCardBlur: {
    padding: 16,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destinationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  destinationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationMetaText: {
    fontSize: 14,
    color: '#aaa',
  },
  destinationDot: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 6,
  },
  compassContainer: {
    position: 'absolute',
    right: 16,
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  compassBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  bottomInstructions: {
    position: 'absolute',
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
    flex: 1,
  },
});

