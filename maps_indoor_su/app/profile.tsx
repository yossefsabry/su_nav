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
    Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const { colors, theme, setTheme } = useTheme();
    const insets = useSafeAreaInsets();

    const profileOptions = [
        { id: '1', title: 'Edit Profile', icon: 'person-outline', onPress: () => { } },
        { id: '2', title: 'Notifications', icon: 'notifications-outline', onPress: () => { } },
        { id: '3', title: 'Privacy', icon: 'shield-outline', onPress: () => { } },
        { id: '4', title: 'Dashboard', icon: 'analytics-outline', onPress: () => router.push('/dashboard') },
    ];

    const settingsOptions = [
        { id: '1', title: 'Dark Mode', icon: 'moon-outline', isToggle: true },
        { id: '2', title: 'Location Services', icon: 'location-outline', isToggle: true },
        { id: '3', title: 'Language', icon: 'language-outline', value: 'English' },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: Math.max(16, 40 - insets.top) }]}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
                    <TouchableOpacity>
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={['#007AFF', '#0051D5']}
                        style={styles.profileGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>JP</Text>
                            </View>
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.profileName}>John Player</Text>
                        <Text style={styles.profileEmail}>john.player@university.edu</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>42</Text>
                                <Text style={styles.statLabel}>Routes</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>15</Text>
                                <Text style={styles.statLabel}>Favorites</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>3.2 km</Text>
                                <Text style={styles.statLabel}>Distance</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Profile Options */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
                    {profileOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.optionItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                            onPress={option.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name={option.icon as any} size={22} color={colors.primary} />
                            </View>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.tertiaryText} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
                    {settingsOptions.map((option) => (
                        <View
                            key={option.id}
                            style={[styles.optionItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name={option.icon as any} size={22} color={colors.primary} />
                            </View>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                            {option.isToggle ? (
                                <TouchableOpacity
                                    style={[styles.toggle, theme === 'dark' && styles.toggleActive, { backgroundColor: theme === 'dark' ? colors.primary : colors.border }]}
                                    onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    <View style={[styles.toggleThumb, theme === 'dark' && styles.toggleThumbActive]} />
                                </TouchableOpacity>
                            ) : option.value ? (
                                <Text style={[styles.optionValue, { color: colors.secondaryText }]}>{option.value}</Text>
                            ) : null}
                        </View>
                    ))}
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.dangerButton, { backgroundColor: colors.cardBackground, borderColor: colors.error }]}
                        onPress={() => router.push('/danger-zone')}
                    >
                        <Ionicons name="warning-outline" size={22} color={colors.error} />
                        <Text style={[styles.dangerButtonText, { color: colors.error }]}>Danger Zone</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]}>


                    <Ionicons name="log-out-outline" size={22} color="#fff" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
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
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileCard: {
        marginHorizontal: 20,
        marginVertical: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    profileGradient: {
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    profileName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
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
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    optionValue: {
        fontSize: 15,
        marginRight: 8,
    },
    toggle: {
        width: 51,
        height: 31,
        borderRadius: 15.5,
        padding: 2,
    },
    toggleActive: {},
    toggleThumb: {
        width: 27,
        height: 27,
        borderRadius: 13.5,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        transform: [{ translateX: 20 }],
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 32,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
