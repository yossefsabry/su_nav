import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function ChatEmptyState() {
    const { colors } = useTheme();
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient
                    colors={[colors.primary + '30', colors.primary + '10']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="chatbubbles" size={64} color={colors.primary} />
                </LinearGradient>
            </Animated.View>

            <Text style={[styles.title, { color: colors.text }]}>
                Start a Conversation
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Send a message, upload an image, or share an{'\n'}
                audio file to begin chatting with AI.
            </Text>

            <View style={styles.features}>
                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Ion icons name="sparkles" size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: colors.secondaryText }]}>
                        AI-powered
                    </Text>
                </View>

                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="image" size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: colors.secondaryText }]}>
                        Image upload
                    </Text>
                </View>

                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="musical-notes" size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: colors.secondaryText }]}>
                        Audio upload
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    features: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 8,
    },
    featureItem: {
        alignItems: 'center',
        gap: 8,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
