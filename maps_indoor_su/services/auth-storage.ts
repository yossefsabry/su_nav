import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface UserData {
    id: string;
    email: string;
    name?: string;
}

export const authStorage = {
    async saveToken(token: string) {
        try {
            await AsyncStorage.setItem(AUTH_KEY, token);
        } catch (e) {
            console.error('Failed to save auth token', e);
        }
    },

    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(AUTH_KEY);
        } catch (e) {
            console.error('Failed to get auth token', e);
            return null;
        }
    },

    async saveUser(user: UserData) {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
            console.error('Failed to save user data', e);
        }
    },

    async getUser(): Promise<UserData | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(USER_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Failed to get user data', e);
            return null;
        }
    },

    async clearAuth() {
        try {
            await AsyncStorage.multiRemove([AUTH_KEY, USER_KEY]);
        } catch (e) {
            console.error('Failed to clear auth data', e);
        }
    }
};
