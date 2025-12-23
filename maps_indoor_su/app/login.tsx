import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/auth-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);

        // Skip Logic
        if (email.toLowerCase() === 'skip' && password.toLowerCase() === 'skip') {
            // Mock login delay
            setTimeout(async () => {
                await signIn('mock_token_123', {
                    id: '1',
                    email: 'demo@student.su.edu.eg',
                    name: 'Demo Student'
                });
                setLoading(false);
            }, 1000);
            return;
        }

        // Normal Login Logic (Not implemented, strict fail for demo unless skipped)
        setLoading(false);
        Alert.alert('Info', 'For demo, type "skip" in both fields to login.');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.background, colors.cardBackground]} // Subtle gradient background
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="school" size={48} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Sign in to access your campus</Text>
                    </View>

                    <View style={styles.form}>
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

                        <TouchableOpacity style={styles.forgotButton}>
                            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#007AFF', '#0051D5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.loginButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.secondaryText }]}>Don't have an account?</Text>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: colors.primary }]}>Register</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
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
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,122,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
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
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 56,
        shadowColor: '#007AFF',
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
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
