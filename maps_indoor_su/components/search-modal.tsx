import { getLocationPoints } from '@/services/indoor-positioning';
import { LocationPoint } from '@/types/location';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPoint: (point: LocationPoint) => void;
}

export function SearchModal({ visible, onClose, onSelectPoint }: SearchModalProps) {
  const { colors, colorScheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const locationPoints = getLocationPoints();

  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) {
      return locationPoints;
    }

    const query = searchQuery.toLowerCase();
    return locationPoints.filter(point => {
      return point.label.toLowerCase().includes(query);
    });
  }, [searchQuery, locationPoints]);

  const handleSelectPoint = (point: LocationPoint) => {
    onSelectPoint(point);
    setSearchQuery('');
    Keyboard.dismiss();
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    Keyboard.dismiss();
    onClose();
  };

  const renderLocationPoint = ({ item }: { item: LocationPoint }) => (
    <TouchableOpacity
      style={[styles.pointItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => handleSelectPoint(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.pointIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="location" size={24} color={colors.primary} />
      </View>
      <View style={styles.pointInfo}>
        <Text style={[styles.pointLabel, { color: colors.text }]} numberOfLines={2}>
          {item.label}
        </Text>
        <Text style={[styles.pointSubtext, { color: colors.secondaryText }]}>
          Tap to navigate
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleClose}
      />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <BlurView intensity={colorScheme === 'dark' ? 80 : 100} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.modalBlur}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Search Locations</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchInputContainer, { backgroundColor: colors.searchBackground }]}>
                <Ionicons name="search" size={22} color={colors.primary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search for a location..."
                  placeholderTextColor={colors.tertiaryText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.tertiaryText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Results */}
            <View style={styles.resultsContainer}>
              {searchQuery.trim() ? (
                <Text style={[styles.resultsHeader, { color: colors.tertiaryText }]}>
                  {filteredPoints.length} result{filteredPoints.length !== 1 ? 's' : ''} found
                </Text>
              ) : (
                <Text style={[styles.resultsHeader, { color: colors.tertiaryText }]}>
                  Type to search locations
                </Text>
              )}
              
              <FlatList
                data={filteredPoints}
                renderItem={renderLocationPoint}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="search-outline" size={72} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.text }]}>No locations found</Text>
                    <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                      Try searching with different keywords
                    </Text>
                  </View>
                }
              />
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.85,
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalBlur: {
    flex: 1,
    maxHeight: height * 0.85,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 17,
  },
  clearButton: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 30,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pointIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  pointSubtext: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});
