import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatList from '@/components/chat/ChatList';
import { Chat } from '@/services/chat-storage';
import ChatConversation from '@/components/chat/ChatConversation';

export default function ChatScreen() {
    const { colors, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();

    // State
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    // Default to a focused state if no chat selected, or show a "New Chat" state
    // For this demo, we'll start with a "New Chat" empty state or a default mock
    // If selectedChat is null, we can show a welcome screen or a default conversation
    // Let's assume null means "New Chat" / "AI Assistant" default

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
        setIsHistoryVisible(false);
    };

    const toggleHistory = () => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    const startNewChat = () => {
        setSelectedChat(null);
        setIsHistoryVisible(false);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: isHistoryVisible ? colors.primary + '20' : 'transparent' }]}
                        onPress={toggleHistory}
                    >
                        <Ionicons
                            name={isHistoryVisible ? "close" : "time-outline"}
                            size={24}
                            color={isHistoryVisible ? colors.primary : colors.text}
                        />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {selectedChat ? selectedChat.name : 'SU Assistant'}
                        </Text>
                        {selectedChat && (
                            <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                                Chat History
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={startNewChat}
                    >
                        <Ionicons name="create-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Main Content: Conversation */}
                <View style={styles.content}>
                    <ChatConversation
                        chatId={selectedChat ? selectedChat.id : 'new'}
                        chatName={selectedChat ? selectedChat.name : 'SU Assistant'}
                        onChatCreated={async (newChatId) => {
                            // Fetch the new chat details to update the selectedChat state
                            const { chatStorage } = require('@/services/chat-storage');
                            const newChat = await chatStorage.getChatById(newChatId);
                            if (newChat) {
                                setSelectedChat(newChat);
                            }
                        }}
                    />
                </View>

                {/* History Modal / Overlay */}
                <Modal
                    visible={isHistoryVisible}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setIsHistoryVisible(false)}
                >
                    <View style={[styles.historyContainer, { backgroundColor: colors.background }]}>
                        {/* Modal Header for iOS pageSheet look or generic header */}
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>History</Text>
                            <TouchableOpacity onPress={() => setIsHistoryVisible(false)} style={styles.closeButton}>
                                <Text style={{ color: colors.primary, fontSize: 16 }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ChatList
                            onSelectChat={handleSelectChat}
                            currentChatId={selectedChat?.id}
                        />
                    </View>
                </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        height: 60,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 11,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    historyContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
});
