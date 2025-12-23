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

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const { colors } = useTheme();

    const stats = [
        { id: '1', title: 'Total Routes', value: '42', icon: 'navigate', color: '#007AFF', gradient: ['#007AFF', '#0051D5'] },
        { id: '2', title: 'Distance Walked', value: '3.2 km', icon: 'walk', color: '#34C759', gradient: ['#34C759', '#248A3D'] },
        { id: '3', title: 'Time Saved', value: '2.5 hrs', icon: 'time', color: '#FF9500', gradient: ['#FF9500', '#FF6B00'] },
        { id: '4', title: 'Favorite Places', value: '15', icon: 'heart', color: '#FF3B30', gradient: ['#FF3B30', '#C7200E'] },
    ];

    const recentActivity = [
        { id: '1', title: 'Engineering Building', subtitle: 'Navigation completed', time: '2h ago', icon: 'location' },
        { id: '2', title: 'Library - Floor 3', subtitle: 'Route saved', time: '5h ago', icon: 'bookmark' },
        { id: '3', title: 'Student Center', subtitle: 'Check-in', time: 'Yesterday', icon: 'checkmark-circle' },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
                    <TouchableOpacity>
                        <Ionicons name="filter-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <View key={stat.id} style={styles.statCard}>
                            <LinearGradient
                                colors={stat.gradient as any}
                                style={styles.statGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={stat.icon as any} size={32} color="#fff" />
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>

                {/* Weekly Progress */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Activity</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.chartContainer}>
                            {[40, 65, 45, 80, 35, 90, 55].map((height, index) => (
                                <View key={index} style={styles.barContainer}>
                                    <View style={[styles.bar, { height: `${height}%`, backgroundColor: colors.primary }]} />
                                    <Text style={[styles.barLabel, { color: colors.tertiaryText }]}>
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                    {recentActivity.map((activity) => (
                        <View key={activity.id} style={[styles.activityItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                            <View style={[styles.activityIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name={activity.icon as any} size={20} color={colors.primary} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                                <Text style={[styles.activitySubtitle, { color: colors.secondaryText }]}>{activity.subtitle}</Text>
                            </View>
                            <Text style={[styles.activityTime, { color: colors.tertiaryText }]}>{activity.time}</Text>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    statCard: {
        width: (width - 44) / 2,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statGradient: {
        padding: 20,
        alignItems: 'center',
        minHeight: 140,
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    statTitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
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
        height: 150,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '60%',
        borderRadius: 4,
        minHeight: 20,
    },
    barLabel: {
        marginTop: 8,
        fontSize: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 14,
    },
    activityTime: {
        fontSize: 13,
    },
});
