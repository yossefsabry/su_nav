import { lightMapStyle } from '@/constants/map-styles';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { getLocationPoints } from '@/services/indoor-positioning';
import { LocationPoint } from '@/types/location';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { AnimatedRegion, Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Svg, { Defs, Path, Stop, Circle as SvgCircle, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const AnimatedMarker = Animated.createAnimatedComponent(Marker);

const INITIAL_REGION: Region = {
  latitude: 28.2493,
  longitude: 33.630945,
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
};

const normalizeHeading = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const headingDelta = (current: number, target: number) => {
  const diff = ((target - current + 540) % 360) - 180;
  return diff;
};

interface MapViewComponentProps {
  onCameraPress?: () => void;
}

// User Location Indicator - circular marker with directional arrow
const UserLocationIndicator = React.memo<{ heading: number; size?: number }>(({ heading, size = 54 }) => {
  return (
    <View style={{ 
      width: size, 
      height: size, 
      transform: [{ rotate: `${heading}deg` }],
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <SvgLinearGradient id="outerGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4285F4" stopOpacity="1" />
            <Stop offset="1" stopColor="#1557b0" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <SvgCircle cx="32" cy="32" r="26" fill="rgba(66, 133, 244, 0.18)" />
        <SvgCircle cx="32" cy="32" r="18" fill="url(#outerGradient)" />
        <SvgCircle cx="32" cy="32" r="18" fill="none" stroke="white" strokeWidth="3" />
        <SvgCircle cx="32" cy="32" r="8" fill="rgba(255, 255, 255, 0.95)" stroke="#4285F4" strokeWidth="2" />
      </Svg>
    </View>
  );
});

// Location Pin Marker - Optimized with memo to prevent re-renders
const LocationPin = React.memo<{ size?: number }>(({ size = 24 }) => {
  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 32 45">
      {/* Shadow */}
      <Path
        d="M 16 43 m -6, 0 a 6,2 0 1,0 12,0 a 6,2 0 1,0 -12,0"
        fill="rgba(0, 0, 0, 0.2)"
      />
      {/* Pin body */}
      <Path
        d="M 16 4 C 10 4 5 9 5 15 C 5 24 16 40 16 40 C 16 40 27 24 27 15 C 27 9 22 4 16 4 Z"
        fill="#4285F4"
        stroke="white"
        strokeWidth="2"
      />
      {/* Inner white circle */}
      <SvgCircle cx="16" cy="15" r="5" fill="white" />
    </Svg>
  );
});

export const MapViewComponent = forwardRef((props: MapViewComponentProps, ref) => {
  const { onCameraPress } = props;
  const { userLocation } = useLocationTracking();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const animatedUserCoordinate = useRef(
    new AnimatedRegion({
      latitude: INITIAL_REGION.latitude,
      longitude: INITIAL_REGION.longitude,
    })
  );
  const lastRegionRef = useRef<Region>(INITIAL_REGION);

  // State
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [markersLoaded, setMarkersLoaded] = useState(false);
  const [hasUserPosition, setHasUserPosition] = useState(false);
  const [displayHeading, setDisplayHeading] = useState(0);
  const headingAnimationRef = useRef<number | null>(null);
  const headingTargetRef = useRef(0);
  
  // Last known position for detecting movement
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  const getCurrentCoordinate = useCallback(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }

    const animatedValue = (animatedUserCoordinate.current as unknown as { __getValue?: () => { latitude: number; longitude: number } })?.__getValue?.();
    if (animatedValue) {
      return {
        latitude: animatedValue.latitude,
        longitude: animatedValue.longitude,
      };
    }

    return null;
  }, [userLocation]);

  // Get all location points
  const locationPoints = useMemo(() => getLocationPoints(), []);
  
  // Allow markers to render initially, then stop tracking view changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMarkersLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  


  // Center coordinates (zoomed in closer by default to show all 5 locations clearly)
  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return locationPoints
      .filter(point => 
        point.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery, locationPoints]);

  // Detect if user is moving - DISABLED for manual zoom control
  // Movement detection is now manual - user controls when to follow via center button
  useEffect(() => {
    if (!userLocation) return;
    lastPositionRef.current = { lat: userLocation.latitude, lng: userLocation.longitude };
  }, [userLocation]);

  useEffect(() => {
    if (!userLocation) return;
    setHasUserPosition(true);
    animatedUserCoordinate.current.timing({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [userLocation]);

  useEffect(() => {
    if (headingAnimationRef.current) {
      cancelAnimationFrame(headingAnimationRef.current);
      headingAnimationRef.current = null;
    }

    if (typeof userLocation?.heading !== 'number') return;

    headingTargetRef.current = normalizeHeading(userLocation.heading);

    const animateHeading = () => {
      setDisplayHeading(prevHeading => {
        const current = normalizeHeading(prevHeading);
        const diff = headingDelta(current, headingTargetRef.current);

        if (Math.abs(diff) < 0.25) {
          headingAnimationRef.current = null;
          return headingTargetRef.current;
        }

        headingAnimationRef.current = requestAnimationFrame(animateHeading);
        return normalizeHeading(current + diff * 0.18);
      });
    };

    headingAnimationRef.current = requestAnimationFrame(animateHeading);

    return () => {
      if (headingAnimationRef.current) {
        cancelAnimationFrame(headingAnimationRef.current);
        headingAnimationRef.current = null;
      }
    };
  }, [userLocation?.heading]);

  // Smart camera system - only center on user
  useEffect(() => {
    if (!mapRef.current || !isFollowingUser || !hasUserPosition) return;

    const coordinate = getCurrentCoordinate();
    if (!coordinate) return;

    const cameraConfig: any = {
      center: coordinate,
      heading: is3DMode ? displayHeading : 0,
    };

    if (is3DMode) {
      cameraConfig.pitch = 60;
      cameraConfig.zoom = 17;
    } else {
      cameraConfig.pitch = 0;
    }

    mapRef.current.animateCamera(cameraConfig, { duration: 300 });
  }, [isFollowingUser, is3DMode, displayHeading, hasUserPosition, getCurrentCoordinate]);

  // Handle point selection - clear everything when new location selected
  const handlePointPress = useCallback((point: LocationPoint) => {
    // Clear previous state
    setShowRoute(false);
    setRouteCoordinates([]);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsFollowingUser(false);
    
    // Set new selection
    setSelectedPoint(point);
  }, []);

  // Show directions/route
  const showDirections = useCallback(() => {
    if (!selectedPoint || !userLocation) return;
    
    // Create route coordinates
    const route = [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: selectedPoint.latitude, longitude: selectedPoint.longitude },
    ];
    
    setRouteCoordinates(route);
    setShowRoute(true);
    setIsFollowingUser(false);
  }, [selectedPoint, userLocation]);

  // Handle search selection
  const handleSearchSelect = (point: LocationPoint) => {
    handlePointPress(point);
    setSearchQuery(point.label);
    setShowSuggestions(false);
  };

  // Center on user
  const centerOnUser = () => {
    if (!mapRef.current) {
      return;
    }

    const coordinate = getCurrentCoordinate();
    if (!coordinate) {
      setIsFollowingUser(false);
      return;
    }

    if (mapRef.current) {
      setIsFollowingUser(true);
      setSelectedPoint(null);
      
      if (is3DMode) {
        mapRef.current.animateCamera({
          center: coordinate,
          pitch: 60,
          heading: displayHeading,
          zoom: 16,
        }, { duration: 500 });
      } else {
        mapRef.current.animateCamera({
          center: coordinate,
          heading: 0,
          zoom: 16,
        }, { duration: 500 });
      }
    }
  };

  // Toggle 3D/2D mode
  const toggle3DMode = () => {
    const newMode = !is3DMode;
    setIs3DMode(newMode);
    
    if (mapRef.current) {
      const currentCoordinate = getCurrentCoordinate();
      const centerCoordinates = currentCoordinate
        ? currentCoordinate
        : {
            latitude: lastRegionRef.current.latitude,
            longitude: lastRegionRef.current.longitude,
          };

      if (newMode) {
        mapRef.current.animateCamera({
          center: centerCoordinates,
          pitch: 60,
          heading: displayHeading,
          zoom: 17,
        }, { duration: 500 });
      } else {
        mapRef.current.animateCamera({
          center: centerCoordinates,
          pitch: 0,
          heading: 0,
        }, { duration: 500 });
      }
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    handlePointPress,
    getSelectedPoint: () => selectedPoint,
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={lightMapStyle}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoors={true}
        showsBuildings={true}
        mapType="standard"
        onPress={(e) => {
          // Handle map press (not marker press)
          if (e.nativeEvent.action === 'marker-press') return;
          if (isFollowingUser) setIsFollowingUser(false);
        }}
        onRegionChangeComplete={(region) => {
          lastRegionRef.current = region;
          // User manually moved map - stop following
          if (isFollowingUser) setIsFollowingUser(false);
        }}
        pitchEnabled={true}
        rotateEnabled={true}
        zoomEnabled={true}
        zoomTapEnabled={true}
        zoomControlEnabled={true}
        scrollEnabled={true}
        scrollDuringRotateOrZoomEnabled={true}
        loadingEnabled={true}
        loadingBackgroundColor="#FFFFFF"
        minZoomLevel={10}
        maxZoomLevel={21}
      >
        {/* Location Markers */}
        {locationPoints.map((point) => (
          <Marker
            key={`marker-${point.id}`}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            onPress={(e) => {
              e.stopPropagation();
              handlePointPress(point);
            }}
            anchor={{ x: 0.5, y: 1 }}
            title={point.label}
            tracksViewChanges={!markersLoaded}
            stopPropagation={true}
          >
            <LocationPin />
          </Marker>
        ))}

        {/* Route Polyline */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4285F4"
            strokeWidth={4}
            lineDashPattern={[10, 10]}
          />
        )}

        {/* User Location */}
        {hasUserPosition && (
          <AnimatedMarker
            key="user-location"
            coordinate={animatedUserCoordinate.current}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            zIndex={1000}
            tracksViewChanges={!markersLoaded}
          >
            <UserLocationIndicator 
              heading={displayHeading} 
              size={is3DMode ? 54 : 60} 
            />
          </AnimatedMarker>
        )}
      </MapView>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { top: insets.top + 20 }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(text.length > 0);
            }}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestions}>
            {searchSuggestions.map((point) => (
              <TouchableOpacity
                key={point.id}
                style={styles.suggestionItem}
                onPress={() => handleSearchSelect(point)}
              >
                <Ionicons name="location" size={18} color="#4285F4" />
                <Text style={styles.suggestionText}>{point.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={[styles.controlButtons, { bottom: insets.bottom + 120 }]}>
        {/* AR/Camera Button */}
        {onCameraPress && (
          <TouchableOpacity
            style={[styles.controlButton, styles.cameraButton]}
            onPress={onCameraPress}
          >
            <Ionicons name="navigate" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        {/* 3D/2D Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, is3DMode && styles.controlButtonActive]}
          onPress={toggle3DMode}
        >
          <Ionicons 
            name="cube" 
            size={24} 
            color={is3DMode ? "#4285F4" : "#fff"} 
          />
        </TouchableOpacity>

        {/* Center on User */}
        <TouchableOpacity
          style={[styles.controlButton, styles.locateButton, isFollowingUser && styles.locateButtonActive]}
          onPress={centerOnUser}
        >
          <Ionicons 
            name={isFollowingUser ? "locate" : "locate-outline"}
            size={24}
            color={isFollowingUser ? "#1a73e8" : "#4a4a4a"}
          />
        </TouchableOpacity>
      </View>

      {/* Selected Location Info */}
      {selectedPoint && (
        <View style={[styles.infoCard, { bottom: insets.bottom + 20 }]}>
          <View style={styles.infoHeader}>
            <View style={styles.infoContent}>
              <Ionicons name="location" size={24} color="#4285F4" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>{selectedPoint.label}</Text>
                <Text style={styles.infoSubtitle}>Selected location</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedPoint(null);
                setShowRoute(false);
                setRouteCoordinates([]);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Directions Button */}
          {!showRoute ? (
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={showDirections}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.directionsButton, styles.hideDirectionsButton]}
              onPress={() => {
                setShowRoute(false);
                setRouteCoordinates([]);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.directionsButtonText}>Hide Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

UserLocationIndicator.displayName = 'UserLocationIndicator';
LocationPin.displayName = 'LocationPin';
MapViewComponent.displayName = 'MapViewComponent';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // Search
  searchContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  suggestions: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  // Control Buttons
  controlButtons: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  controlButtonActive: {
    backgroundColor: '#fff',
  },
  locateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowOpacity: 0.18,
  },
  locateButtonActive: {
    borderColor: '#1a73e8',
    shadowOpacity: 0.25,
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4285F4',
  },
  // Info Card
  infoCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hideDirectionsButton: {
    backgroundColor: '#FF3B30',
  },
});
