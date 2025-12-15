// Indoor Map View - Main component for indoor navigation
// Based on mockup architecture with React Native implementation

import React, { forwardRef, useImperativeHandle, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IndoorMapWrapper, MapControls } from './indoor-map';
import { indoorGraphData, getFloorData } from '@/services/indoor-map-data';
import { findPath, navigateToObject } from '@/services/pathfinding';
import { ObjectData, NavigationRoute } from '@/types/indoor-map';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IndoorMapViewProps {
  onARPress?: () => void;
}

export const IndoorMapView = forwardRef<any, IndoorMapViewProps>((props, ref) => {
  const { onARPress } = props;
  const insets = useSafeAreaInsets();

  // State
  const [currentFloor, setCurrentFloor] = useState(0);
  const [activePosition, setActivePosition] = useState<string | undefined>('v1'); // Default start position
  const [activePath, setActivePath] = useState<string[] | undefined>(undefined);
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showPositions, setShowPositions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Get current floor data - memoized to prevent unnecessary recalculations
  const floorData = useMemo(() => getFloorData(currentFloor), [currentFloor]);
  const graphData = useMemo(() => indoorGraphData, []); // Use global data for now, can be per-floor later

  // Handle object press
  const handleObjectPress = useCallback((object: ObjectData) => {
    Keyboard.dismiss();
    setSelectedObject(object);
    setShowObjectModal(true);
  }, []);

  // Handle position press (for setting start position in edit mode)
  const handlePositionPress = useCallback((vertexId: string) => {
    setActivePosition(vertexId);
    setActivePath(undefined);
    setShowPositions(false);
  }, []);

  // Navigate to object
  const navigateToSelectedObject = useCallback(() => {
    if (!selectedObject || !activePosition) return;

    const route = navigateToObject(selectedObject.name, activePosition, graphData);
    
    if (route) {
      setActivePath(route.path);
      setShowObjectModal(false);
    }
  }, [selectedObject, activePosition, graphData]);

  // Clear navigation
  const clearNavigation = useCallback(() => {
    setActivePath(undefined);
    setSelectedObject(null);
  }, []);

  // Toggle edit mode (show positions)
  const toggleEditMode = useCallback(() => {
    setShowPositions(prev => !prev);
    if (activePath) {
      setActivePath(undefined);
    }
  }, [activePath]);

  // Search for objects - memoized to prevent filtering on every render
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return graphData.objects.filter(obj =>
      obj.name.toLowerCase().includes(query) ||
      obj.desc?.toLowerCase().includes(query)
    );
  }, [searchQuery, graphData.objects]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    setDestination: (destination: any) => {
      // Handle destination from external sources
      const object = graphData.objects.find(o => o.name === destination.name);
      if (object) {
        setSelectedObject(object);
        navigateToSelectedObject();
      }
    },
  }));

  return (
    <View style={styles.container}>
      {/* Indoor Map */}
      <IndoorMapWrapper
        graphData={graphData}
        viewBox={floorData.viewBox}
        activePosition={activePosition}
        activePath={activePath}
        showPositions={showPositions}
        onObjectPress={handleObjectPress}
        onPositionPress={handlePositionPress}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { top: insets.top + 20 }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rooms, areas..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSearch(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {showSearch && searchQuery.length > 0 && (
          <ScrollView style={styles.searchResults}>
            {searchResults.map((object) => (
              <TouchableOpacity
                key={object.id}
                style={styles.searchResultItem}
                onPress={() => {
                  setSelectedObject(object);
                  setShowObjectModal(true);
                  setShowSearch(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="location" size={18} color="#4285F4" />
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{object.name}</Text>
                  {object.desc && (
                    <Text style={styles.searchResultDesc}>{object.desc}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {searchResults.length === 0 && (
              <Text style={styles.noResults}>No results found</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Map Controls */}
      <MapControls
        currentFloor={currentFloor}
        totalFloors={4}
        onFloorChange={setCurrentFloor}
        showFloorSelector={false} // Hide until multi-floor is implemented
      />

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { bottom: insets.bottom + 120 }]}>
        {/* AR Navigation */}
        {onARPress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.arButton]}
            onPress={onARPress}
          >
            <Ionicons name="navigate" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Toggle Edit Mode */}
        <TouchableOpacity
          style={[styles.actionButton, showPositions && styles.actionButtonActive]}
          onPress={toggleEditMode}
        >
          <Ionicons 
            name="create" 
            size={24} 
            color={showPositions ? "#4285F4" : "#fff"} 
          />
        </TouchableOpacity>

        {/* Clear Navigation */}
        {activePath && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearNavigation}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Object Details Modal */}
      <Modal
        visible={showObjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowObjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedObject?.name}</Text>
              <TouchableOpacity onPress={() => setShowObjectModal(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedObject?.desc && (
              <Text style={styles.modalDescription}>{selectedObject.desc}</Text>
            )}

            <TouchableOpacity
              style={styles.navigateButton}
              onPress={navigateToSelectedObject}
            >
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.navigateButtonText}>Navigate Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

IndoorMapView.displayName = 'IndoorMapView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  searchResults: {
    marginTop: 8,
    maxHeight: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  searchResultDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
  },
  actionButtons: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  actionButton: {
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
  actionButtonActive: {
    backgroundColor: '#fff',
  },
  arButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4285F4',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
