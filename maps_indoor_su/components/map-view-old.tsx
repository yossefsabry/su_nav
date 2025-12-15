import { useLocationTracking } from '@/hooks/use-location-tracking';
import {
    calculateGPSDistance,
    calculateRoute,
    getLocationPoints,
} from '@/services/indoor-positioning';
import { LocationPoint } from '@/types/location';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface MapViewComponentProps {
  onCameraPress?: () => void;
  onSearchPress?: () => void;
}

export const MapViewComponent = React.forwardRef((
  { onCameraPress, onSearchPress }: MapViewComponentProps, 
  ref
) => {
  const { userLocation, isTracking, error } = useLocationTracking();
  const { colors, colorScheme } = useTheme();
  
  const mapRef = useRef<MapView>(null);
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [route, setRoute] = useState<LocationPoint[]>([]);
  const [navigationActive, setNavigationActive] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 28.249300,
    longitude: 33.630945,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const [is3DMode, setIs3DMode] = useState(false);

  // Center coordinates - memoized to prevent recreating on every render
  const centerCoordinates = useMemo(() => ({ 
    latitude: 28.249300, 
    longitude: 33.630945 
  }), []);

  // Get all location points
  const allLocationPoints = useMemo(() => getLocationPoints(), []);

  // Filter points based on zoom level (Google Maps style)
  const visiblePoints = useMemo(() => {
    const zoomLevel = currentRegion.latitudeDelta;
    
    // Very zoomed out - show only key locations (every 3rd)
    if (zoomLevel > 0.01) {
      return allLocationPoints.filter((_, index) => index % 3 === 0);
    }
    
    // Medium zoom - show most locations (every 2nd)
    if (zoomLevel > 0.005) {
      return allLocationPoints.filter((_, index) => index % 2 === 0);
    }
    
    // Zoomed in - show all locations
    return allLocationPoints;
  }, [allLocationPoints, currentRegion]);

  const handlePointPress = useCallback((point: LocationPoint) => {
    setSelectedPoint(point);
    setNavigationActive(false);
    
    if (userLocation) {
      // Find nearest point to user
      const userPoint = allLocationPoints.reduce((nearest, current) => {
        const distToCurrent = calculateGPSDistance(
          userLocation.latitude,
          userLocation.longitude,
          current.latitude,
          current.longitude
        );
        const distToNearest = calculateGPSDistance(
          userLocation.latitude,
          userLocation.longitude,
          nearest.latitude,
          nearest.longitude
        );
        return distToCurrent < distToNearest ? current : nearest;
      });

      // Calculate route
      const calculatedRoute = calculateRoute(userPoint, point);
      setRoute(calculatedRoute);
      
      // Zoom to show both points
      const latDelta = Math.max(
        Math.abs(userLocation.latitude - point.latitude) * 2.5,
        0.001
      );
      const lonDelta = Math.max(
        Math.abs(userLocation.longitude - point.longitude) * 2.5,
        0.001
      );
      
      const centerLat = (userLocation.latitude + point.latitude) / 2;
      const centerLon = (userLocation.longitude + point.longitude) / 2;
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: centerLat,
          longitude: centerLon,
          latitudeDelta: latDelta,
          longitudeDelta: lonDelta,
        }, 500);
      }
    }
  }, [userLocation, allLocationPoints]);

  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    handlePointPress,
    getSelectedPoint: () => selectedPoint,
  }), [selectedPoint, handlePointPress]);

  // Center on user location when available
  useEffect(() => {
    if (userLocation && mapRef.current && !selectedPoint) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }, 1000);
    }
    // Intentionally only watching specific properties to avoid excessive re-centers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.latitude, userLocation?.longitude, selectedPoint]);

  const startNavigation = () => {
    if (selectedPoint && userLocation) {
      setNavigationActive(true);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }, 500);
    }
  };

  const clearRoute = () => {
    setRoute([]);
    setSelectedPoint(null);
    setNavigationActive(false);
  };

  const toggle3DMode = () => {
    const newMode = !is3DMode;
    setIs3DMode(newMode);
    
    // Force camera update when toggling
    if (mapRef.current) {
      if (newMode) {
        // Switch to 3D
        mapRef.current.animateCamera({
          center: {
            latitude: userLocation?.latitude || centerCoordinates.latitude,
            longitude: userLocation?.longitude || centerCoordinates.longitude,
          },
          pitch: 45,
          heading: userLocation?.heading || 0,
          altitude: 500,
          zoom: 17,
        }, { duration: 500 });
      } else {
        // Switch back to 2D
        mapRef.current.animateCamera({
          center: {
            latitude: currentRegion.latitude,
            longitude: currentRegion.longitude,
          },
          pitch: 0,
          heading: 0,
          altitude: 1500,
          zoom: 15,
        }, { duration: 500 });
      }
    }
  };

  const onRegionChangeComplete = (region: Region) => {
    setCurrentRegion(region);
  };

  // Calculate distance and ETA for display
  const getDistanceInfo = () => {
    if (!selectedPoint || !userLocation) return null;
    
    const distance = calculateGPSDistance(
      userLocation.latitude,
      userLocation.longitude,
      selectedPoint.latitude,
      selectedPoint.longitude
    );
    
    const walkingSpeed = 1.4; // m/s (average walking speed)
    const eta = Math.ceil(distance / walkingSpeed / 60); // minutes
    
    return {
      distance: Math.round(distance),
      eta,
    };
  };

  const distanceInfo = getDistanceInfo();

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: centerCoordinates.latitude,
          longitude: centerCoordinates.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsIndoors={true}
        showsBuildings={true}
        mapType="standard"
        onRegionChangeComplete={onRegionChangeComplete}
        toolbarEnabled={false}
        loadingEnabled={true}
        moveOnMarkerPress={false}
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        region={!is3DMode ? currentRegion : undefined}
        camera={is3DMode ? {
          center: {
            latitude: userLocation?.latitude || centerCoordinates.latitude,
            longitude: userLocation?.longitude || centerCoordinates.longitude,
          },
          pitch: 45,
          heading: userLocation?.heading || 0,
          altitude: 500,
          zoom: 17,
        } : undefined}
      >
        {/* Location Point Markers */}
        {visiblePoints.map((point) => {
          const isSelected = selectedPoint?.id === point.id;
          
          return (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              onPress={() => handlePointPress(point)}
              anchor={{ x: 0.5, y: 1 }}
              title={point.label}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.markerPin,
                  isSelected && styles.markerPinSelected
                ]}>
                  <Ionicons 
                    name="location" 
                    size={isSelected ? 36 : 30} 
                    color={isSelected ? "#34C759" : "#FF3B30"} 
                  />
                </View>
              </View>
            </Marker>
          );
        })}

        {/* Route Polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude,
            }))}
            strokeColor="#4285F4"
            strokeWidth={6}
            lineDashPattern={[1, 10]}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <>
            {/* Accuracy Circle */}
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={Math.min(userLocation.accuracy || 10, 50)}
              fillColor="rgba(66, 133, 244, 0.1)"
              strokeColor="rgba(66, 133, 244, 0.3)"
              strokeWidth={1}
            />
            
            {/* User Marker */}
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={true}
              zIndex={1000}
            >
              <View style={styles.userMarker}>
                {userLocation.heading !== null && userLocation.heading !== undefined && (userLocation.speed || 0) > 0.5 ? (
                  <View style={[styles.userArrow, { transform: [{ rotate: `${userLocation.heading}deg` }] }]}>
                    <Ionicons name="navigate" size={42} color="#4285F4" />
                  </View>
                ) : (
                  <View style={styles.userDot} />
                )}
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Top Search Bar */}
      {!navigationActive && (
        <View style={styles.topBar}>
          <BlurView intensity={95} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TouchableOpacity
              style={styles.searchInput}
              onPress={onSearchPress}
            >
              <Text style={styles.searchPlaceholder}>Search...</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCameraPress}>
              <Ionicons name="camera-outline" size={22} color="#666" />
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      {/* Navigation Header */}
      {navigationActive && selectedPoint && (
        <View style={styles.navHeader}>
          <BlurView intensity={95} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.navHeaderContent}>
            <TouchableOpacity onPress={clearRoute} style={styles.backButton}>
              <Ionicons name="arrow-back" size={26} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.navHeaderInfo}>
              <Text style={styles.navHeaderTitle} numberOfLines={1}>
                {selectedPoint.label}
              </Text>
              {distanceInfo && (
                <Text style={styles.navHeaderSubtitle}>
                  {distanceInfo.distance}m • {distanceInfo.eta} min walk
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onCameraPress} style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        {/* 3D Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, { marginBottom: 12 }]}
          onPress={toggle3DMode}
        >
          <BlurView intensity={95} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.buttonBlur}>
            <Ionicons 
              name={is3DMode ? "cube" : "cube-outline"} 
              size={28} 
              color={is3DMode ? "#007AFF" : "#666"} 
            />
          </BlurView>
        </TouchableOpacity>
        
        {/* Center on User */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUser}
        >
          <BlurView intensity={95} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.buttonBlur}>
            <Ionicons 
              name="locate" 
              size={28} 
              color={isTracking ? "#007AFF" : "#999"} 
            />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet - Selected Point Info */}
      {selectedPoint && !navigationActive && (
        <View style={styles.bottomSheet}>
          <BlurView intensity={95} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.bottomSheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIcon}>
                <Ionicons name="location" size={32} color="#007AFF" />
              </View>
              <View style={styles.sheetInfo}>
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {selectedPoint.label}
                </Text>
                {distanceInfo && (
                  <View style={styles.sheetDistance}>
                    <Text style={styles.sheetDistanceText}>
                      {distanceInfo.distance} m
                    </Text>
                    <Text style={styles.sheetDot}>•</Text>
                    <Text style={styles.sheetDistanceText}>
                      {distanceInfo.eta} min walk
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                <Ionicons name="close-circle" size={32} color="#999" />
              </TouchableOpacity>
            </View>

            {userLocation && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startNavigation}
              >
                <Ionicons name="navigate" size={24} color="#fff" />
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </View>
      )}

      {/* Navigation Stats */}
      {navigationActive && selectedPoint && distanceInfo && (
        <View style={styles.navStats}>
          <BlurView intensity={95} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.navStatsContent}>
            <View style={styles.navStat}>
              <Ionicons name="walk-outline" size={28} color="#007AFF" />
              <View style={styles.navStatInfo}>
                <Text style={styles.navStatLabel}>Distance</Text>
                <Text style={styles.navStatValue}>{distanceInfo.distance} m</Text>
              </View>
            </View>
            
            <View style={styles.navDivider} />
            
            <View style={styles.navStat}>
              <Ionicons name="time-outline" size={28} color="#FF9500" />
              <View style={styles.navStatInfo}>
                <Text style={styles.navStatLabel}>ETA</Text>
                <Text style={styles.navStatValue}>{distanceInfo.eta} min</Text>
              </View>
            </View>
          </BlurView>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <BlurView intensity={80} tint="dark" style={styles.errorContent}>
            <Ionicons name="warning" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </BlurView>
        </View>
      )}

    </View>
  );
});

MapViewComponent.displayName = 'MapViewComponent';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  // Top Bar
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 15,
    right: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  // Navigation Header
  navHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 15,
    right: 15,
  },
  navHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: 12,
  },
  navHeaderInfo: {
    flex: 1,
  },
  cameraButton: {
    marginLeft: 12,
    padding: 4,
  },
  navHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  navHeaderSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  // Markers
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  markerPinSelected: {
    transform: [{ scale: 1.2 }],
  },
  // User Location Marker
  userMarker: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 10,
  },
  userArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  // Control Buttons
  controlButtons: {
    position: 'absolute',
    right: 15,
    bottom: 200,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetIcon: {
    marginRight: 12,
  },
  sheetInfo: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sheetDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetDistanceText: {
    fontSize: 14,
    color: '#666',
  },
  sheetDot: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 6,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Navigation Stats
  navStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  navStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  navStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navStatInfo: {
    flex: 1,
  },
  navStatLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  navStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  navDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  // Error Banner
  errorBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 16,
    right: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  errorText: {
    marginLeft: 8,
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
  },
});
