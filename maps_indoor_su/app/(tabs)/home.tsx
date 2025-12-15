import { useLocationTracking } from '@/hooks/use-location-tracking';
import { getLocationPoints } from '@/services/indoor-positioning';
import { useTheme } from '@/contexts/theme-context';
import { LocationPoint } from '@/types/location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type EdgeInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { userLocation, isTracking, refreshLocation } = useLocationTracking();
  const { theme, setTheme, colors, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const locationPoints = getLocationPoints();

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return locationPoints.filter(location =>
      location.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, locationPoints]);

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Smooth loading animation
  React.useEffect(() => {
    // Immediate load - no artificial delay
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleThemeToggle = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'light') return 'sunny';
    if (theme === 'dark') return 'moon';
    return 'contrast';
  };

  const handleLocationPress = (location: LocationPoint) => {
    router.push({
      pathname: '/(tabs)/map',
      params: { locationId: location.id.toString() }
    });
    setSearchQuery('');
  };

  const quickActions = [
    {
      id: 1,
      title: 'Navigate',
      icon: 'navigate',
      color: colors.primary,
      gradient: ['#007AFF', '#0051D5'] as const,
      onPress: () => router.push('/(tabs)/map'),
    },
    {
      id: 2,
      title: 'Schedule',
      icon: 'calendar',
      color: colors.secondary,
      gradient: ['#FF9500', '#FF6B00'] as const,
      onPress: () => router.push('/(tabs)/schedule'),
    },
    {
      id: 3,
      title: 'Nearby',
      icon: 'location',
      color: colors.success,
      gradient: ['#34C759', '#248A3D'] as const,
      onPress: () => {
        // TODO: Show nearby locations
        router.push('/(tabs)/map');
      },
    },
    {
      id: 4,
      title: 'AR View',
      icon: 'scan',
      color: '#AF52DE',
      gradient: ['#AF52DE', '#8E44AD'] as const,
      onPress: () => {
        // TODO: Open AR view
        router.push('/(tabs)/map');
      },
    },
  ];

  const renderQuickAction = ({ item }: { item: typeof quickActions[0] }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: colors.cardBackground }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={item.icon as any} size={28} color="#fff" />
      </LinearGradient>
      <Text style={[styles.quickActionTitle, { color: colors.text }]} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderLocationItem = ({ item }: { item: LocationPoint }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => handleLocationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.locationIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="location" size={24} color={colors.primary} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationTitle, { color: colors.text }]} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={[styles.locationSubtitle, { color: colors.secondaryText }]}>
          Tap to navigate
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.tertiaryText} />
    </TouchableOpacity>
  );

  // Loading Skeleton Component
  const LoadingSkeleton = ({ insets }: { insets: EdgeInsets }) => {
    const shimmerAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const shimmerOpacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Skeleton */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              paddingTop: Math.max(16, 40 - insets.top),
            },
          ]}
        >
          <View>
            <Animated.View style={[styles.skeletonText, { width: 100, height: 14, opacity: shimmerOpacity, backgroundColor: colors.border }]} />
            <Animated.View style={[styles.skeletonText, { width: 150, height: 28, marginTop: 4, opacity: shimmerOpacity, backgroundColor: colors.border }]} />
          </View>
          <Animated.View style={[styles.skeletonIcon, { opacity: shimmerOpacity, backgroundColor: colors.border }]} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Search Bar Skeleton */}
          <View style={styles.searchSection}>
            <Animated.View style={[styles.searchContainer, { opacity: shimmerOpacity, backgroundColor: colors.searchBackground, borderColor: colors.border, borderWidth: 1 }]} />
          </View>

          {/* Status Card Skeleton */}
          <Animated.View style={[styles.statusCard, { opacity: shimmerOpacity, backgroundColor: colors.cardBackground, height: 100 }]} />

          {/* Quick Actions Skeleton */}
          <View style={styles.section}>
            <Animated.View style={[styles.skeletonText, { width: 120, height: 20, marginBottom: 16, marginLeft: 20, opacity: shimmerOpacity, backgroundColor: colors.border }]} />
            <View style={styles.quickActionsContainer}>
              {[1, 2, 3, 4].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.quickActionCard,
                    { opacity: shimmerOpacity, backgroundColor: colors.cardBackground, height: 100 }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Popular Locations Skeleton */}
          <View style={styles.section}>
            <Animated.View style={[styles.skeletonText, { width: 160, height: 20, marginBottom: 16, marginLeft: 20, opacity: shimmerOpacity, backgroundColor: colors.border }]} />
            {[1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.locationItem,
                  { opacity: shimmerOpacity, backgroundColor: colors.cardBackground, height: 80, marginBottom: 12, marginHorizontal: 20 }
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <LoadingSkeleton insets={insets} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: Math.max(16, 40 - insets.top),
          },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: colors.secondaryText }]}>Welcome back</Text>
          <Text style={[styles.title, { color: colors.text }]}>InGuide</Text>
        </View>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.secondaryBackground }]}
          onPress={handleThemeToggle}
        >
          <Ionicons name={getThemeIcon() as any} size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[
            styles.searchContainer,
            {
              backgroundColor: colors.searchBackground,
              borderColor: isSearchFocused ? colors.primary : colors.border,
              borderWidth: isSearchFocused ? 2 : 1,
            }
          ]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search locations..."
              placeholderTextColor={colors.tertiaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.tertiaryText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          {searchQuery.trim() && (
            <View style={[styles.searchResults, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {filteredLocations.length > 0 ? (
                <FlatList
                  data={filteredLocations}
                  renderItem={renderLocationItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={40} color={colors.tertiaryText} />
                  <Text style={[styles.noResultsText, { color: colors.secondaryText }]}>
                    No locations found
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Status Card */}
        {userLocation && (
          <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: colors.success + '15' }]}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Ionicons name="radio-button-on" size={16} color={colors.success} />
                </Animated.View>
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>Location Active</Text>
                <Text style={[styles.statusSubtitle, { color: colors.secondaryText }]}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
              <TouchableOpacity onPress={refreshLocation}>
                <Ionicons name="refresh" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          />
        </View>

        {/* Popular Locations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Locations</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {locationPoints.slice(0, 5).map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[styles.popularLocationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => handleLocationPress(location)}
              activeOpacity={0.7}
            >
              <View style={[styles.popularLocationIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.popularLocationText, { color: colors.text }]} numberOfLines={1}>
                {location.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.tertiaryText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          <View style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.featureItem}>
              <Ionicons name="navigate" size={24} color={colors.primary} />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Turn-by-Turn Navigation</Text>
                <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
                  Get directions to any location
                </Text>
              </View>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: colors.border }]} />
            <View style={styles.featureItem}>
              <Ionicons name="scan" size={24} color={colors.secondary} />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>AR Camera View</Text>
                <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
                  Use augmented reality for navigation
                </Text>
              </View>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: colors.border }]} />
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={24} color={colors.success} />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Schedule Manager</Text>
                <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
                  Manage your classes and labs
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResults: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
    overflow: 'hidden',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 13,
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    marginTop: 12,
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 13,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    alignItems: 'center',
    width: 100,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  popularLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  popularLocationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  popularLocationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  featureCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
  },
  featureDivider: {
    height: 1,
    marginVertical: 16,
  },
  // Skeleton Loading Styles
  skeletonText: {
    height: 16,
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
});
