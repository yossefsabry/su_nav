import { ScheduleModal } from '@/components/schedule-modal';
import { scheduleStorage } from '@/services/schedule-storage';
import { DayOfWeek, ScheduleItem } from '@/types/schedule';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleScreen() {
  const router = useRouter();
  const { colors, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSchedule();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const loadSchedule = async () => {
    try {
      const items = await scheduleStorage.getAll();
      setScheduleItems(items);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  };

  const handleSaveItem = async (item: ScheduleItem) => {
    try {
      if (editingItem) {
        await scheduleStorage.update(item.id, item);
      } else {
        await scheduleStorage.add(item);
      }
      await loadSchedule();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save schedule item');
    }
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDeleteItem = (item: ScheduleItem) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleStorage.delete(item.id);
              await loadSchedule();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete schedule item');
            }
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const getItemsForDay = (day: DayOfWeek): ScheduleItem[] => {
    return scheduleItems
      .filter(item => item.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleViewOnMap = (item: ScheduleItem) => {
    if (item.locationId) {
      router.push({
        pathname: '/map',
        params: { locationId: item.locationId.toString() }
      });
    } else {
      Alert.alert('No Location', 'This schedule item has no linked location');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'book-outline';
      case 'lab':
        return 'flask-outline';
      default:
        return 'calendar-outline';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            <View style={styles.backButton} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Schedule</Text>
            <View style={styles.addButton} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading schedule...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Animated.View
        style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}
      >
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        
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
          <View style={styles.backButton} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Schedule</Text>
          <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
            <Ionicons name="add" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Schedule Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {DAYS.map((day) => {
            const dayItems = getItemsForDay(day);

            return (
              <View key={day} style={styles.daySection}>
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayTitle, { color: colors.text }]}>{day}</Text>
                  <Text style={[styles.dayCount, { color: colors.secondaryText }]}>{dayItems.length} {dayItems.length === 1 ? 'item' : 'items'}</Text>
                </View>

                {dayItems.length === 0 ? (
                  <View style={[styles.emptyDay, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.emptyDayText, { color: colors.tertiaryText }]}>No schedule for this day</Text>
                  </View>
                ) : (
                  dayItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.scheduleCard, { backgroundColor: colors.cardBackground }]}
                      onLongPress={() => handleEditItem(item)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.cardColorBar, { backgroundColor: item.color || '#007AFF' }]} />

                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardTitleRow}>
                            <Ionicons
                              name={getTypeIcon(item.type) as any}
                              size={20}
                              color={item.color || '#007AFF'}
                            />
                            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.title}
                            </Text>
                          </View>
                          <View style={styles.cardActions}>
                            {item.locationId && (
                              <TouchableOpacity
                                onPress={() => handleViewOnMap(item)}
                                style={styles.iconButton}
                              >
                                <Ionicons name="location-outline" size={20} color={colors.primary} />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={() => handleEditItem(item)}
                              style={styles.iconButton}
                            >
                              <Ionicons name="pencil-outline" size={20} color={colors.secondaryText} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteItem(item)}
                              style={styles.iconButton}
                            >
                              <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.cardDetails}>
                          <View style={styles.cardDetailRow}>
                            <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
                            <Text style={[styles.cardDetailText, { color: colors.secondaryText }]}>
                              {item.startTime} - {item.endTime}
                            </Text>
                          </View>

                          <View style={styles.cardDetailRow}>
                            <Ionicons name="business-outline" size={16} color={colors.secondaryText} />
                            <Text style={[styles.cardDetailText, { color: colors.secondaryText }]}>
                              {item.room}
                            </Text>
                          </View>

                          {item.instructor && (
                            <View style={styles.cardDetailRow}>
                              <Ionicons name="person-outline" size={16} color={colors.secondaryText} />
                              <Text style={[styles.cardDetailText, { color: colors.secondaryText }]}>
                                {item.instructor}
                              </Text>
                            </View>
                          )}

                          {item.notes && (
                            <View style={styles.cardDetailRow}>
                              <Ionicons name="document-text-outline" size={16} color={colors.secondaryText} />
                              <Text style={[styles.cardDetailText, { color: colors.secondaryText }]} numberOfLines={2}>
                                {item.notes}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}

          {scheduleItems.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={80} color={colors.border} />
              <Text style={[styles.emptyStateTitle, { color: colors.tertiaryText }]}>No Schedule Yet</Text>
              <Text style={[styles.emptyStateText, { color: colors.tertiaryText }]}> 
                Tap the + button to add your first class or lab
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
          onPress={handleAddNew}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        {/* Schedule Modal */}
        <ScheduleModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
          editItem={editingItem}
        />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  daySection: {
    marginTop: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  dayCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyDay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#999',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardColorBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  cardDetails: {
    gap: 6,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
