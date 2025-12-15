import { getLocationPoints } from '@/services/indoor-positioning';
import { DayOfWeek, ScheduleItem } from '@/types/schedule';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
  editItem?: ScheduleItem | null;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TYPES: Array<'lecture' | 'lab' | 'other'> = ['lecture', 'lab', 'other'];
const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#32ADE6', '#007AFF', '#5856D6', '#AF52DE'];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  visible,
  onClose,
  onSave,
  editItem,
}) => {
  const [title, setTitle] = useState(editItem?.title || '');
  const [type, setType] = useState<'lecture' | 'lab' | 'other'>(editItem?.type || 'lecture');
  const [day, setDay] = useState<DayOfWeek>(editItem?.day || 'Monday');
  const [startTime, setStartTime] = useState(editItem?.startTime || '');
  const [endTime, setEndTime] = useState(editItem?.endTime || '');
  const [room, setRoom] = useState(editItem?.room || '');
  const [instructor, setInstructor] = useState(editItem?.instructor || '');
  const [notes, setNotes] = useState(editItem?.notes || '');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(editItem?.locationId);
  const [selectedColor, setSelectedColor] = useState(editItem?.color || COLORS[0]);

  const locationPoints = getLocationPoints();

  const handleSave = () => {
    if (!title || !room || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const item: ScheduleItem = {
      id: editItem?.id || Date.now().toString(),
      title,
      type,
      day,
      startTime,
      endTime,
      room,
      locationId: selectedLocationId,
      instructor,
      notes,
      color: selectedColor,
    };

    onSave(item);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setType('lecture');
    setDay('Monday');
    setStartTime('');
    setEndTime('');
    setRoom('');
    setInstructor('');
    setNotes('');
    setSelectedLocationId(undefined);
    setSelectedColor(COLORS[0]);
    onClose();
  };

  React.useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setType(editItem.type);
      setDay(editItem.day);
      setStartTime(editItem.startTime);
      setEndTime(editItem.endTime);
      setRoom(editItem.room);
      setInstructor(editItem.instructor || '');
      setNotes(editItem.notes || '');
      setSelectedLocationId(editItem.locationId);
      setSelectedColor(editItem.color || COLORS[0]);
    }
  }, [editItem]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {editItem ? 'Edit Schedule' : 'Add Schedule'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View style={styles.section}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Information Security"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Type Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeContainer}>
                  {TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeButton, type === t && styles.typeButtonActive]}
                      onPress={() => setType(t)}
                    >
                      <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Day Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Day *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
                  {DAYS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayButton, day === d && styles.dayButtonActive]}
                      onPress={() => setDay(d)}
                    >
                      <Text style={[styles.dayText, day === d && styles.dayTextActive]}>
                        {d.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Time */}
              <View style={styles.section}>
                <Text style={styles.label}>Time *</Text>
                <View style={styles.timeContainer}>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    placeholder="Start (e.g., 9:00)"
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSeparator}>-</Text>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    placeholder="End (e.g., 10:30)"
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Room */}
              <View style={styles.section}>
                <Text style={styles.label}>Room *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., NG-20"
                  value={room}
                  onChangeText={setRoom}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Location */}
              <View style={styles.section}>
                <Text style={styles.label}>Link to Location (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
                  <TouchableOpacity
                    style={[styles.locationButton, !selectedLocationId && styles.locationButtonActive]}
                    onPress={() => setSelectedLocationId(undefined)}
                  >
                    <Text style={[styles.locationText, !selectedLocationId && styles.locationTextActive]}>
                      None
                    </Text>
                  </TouchableOpacity>
                  {locationPoints.map((loc) => (
                    <TouchableOpacity
                      key={loc.id}
                      style={[styles.locationButton, selectedLocationId === loc.id && styles.locationButtonActive]}
                      onPress={() => setSelectedLocationId(loc.id)}
                    >
                      <Text style={[styles.locationText, selectedLocationId === loc.id && styles.locationTextActive]} numberOfLines={1}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Instructor */}
              <View style={styles.section}>
                <Text style={styles.label}>Instructor (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dr. Smith"
                  value={instructor}
                  onChangeText={setInstructor}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Color Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorContainer}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorButton, { backgroundColor: color }]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Additional notes..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
  },
  dayScroll: {
    flexGrow: 0,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dayTextActive: {
    color: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 18,
    color: '#666',
  },
  locationScroll: {
    flexGrow: 0,
  },
  locationButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    maxWidth: 150,
  },
  locationButtonActive: {
    backgroundColor: '#007AFF',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  locationTextActive: {
    color: '#fff',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
