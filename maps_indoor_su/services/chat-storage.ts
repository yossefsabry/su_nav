import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    isTyping?: boolean;
}

export interface Chat {
    id: string;
    name: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
    unreadCount?: number;
}

const STORAGE_KEY = '@chats_storage';

class ChatStorageService {
    async getAllChats(): Promise<Chat[]> {
        try {
            const chatsJson = await AsyncStorage.getItem(STORAGE_KEY);
            if (chatsJson) {
                return JSON.parse(chatsJson);
            }
            return [];
        } catch (error) {
            console.error('Error loading chats:', error);
            return [];
        }
    }

    async getChatById(id: string): Promise<Chat | null> {
        try {
            const chats = await this.getAllChats();
            return chats.find(chat => chat.id === id) || null;
        } catch (error) {
            console.error('Error getting chat:', error);
            return null;
        }
    }

    async createChat(name: string = 'Chatsu'): Promise<Chat> {
        try {
            const newChat: Chat = {
                id: Date.now().toString(),
                name,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                unreadCount: 0,
            };

            const chats = await this.getAllChats();
            chats.unshift(newChat); // Add to beginning
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
            return newChat;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }

    async addMessage(chatId: string, message: ChatMessage): Promise<void> {
        try {
            const chats = await this.getAllChats();
            const chatIndex = chats.findIndex(chat => chat.id === chatId);

            if (chatIndex !== -1) {
                chats[chatIndex].messages.push(message);
                chats[chatIndex].updatedAt = new Date().toISOString();

                // Move to top
                const [updatedChat] = chats.splice(chatIndex, 1);
                chats.unshift(updatedChat);

                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
            }
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }

    async updateChatName(chatId: string, name: string): Promise<void> {
        try {
            const chats = await this.getAllChats();
            const chatIndex = chats.findIndex(chat => chat.id === chatId);

            if (chatIndex !== -1) {
                chats[chatIndex].name = name;
                chats[chatIndex].updatedAt = new Date().toISOString();
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
            }
        } catch (error) {
            console.error('Error updating chat name:', error);
            throw error;
        }
    }

    async deleteChat(chatId: string): Promise<void> {
        try {
            const chats = await this.getAllChats();
            const filteredChats = chats.filter(chat => chat.id !== chatId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredChats));
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    }

    async clearAllChats(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing chats:', error);
            throw error;
        }
    }
}

export const chatStorage = new ChatStorageService();
