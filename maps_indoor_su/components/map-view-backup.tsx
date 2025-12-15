import { useLocationTracking } from '@/hooks/use-location-tracking';
import { calculateGPSDistance, calculateRoute, getLocationPoints } from '@/services/indoor-positioning';
import { LocationPoint } from '@/types/location';
import { useTheme } from '@/contexts/theme-context';
import { lightMapStyle } from '@/constants/map-styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, Circle } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface MapViewComponentProps {
  onCameraPress?: () => void;
}

// Custom User Location Marker - Large blue arrow with circle like Google Maps Navigation
const UserLocationMarker: React.FC<{ heading: number; size?: number }> = ({ heading, size = 60 }) => {
  return (
    <View style={{ 
      width: size * 1.5, 
      height: size * 1.5, 
      justifyContent: 'center', 
      alignItems: 'center',
      transform: [{ rotate: `${heading}deg` }]
    }}>
      <Svg width={size * 1.5} height={size * 1.5} viewBox="0 0 90 90">
        {/* Large directional arrow - pointing up */}
        <Path
          d="M 45 10 L 60 50 L 45 45 L 30 50 Z"
          fill="#4285F4"
          stroke="white"
          strokeWidth="3"
        />
        {/* Outer light blue circle glow */}
        <Path
          d="M 45 60 m -22, 0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0"
          fill="rgba(66, 133, 244, 0.25)"
        />
        {/* Main blue circle */}
        <Path
          d="M 45 60 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0"
          fill="#4285F4"
        />
        {/* White border ring */}
        <Path
          d="M 45 60 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0"
          fill="none"
          stroke="white"
          strokeWidth="4"
        />
      </Svg>
    </View>
  );
};

// Simple Blue Location Pin Marker
const LocationPinMarker: React.FC<{ size?: number }> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size * 1.35} viewBox="0 0 28 38" style={{ overflow: 'visible' }}>
      {/* Pin shadow */}
      <Path
        d="M 14 36 m -5, 0 a 5,2 0 1,0 10,0 a 5,2 0 1,0 -10,0"
        fill="rgba(0, 0, 0, 0.2)"
      />
      {/* Main pin shape */}
      <Path
        d="M 14 2 C 9 2 5 6 5 11 C 5 18 14 34 14 34 C 14 34 23 18 23 11 C 23 6 19 2 14 2 Z"
        fill="#4285F4"
        stroke="white"
        strokeWidth="1.5"
      />
      {/* Inner white circle */}
      <Path
        d="M 14 11 m -4, 0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0"
        fill="white"
      />
    </Svg>
  );
};

export const MapViewComponent = React.forwardRef((
  { onCameraPress }: MapViewComponentProps,
  ref
) => {
  const { userLocation, isTracking } = useLocationTracking();
  const { colors } = useTheme();
  
  const mapRef = useRef<MapView>(null);
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [route, setRoute] = useState<LocationPoint[]>([]);
  const [navigationActive, setNavigationActive] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 28.249300,
    longitude: 33.630945,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  const centerCoordinates = useMemo(() => ({ 
    latitude: 28.249300, 
    longitude: 33.630945 
  }), []);

  const allLocationPoints = useMemo(() => getLocationPoints(), []);

  // Filter visible points based on zoom level
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

  // Filter suggestions based on search query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allLocationPoints.filter(location =>
      location.label.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, allLocationPoints]);



  const handlePointPress = useCallback((point: LocationPoint) => {
    setSelectedPoint(point);
    setNavigationActive(false);
    
    if (userLocation) {
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

      const calculatedRoute = calculateRoute(userPoint, point);
      setRoute(calculatedRoute);
      
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

  React.useImperativeHandle(ref, () => ({
    handlePointPress,
    getSelectedPoint: () => selectedPoint,
  }), [selectedPoint, handlePointPress]);

  // Update camera for 3D mode - only when following
  useEffect(() => {
    if (!followUser || !userLocation || !mapRef.current || !is3DMode) return;
    
    mapRef.current.animateCamera({
      center: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      pitch: 60,
      heading: userLocation.heading || 0,
      zoom: 18,
    }, { duration: 500 });
  }, [followUser, is3DMode]);

  // Update region for 2D mode - only when following
  useEffect(() => {
    if (!followUser || !userLocation || !mapRef.current || is3DMode || selectedPoint || navigationActive) return;
    
    mapRef.current.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    }, 1000);
  }, [followUser, is3DMode, selectedPoint, navigationActive]);

  const startNavigation = () => {
    if (selectedPoint && userLocation) {
      setNavigationActive(true);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      setFollowUser(true);
      if (is3DMode) {
        mapRef.current.animateCamera({
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          pitch: 60,
          heading: userLocation.heading || 0,
          zoom: 18,
        }, { duration: 500 });
      } else {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }, 500);
      }
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
  };

  const handleSearchSelect = (point: LocationPoint) => {
    setSearchQuery('');
    setShowSuggestions(false);
    handlePointPress(point);
  };

  const getDistanceInfo = () => {
    if (!selectedPoint || !userLocation) return null;
    
    const distance = calculateGPSDistance(
      userLocation.latitude,
      userLocation.longitude,
      selectedPoint.latitude,
      selectedPoint.longitude
    );
    
    const walkingSpeed = 1.4;
    const eta = Math.ceil(distance / walkingSpeed / 60);
    
    return { distance: Math.round(distance), eta };
  };

  const distanceInfo = getDistanceInfo();

  // Always use light map style for clean white appearance
  const mapStyle = lightMapStyle;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
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
        onRegionChangeComplete={(region) => {
          setCurrentRegion(region);
        }}
        onTouchStart={() => {
          if (followUser) setFollowUser(false);
        }}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        zoomTapEnabled={true}
        scrollDuringRotateOrZoomEnabled={true}
        zoomControlEnabled={false}
        minZoomLevel={14}
        maxZoomLevel={20}
        cacheEnabled={true}
        loadingEnabled={true}
        loadingBackgroundColor="#FFFFFF"
      >
        {/* Destination Markers */}
        {visiblePoints.map((point) => {
          const isSelected = selectedPoint?.id === point.id;
          if (!isSelected && navigationActive) return null;
          
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
              <LocationPinMarker />
            </Marker>
          );
        })}

        {/* Route Line */}
        {route.length > 1 && (
          <Polyline
            coordinates={route.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude,
            }))}
            strokeColor="#FFFFFF"
            strokeWidth={8}
            lineDashPattern={[20, 10]}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* User Location */}
        {userLocation && (
          <>
            {/* Accuracy pulse circle */}
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={Math.min(userLocation.accuracy || 8, 20)}
              fillColor="rgba(66, 133, 244, 0.12)"
              strokeColor="rgba(66, 133, 244, 0.25)"
              strokeWidth={1.5}
            />
            
            {/* User location arrow */}
            <Marker
              key="user-location"
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={true}
              zIndex={1000}
              tracksViewChanges={false}
            >
              <UserLocationMarker heading={userLocation.heading || 0} size={is3DMode ? 40 : 50} />
            </Marker>
          </>
        )}
      </MapView>

      {/* Top Navigation Header */}
      {navigationActive && selectedPoint && (
        <View style={[styles.navHeader, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={clearRoute} style={styles.navBackButton}>
            <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.navHeaderContent}>
            <Text style={styles.navHeaderTitle} numberOfLines={1}>
              to {selectedPoint.label}
            </Text>
            {distanceInfo && (
              <Text style={styles.navHeaderSubtitle}>
                {distanceInfo.distance}m • {distanceInfo.eta} min
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Search Bar with Inline Suggestions */}
      {!navigationActive && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchButton, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="search" size={20} color={colors.text} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search locations..."
              placeholderTextColor={colors.tertiaryText}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSuggestions(text.trim().length > 0);
              }}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSuggestions(false); }}>
                <Ionicons name="close-circle" size={20} color={colors.tertiaryText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <View style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground }]}>
              {searchSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: colors.border },
                    index === searchSuggestions.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => handleSearchSelect(suggestion)}
                >
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
                    {suggestion.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.tertiaryText} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        {/* 3D Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.cardBackground, marginBottom: 12 }]}
          onPress={toggle3DMode}
        >
          <Ionicons 
            name={is3DMode ? "cube" : "cube-outline"} 
            size={26} 
            color={is3DMode ? colors.primary : colors.text}
          />
        </TouchableOpacity>

        {/* Center on User */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.cardBackground }]}
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={26} color={isTracking ? colors.primary : colors.tertiaryText} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      {selectedPoint && !navigationActive && (
        <View style={[styles.bottomSheet, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetContent}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  {selectedPoint.label}
                </Text>
                {distanceInfo && (
                  <Text style={[styles.sheetSubtitle, { color: colors.secondaryText }]}>
                    {distanceInfo.distance}m away • {distanceInfo.eta} min walk
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                <Ionicons name="close-circle" size={30} color={colors.tertiaryText} />
              </TouchableOpacity>
            </View>

            {userLocation && (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.primary }]}
                onPress={startNavigation}
              >
                <Ionicons name="navigate" size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Navigation</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Navigation Button */}
      {navigationActive && (
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.primary }]}
          onPress={centerOnUser}
        >
          <Ionicons name="navigate" size={32} color="#FFFFFF" />
        </TouchableOpacity>
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
  // Navigation Header
  navHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  navBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navHeaderContent: {
    flex: 1,
  },
  navHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navHeaderSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  // Search Container & Suggestions
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 40,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
  // Control Buttons
  controlButtons: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    zIndex: 10,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  // Navigation Button
  navButton: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D1D6',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 15,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
