import { useTheme } from '@/contexts/theme-context';
import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PresenceCardProps {
    isOnCampus: boolean;
    locationName?: string;
}

export function PresenceCard({ isOnCampus, locationName = 'Main Campus' }: PresenceCardProps) {
    const { colors } = useTheme();
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        if (isOnCampus) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
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
        } else {
            pulseAnim.setValue(1);
        }
    }, [isOnCampus]);

    return (
        <View style={[styles.container, {
            backgroundColor: isOnCampus ? colors.primary + '10' : colors.cardBackground,
            borderColor: isOnCampus ? colors.primary : colors.border
        }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: isOnCampus ? colors.primary + '20' : colors.border }]}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <Ionicons
                            name={isOnCampus ? "location" : "location-outline"}
                            size={24}
                            color={isOnCampus ? colors.primary : colors.secondaryText}
                        />
                    </Animated.View>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {isOnCampus ? 'You are on Campus' : 'You are Away'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        {locationName}
                    </Text>
                </View>
                {isOnCampus && (
                    <View style={[styles.badge, { backgroundColor: colors.success }]}>
                        <Text style={styles.badgeText}>Active</Text>
                    </View>
                )}
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
