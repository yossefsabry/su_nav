import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/theme-context';

interface ProfileMenuProps {
    onClose: () => void;
}

export function ProfileMenu({ onClose }: ProfileMenuProps) {
    const { colors, theme, toggleTheme } = useTheme();
    const animValue = React.useRef(new Animated.Value(0)).current;
    // Animation for theme icon rotation
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        // Spring animation for popup
        Animated.spring(animValue, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, []);

    const closeMenu = () => {
        Animated.timing(animValue, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const menuItems = [
        { id: '1', title: 'Profile', icon: 'person-outline', route: '/profile' },
        { id: '2', title: 'Dashboard', icon: 'analytics-outline', route: '/dashboard' },
        { id: '3', title: 'Danger Zone', icon: 'warning-outline', route: '/danger-zone', color: colors.error },
        { id: '4', title: 'Settings', icon: 'settings-outline', route: null },
    ];

    const handleItemPress = (route: string | null) => {
        closeMenu();
        if (route) {
            // Small delay to allow menu close animation to start
            setTimeout(() => {
                router.push(route as any);
            }, 50);
        }
    };

    const handleThemeToggle = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;

        // Animate rotation
        Animated.sequence([
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
            })
        ]).start();

        toggleTheme({ x: pageX, y: pageY });

        // Slightly delayed close
        setTimeout(() => {
            closeMenu();
        }, 150);
    };

    const getThemeIcon = () => {
        return theme === 'dark' ? 'moon' : 'sunny';
    };

    // Rotation interpolation
    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <Modal
            transparent
            visible
            animationType="none"
            onRequestClose={closeMenu}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={closeMenu}
            >
                <Animated.View
                    style={[
                        styles.menuContainer,
                        {
                            backgroundColor: colors.cardBackground,
                            borderColor: colors.border,
                            opacity: animValue,
                            transform: [
                                {
                                    translateY: animValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                                {
                                    scale: animValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1],
                                    }),
                                }
                            ],
                        }
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Profile Header */}
                    <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
                        <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.profileAvatarText}>JP</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.text }]}>John Player</Text>
                            <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>john.player@edu</Text>
                        </View>
                    </View>

                    {/* Menu Items */}
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { borderBottomColor: colors.border }]}
                            onPress={() => handleItemPress(item.route)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={22}
                                color={item.color || colors.text}
                            />
                            <Text style={[styles.menuItemText, { color: item.color || colors.text }]}>
                                {item.title}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={colors.tertiaryText}
                            />
                        </TouchableOpacity>
                    ))}

                    {/* Theme Toggle */}
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={handleThemeToggle}
                        activeOpacity={0.7}
                    >
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <Ionicons name={getThemeIcon() as any} size={22} color={colors.text} />
                        </Animated.View>
                        <Text style={[styles.menuItemText, { color: colors.text }]}>
                            Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="swap-horizontal" size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.logoutItem}
                        onPress={() => {
                            closeMenu();
                            // Logout logic here
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={22} color={colors.error} />
                        <Text style={[styles.menuItemText, { color: colors.error }]}>Logout</Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    menuContainer: {
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileAvatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 14,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 12,
    },
});
