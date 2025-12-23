import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authStorage, UserData } from '@/services/auth-storage';

interface AuthContextType {
    signIn: (token: string, user: UserData) => Promise<void>;
    signOut: () => Promise<void>;
    user: UserData | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const loadAuth = async () => {
            const token = await authStorage.getToken();
            const storedUser = await authStorage.getUser();

            if (token && storedUser) {
                setUser(storedUser);
            }
            setIsLoading(false);
        };

        loadAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(tabs)';
        const inPublicGroup = segments.length === 0 || segments[0] === 'login' || segments[0] === 'register';

        if (!user && !inPublicGroup) {
            // Redirect to the login page if the user is not signed in and tries to access a protected route
            router.replace('/login');
        } else if (user && segments[0] === 'login') {
            // Redirect to home if the user is signed in and tries to access login
            router.replace('/(tabs)/home');
        }
    }, [user, segments, isLoading]);

    const signIn = async (token: string, userData: UserData) => {
        setIsLoading(true);
        await authStorage.saveToken(token);
        await authStorage.saveUser(userData);
        setUser(userData);
        setIsLoading(false);
        router.replace('/(tabs)/home');
    };

    const signOut = async () => {
        setIsLoading(true);
        await authStorage.clearAuth();
        setUser(null);
        setIsLoading(false);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                user,
                isLoading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
