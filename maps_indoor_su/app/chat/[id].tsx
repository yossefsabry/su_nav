import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: string;
}

// Mock messages
const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        text: 'Hello! How can I help you navigate the campus today?',
        sender: 'other',
        timestamp: '10:23 AM',
    },
    {
        id: '2',
        text: 'I need to find the Engineering building',
        sender: 'user',
        timestamp: '10:24 AM',
    },
    {
        id: '3',
        text: 'Sure! The Engineering building is located on the north side of campus. Would you like me to create a route for you?',
        sender: 'other',
        timestamp: '10:24 AM',
    },
    {
        id: '4',
        text: 'Yes please!',
        sender: 'user',
        timestamp: '10:25 AM',
    },
    {
        id: '5',
        text: 'Great! I\'ve created a route to the Engineering building. Tap the map icon to view it.',
        sender: 'other',
        timestamp: '10:25 AM',
    },
];

export default function ChatConversationScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        // Auto-scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';

        return (
            <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
                <View
                    style={[
                        styles.messageBubble,
                        {
                            backgroundColor: isUser ? colors.primary : colors.cardBackground,
                            borderColor: colors.border,
                        },
                        isUser && styles.userMessageBubble,
                    ]}
                >
                    <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.text }]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.messageTime, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.tertiaryText }]}>
                        {item.timestamp}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <View style={[styles.headerAvatar, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={styles.headerAvatarText}>🏫</Text>
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Campus Support</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Input */}
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.searchBackground }]}>
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="add-circle" size={28} color={colors.primary} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.tertiaryText}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerAvatarText: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    moreButton: {
        padding: 4,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    messageContainer: {
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    userMessageBubble: {
        borderTopRightRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
    },
    inputContainer: {
        borderTopWidth: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    attachButton: {
        marginBottom: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 4,
    },
});
