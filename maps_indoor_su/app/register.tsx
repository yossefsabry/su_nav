import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/auth-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        // Demo registration - just navigates to login
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.back();
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.background, colors.cardBackground]}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                            <Ionicons name="person-add" size={40} color={colors.success} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Join the Sinai University community</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                            <Ionicons name="person-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Full Name"
                                placeholderTextColor={colors.tertiaryText}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Student Email"
                                placeholderTextColor={colors.tertiaryText}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Password"
                                placeholderTextColor={colors.tertiaryText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Confirm Password"
                                placeholderTextColor={colors.tertiaryText}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#34C759', '#248A3D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.secondaryText }]}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={[styles.linkText, { color: colors.success }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    registerButton: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 56,
        marginTop: 8,
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
