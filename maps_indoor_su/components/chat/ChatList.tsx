import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { chatStorage, Chat } from '@/services/chat-storage';

interface ChatListProps {
    onSelectChat: (chat: Chat) => void;
    currentChatId?: string;
    onRefreshTrigger?: number; // Used to trigger refresh from parent
}

export default function ChatList({ onSelectChat, currentChatId, onRefreshTrigger }: ChatListProps) {
    const { colors } = useTheme();
    const [chats, setChats] = useState<Chat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadChats();
    }, [onRefreshTrigger]);

    const loadChats = async () => {
        try {
            const loadedChats = await chatStorage.getAllChats();
            setChats(loadedChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadChats();
        setRefreshing(false);
    };

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLastMessage = (chat: Chat): string => {
        if (chat.messages.length === 0) return 'No messages yet';
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
    };

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getAvatarIcon = (chat: Chat): string => {
        // AI/SU chat gets robot icon, others get chat bubble
        const lowerName = chat.name.toLowerCase();
        if (lowerName.includes('chatsu') || lowerName.includes('ai') || lowerName.includes('su') || lowerName.includes('assistant')) {
            return '🤖';
        }
        return '💬';
    };

    const renderChatItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={[
                styles.chatItem,
                {
                    backgroundColor: currentChatId === item.id ? colors.primary + '10' : colors.cardBackground,
                    borderColor: currentChatId === item.id ? colors.primary : colors.border
                }
            ]}
            onPress={() => onSelectChat(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.avatarEmoji}>{getAvatarIcon(item)}</Text>
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.timestamp, { color: colors.tertiaryText }]}>
                        {getTimeAgo(item.updatedAt)}
                    </Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text style={[styles.lastMessage, { color: colors.secondaryText }]} numberOfLines={1}>
                        {getLastMessage(item)}
                    </Text>
                    {(item.unreadCount ?? 0) > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={[styles.searchContainer, { backgroundColor: colors.searchBackground, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.secondaryText} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search..."
                        placeholderTextColor={colors.tertiaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.tertiaryText} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Chat List */}
            <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={80} color={colors.tertiaryText} />
                        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                            No chats yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.tertiaryText }]}>
                            Tap the + button to start a conversation
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarEmoji: {
        fontSize: 24,
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
    },
    chatFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
