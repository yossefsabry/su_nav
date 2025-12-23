import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatStorage, ChatMessage } from '@/services/chat-storage';
import { ChatEmptyState } from './ChatEmptyState';

interface ChatConversationProps {
    chatId: string;
    chatName: string;
    onMessagesUpdate?: () => void; // Callback when messages change
}

export default function ChatConversation({ chatId, chatName, onMessagesUpdate }: ChatConversationProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Load messages from storage when chat changes
    useEffect(() => {
        loadMessages();
    }, [chatId]);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const chat = await chatStorage.getChatById(chatId);
            if (chat) {
                setMessages(chat.messages);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const simulateAIResponse = async (userMessage: string) => {
        setIsAITyping(true);

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const responses = [
            "I'd be happy to help you with that! Let me guide you through campus.",
            "That's a great question! The location you're looking for is easy to find.",
            "I can help you navigate to that location. Would you like me to show you the route?",
            "Based on your location, I can provide you with the best path to get there.",
            "Let me assist you with finding that place on campus!",
        ];

        const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: 'ai',
            timestamp: new Date().toISOString(),
        };

        await chatStorage.addMessage(chatId, aiMessage);
        setIsAITyping(false);
        await loadMessages();
        onMessagesUpdate?.();

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleSend = async () => {
        if (inputText.trim() === '') return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        try {
            await chatStorage.addMessage(chatId, userMessage);
            setInputText('');
            await loadMessages();
            onMessagesUpdate?.();

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            // Simulate AI response
            await simulateAIResponse(userMessage.text);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
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
                        {formatTime(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (!isAITyping) return null;

        return (
            <View style={styles.messageContainer}>
                <View style={[styles.messageBubble, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.typingIndicator}>
                        <View style={[styles.typingDot, { backgroundColor: colors.secondaryText }]} />
                        <View style={[styles.typingDot, { backgroundColor: colors.secondaryText }]} />
                        <View style={[styles.typingDot, { backgroundColor: colors.secondaryText }]} />
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {messages.length === 0 ? (
                <ChatEmptyState />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    style={styles.flatList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListFooterComponent={renderTypingIndicator}
                />
            )}

            {/* Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) + 70 }]}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.searchBackground }]}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Message"
                        placeholderTextColor={colors.tertiaryText}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        editable={!isAITyping}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: inputText.trim() && !isAITyping ? colors.text : colors.border }]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isAITyping}
                    >
                        <Ionicons name="arrow-up" size={20} color={colors.background} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '85%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
    },
    userMessageBubble: {
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 24,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 24,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        opacity: 0.6,
        alignSelf: 'flex-end',
    },
    typingIndicator: {
        flexDirection: 'row',
        gap: 6,
        paddingVertical: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 26,
        paddingHorizontal: 6,
        paddingVertical: 6,
        minHeight: 52,
    },
    attachButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 120,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 10,
        textAlignVertical: 'center',
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
        marginBottom: 4,
    },
});
