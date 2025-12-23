import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PresenceCard } from '@/components/dashboard/PresenceCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const { colors } = useTheme();

    // Mock Data
    const attendanceStats = {
        total: 48,
        attended: 42,
        missed: 6,
        late: 2
    };

    const academicStats = [
        { id: '1', title: 'Total Classes', value: '48', icon: 'school', color: '#007AFF', gradient: ['#007AFF', '#0051D5'] },
        { id: '2', title: 'Assignments', value: '12 Due', icon: 'document-text', color: '#FF9500', gradient: ['#FF9500', '#FF6B00'] },
        { id: '3', title: 'Current GPA', value: '3.8', icon: 'ribbon', color: '#AF52DE', gradient: ['#AF52DE', '#8E44AD'] }, // Replaced Time Saved
        { id: '4', title: 'Late Arrivals', value: '2', icon: 'alarm', color: '#FF3B30', gradient: ['#FF3B30', '#C7200E'] },
    ];

    const recentAttendance = [
        { id: '1', subject: 'Computer Science 101', status: 'Present', time: 'Today, 10:00 AM', icon: 'checkmark-circle', color: '#34C759' },
        { id: '2', subject: 'Calculus II', status: 'Late', time: 'Yesterday, 02:00 PM', icon: 'time', color: '#FF9500' },
        { id: '3', subject: 'Physics Lab', status: 'Absent', time: 'Monday, 09:00 AM', icon: 'close-circle', color: '#FF3B30' },
        { id: '4', subject: 'English Lit', status: 'Present', time: 'Monday, 11:30 AM', icon: 'checkmark-circle', color: '#34C759' },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Attendance Dashboard</Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Presence Status */}
                <PresenceCard
                    isOnCampus={true} // Mocked for dashboard demo
                    locationName="Sinai University - Main Campus"
                />

                {/* Overall Analysis */}
                <AttendanceChart
                    totalLectures={attendanceStats.total}
                    attendedLectures={attendanceStats.attended}
                />

                {/* Academic Stats Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
                    <View style={styles.statsGrid}>
                        {academicStats.map((stat) => (
                            <View key={stat.id} style={styles.statCard}>
                                <LinearGradient
                                    colors={stat.gradient as any}
                                    style={styles.statGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.statHeader}>
                                        <Ionicons name={stat.icon as any} size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statTitle}>{stat.title}</Text>
                                </LinearGradient>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Weekly Attendance Trend */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Attendance</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.chartContainer}>
                            {[100, 80, 100, 60, 100, 0, 0].map((height, index) => (
                                <View key={index} style={styles.barContainer}>
                                    <View style={[styles.bar, {
                                        height: `${Math.max(height, 5)}%`,
                                        backgroundColor: height >= 80 ? colors.primary : (height > 0 ? colors.error : colors.border)
                                    }]} />
                                    <Text style={[styles.barLabel, { color: colors.tertiaryText }]}>
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Recent History */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent History</Text>
                    {recentAttendance.map((item) => (
                        <View key={item.id} style={[styles.historyItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                            <View style={[styles.historyIcon, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={[styles.historySubject, { color: colors.text }]}>{item.subject}</Text>
                                <Text style={[styles.historyTime, { color: colors.secondaryText }]}>{item.time}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: item.color + '20' }]}>
                                <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (width - 52) / 2, // (width - 40 padding - 12 gap) / 2
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statGradient: {
        padding: 16,
        height: 110,
        justifyContent: 'space-between',
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statTitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    card: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 8,
        borderRadius: 4,
    },
    barLabel: {
        marginTop: 8,
        fontSize: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyContent: {
        flex: 1,
    },
    historySubject: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    historyTime: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
