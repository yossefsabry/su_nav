import { useTheme } from '@/contexts/theme-context';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttendanceChartProps {
    totalLectures: number;
    attendedLectures: number;
}

export function AttendanceChart({ totalLectures, attendedLectures }: AttendanceChartProps) {
    const { colors } = useTheme();
    const missedLectures = totalLectures - attendedLectures;
    const attendancePercentage = Math.round((attendedLectures / totalLectures) * 100);

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Attendance Analysis</Text>

            <View style={styles.content}>
                {/* Circular Chart Placeholder (Simulated with View) */}
                <View style={[styles.chartContainer, { borderColor: colors.primary + '30' }]}>
                    <View style={[styles.chartFill, {
                        backgroundColor: colors.primary,
                        height: `${attendancePercentage}%`,
                        width: '100%',
                        position: 'absolute',
                        bottom: 0,
                        opacity: 0.2
                    }]} />
                    <View style={styles.chartInner}>
                        <Text style={[styles.percentage, { color: colors.primary }]}>{attendancePercentage}%</Text>
                        <Text style={[styles.percentageLabel, { color: colors.secondaryText }]}>Present</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                        <View>
                            <Text style={[styles.statValue, { color: colors.text }]}>{attendedLectures}</Text>
                            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Attended</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <View style={[styles.dot, { backgroundColor: colors.error }]} />
                        <View>
                            <Text style={[styles.statValue, { color: colors.text }]}>{missedLectures}</Text>
                            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Missed</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 8,
        // elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chartContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    chartFill: {
        borderRadius: 40,
    },
    chartInner: {
        alignItems: 'center',
    },
    percentage: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    percentageLabel: {
        fontSize: 12,
    },
    statsContainer: {
        flex: 1,
        marginLeft: 24,
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 13,
    },
    divider: {
        height: 1,
        width: '100%',
    },
});
