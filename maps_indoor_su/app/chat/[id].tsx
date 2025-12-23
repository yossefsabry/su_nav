import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatConversation from '@/components/chat/ChatConversation';
import { chatStorage, Chat } from '@/services/chat-storage';

export default function ChatConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [chatName, setChatName] = useState('Chat');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadChatDetails();
    }, [id]);

    const loadChatDetails = async () => {
        if (!id || id === 'new') {
            setChatName('New Chat');
            setIsLoading(false);
            return;
        }

        try {
            const chat = await chatStorage.getChatById(id);
            if (chat) {
                setChatName(chat.name);
            }
        } catch (error) {
            console.error('Error loading chat details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatCreated = (newChatId: string) => {
        // Update params to reflect real ID without pushing new screen if possible
        router.setParams({ id: newChatId });
        loadChatDetails();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <View style={[styles.headerAvatar, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={styles.headerAvatarText}>🤖</Text>
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>{chatName}</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>SU Assistant</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Chat Conversation */}
                <View style={styles.content}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <ChatConversation
                            chatId={id || 'new'}
                            chatName={chatName}
                            onMessagesUpdate={loadChatDetails} // Refresh name if it changes
                            onChatCreated={handleChatCreated}
                        />
                    )}
                </View>
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        height: 60,
    },
    backButton: {
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerAvatarText: {
        fontSize: 18,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 1,
    },
    moreButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
