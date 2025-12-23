import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DangerZoneScreen() {
    const { colors } = useTheme();
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data?',
            'This will remove all your saved routes, favorites, and preferences. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear Data', style: 'destructive', onPress: () => console.log('Data cleared') },
            ]
        );
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'DELETE') {
            Alert.alert('Error', 'Please type DELETE to confirm account deletion');
            return;
        }

        Alert.alert(
            'Delete Account?',
            'Your account and all associated data will be permanently deleted. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Forever', style: 'destructive', onPress: () => console.log('Account deleted') },
            ]
        );
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Reset All Settings?',
            'This will restore all app settings to their default values.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => console.log('Settings reset') },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Danger Zone</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Warning Banner */}
                <View style={[styles.warningBanner, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
                    <Ionicons name="warning" size={32} color={colors.error} />
                    <View style={styles.warningContent}>
                        <Text style={[styles.warningTitle, { color: colors.error }]}>Caution Required</Text>
                        <Text style={[styles.warningText, { color: colors.text }]}>
                            Actions in this section are permanent and cannot be undone. Proceed with extreme caution.
                        </Text>
                    </View>
                </View>

                {/* Danger Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>

                    {/* Clear All Data */}
                    <View style={[styles.dangerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <View style={styles.dangerHeader}>
                            <Ionicons name="trash-outline" size={24} color={colors.error} />
                            <View style={styles.dangerTitleContainer}>
                                <Text style={[styles.dangerTitle, { color: colors.text }]}>Clear All Data</Text>
                                <Text style={[styles.dangerDescription, { color: colors.secondaryText }]}>
                                    Remove all saved routes, favorites, and user preferences
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.dangerButton, { backgroundColor: colors.error }]}
                            onPress={handleClearData}
                        >
                            <Text style={styles.dangerButtonText}>Clear Data</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Reset Settings */}
                    <View style={[styles.dangerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <View style={styles.dangerHeader}>
                            <Ionicons name="refresh-outline" size={24} color={colors.warning} />
                            <View style={styles.dangerTitleContainer}>
                                <Text style={[styles.dangerTitle, { color: colors.text }]}>Reset Settings</Text>
                                <Text style={[styles.dangerDescription, { color: colors.secondaryText }]}>
                                    Restore all app settings to default values
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.dangerButton, { backgroundColor: colors.warning }]}
                            onPress={handleResetSettings}
                        >
                            <Text style={styles.dangerButtonText}>Reset Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delete Account */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.error }]}>Account Deletion</Text>

                    <View style={[styles.dangerCard, { backgroundColor: colors.cardBackground, borderColor: colors.error, borderWidth: 2 }]}>
                        <View style={styles.dangerHeader}>
                            <Ionicons name="skull-outline" size={32} color={colors.error} />
                            <View style={styles.dangerTitleContainer}>
                                <Text style={[styles.dangerTitle, { color: colors.error, fontSize: 20 }]}>Delete Account</Text>
                                <Text style={[styles.dangerDescription, { color: colors.secondaryText }]}>
                                    Permanently delete your account and all associated data
                                </Text>
                            </View>
                        </View>

                        <View style={styles.confirmSection}>
                            <Text style={[styles.confirmLabel, { color: colors.text }]}>
                                Type <Text style={{ fontWeight: 'bold', color: colors.error }}>DELETE</Text> to confirm:
                            </Text>
                            <TextInput
                                style={[styles.confirmInput, { backgroundColor: colors.searchBackground, color: colors.text, borderColor: colors.border }]}
                                placeholder="Type DELETE here"
                                placeholderTextColor={colors.tertiaryText}
                                value={deleteConfirmText}
                                onChangeText={setDeleteConfirmText}
                                autoCapitalize="characters"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.dangerButton,
                                {
                                    backgroundColor: deleteConfirmText === 'DELETE' ? colors.error : colors.border,
                                    opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                                },
                            ]}
                            onPress={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE'}
                        >
                            <Ionicons name="trash" size={20} color="#fff" />
                            <Text style={styles.dangerButtonText}>Delete Account Forever</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info */}
                <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        Need help? Contact support before deleting your account.
                    </Text>
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
    warningBanner: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 12,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 14,
        lineHeight: 20,
    },
    section: {
        marginTop: 8,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    dangerCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    dangerHeader: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    dangerTitleContainer: {
        flex: 1,
    },
    dangerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dangerDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    dangerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 10,
        gap: 8,
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmSection: {
        marginBottom: 16,
    },
    confirmLabel: {
        fontSize: 15,
        marginBottom: 8,
    },
    confirmInput: {
        borderWidth: 2,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        gap: 10,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
    },
});
