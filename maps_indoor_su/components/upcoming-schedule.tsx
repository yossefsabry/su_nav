import { useTheme } from '@/contexts/theme-context';
import { ScheduleItem } from '@/types/schedule';
import { getScheduleDisplayTime } from '@/utils/schedule-utils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UpcomingScheduleProps {
    items: ScheduleItem[];
}

export function UpcomingSchedule({ items }: UpcomingScheduleProps) {
    const { colors } = useTheme();

    if (items.length === 0) {
        return null;
    }

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

    const handleItemPress = (item: ScheduleItem) => {
        if (item.locationId) {
            router.push({
                pathname: '/(tabs)/map',
                params: { locationId: item.locationId.toString() },
            });
        } else {
            router.push('/(tabs)/schedule');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Schedule</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>

            {items.map((item, index) => (
                <TouchableOpacity
                    key={`${item.id}-${index}`}
                    style={[
                        styles.scheduleCard,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.cardColorBar, { backgroundColor: item.color || colors.primary }]} />

                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleRow}>
                                <Ionicons
                                    name={getTypeIcon(item.type) as any}
                                    size={18}
                                    color={item.color || colors.primary}
                                />
                                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                            </View>
                            {item.locationId && (
                                <View style={[styles.locationBadge, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="location" size={12} color={colors.primary} />
                                </View>
                            )}
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.cardDetailRow}>
                                <Ionicons name="calendar-outline" size={14} color={colors.secondaryText} />
                                <Text style={[styles.cardDetailText, { color: colors.secondaryText }]}>
                                    {getScheduleDisplayTime(item)}
                                </Text>
                            </View>

                            <View style={styles.cardDetailRow}>
                                <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                                <Text style={[styles.cardDetailText, { color: colors.secondaryText }]}>
                                    {item.startTime} - {item.endTime}
                                </Text>
                            </View>

                            <View style={styles.cardDetailRow}>
                                <Ionicons name="business-outline" size={14} color={colors.secondaryText} />
                                <Text style={[styles.cardDetailText, { color: colors.secondaryText }]} numberOfLines={1}>
                                    {item.room}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: '600',
    },
    scheduleCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardColorBar: {
        width: 4,
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    locationBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardDetails: {
        gap: 4,
    },
    cardDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardDetailText: {
        fontSize: 13,
        flex: 1,
    },
});
