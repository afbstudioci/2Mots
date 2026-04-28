//src/screens/MessagesScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    Image, RefreshControl, ActivityIndicator, Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/theme';
import api from '../services/api';
import { useData } from '../context/DataContext';

export default function MessagesScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation<any>();
    const { updateUnreadCount } = useData();
    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/chat/conversations');
            setConversations(response.data.data || []);
        } catch (e) {
            console.error('[MESSAGES] Fetch error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const unsub = navigation.addListener('focus', () => {
            fetchConversations();
            updateUnreadCount();
        });
        return unsub;
    }, [navigation]);

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>MESSAGES</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Friends')} 
                    style={[styles.communityBtn, { backgroundColor: colors.coral + '15' }]}
                >
                    <Ionicons name="people" size={20} color={colors.coral} />
                    <Text style={styles.communityBtnText}>COMMUNAUTÉ</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.friend._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchConversations} tintColor={colors.coral} />
                }
                renderItem={({ item }) => (
                    <ConversationCard 
                        item={item} 
                        onPress={() => navigation.navigate('Chat', { 
                            friendId: item.friend._id, 
                            friendName: item.friend.login, 
                            friendAvatar: item.friend.avatar 
                        })} 
                    />
                )}
                ListEmptyComponent={() => !isLoading ? (
                    <View style={styles.empty}>
                        <Ionicons name="chatbubbles-outline" size={60} color={themeColors.textSecondary} />
                        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                            Aucune discussion active.{"\n"}Lancez-en une avec vos amis !
                        </Text>
                    </View>
                ) : null}
            />
        </ScreenWrapper>
    );
}

const ConversationCard = ({ item, onPress }: any) => {
    const { themeColors } = useTheme();
    const lastMsg = item.lastMessage;
    const isUnread = item.unreadCount > 0;
    const blinkAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (isUnread) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(blinkAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
                ])
            ).start();
        }
    }, [isUnread]);

    return (
        <TouchableOpacity 
            onPress={onPress} 
            activeOpacity={0.7} 
            style={[styles.card, { backgroundColor: themeColors.card, borderBottomColor: themeColors.overlayLight }]}
        >
            <View style={styles.avatarContainer}>
                {item.friend.avatar ? (
                    <Image source={{ uri: item.friend.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.coral + '20' }]}>
                        <Text style={styles.avatarInitial}>{item.friend.login.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                {isUnread && (
                    <Animated.View style={[styles.unreadDot, { opacity: blinkAnim }]} />
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
                        {item.friend.login}
                    </Text>
                    <Text style={[styles.time, { color: themeColors.textSecondary }]}>
                        {lastMsg 
                            ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''
                        }
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text 
                        style={[
                            styles.preview, 
                            { 
                                color: isUnread ? themeColors.text : themeColors.textSecondary, 
                                fontFamily: isUnread ? 'Poppins_700Bold' : 'Poppins_400Regular',
                                fontStyle: lastMsg ? 'normal' : 'italic'
                            }
                        ]} 
                        numberOfLines={1}
                    >
                        {!lastMsg ? 'Démarrer la discussion...' : (lastMsg.isDeleted ? 'Message supprimé' : (lastMsg.text || 'Média'))}
                    </Text>
                    {isUnread && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    header: { 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 3 },
    communityBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20 
    },
    communityBtnText: { 
        marginLeft: 6, 
        fontSize: 10, 
        fontFamily: 'Poppins_700Bold', 
        color: colors.coral 
    },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: 100 },
    card: { 
        flexDirection: 'row', 
        padding: spacing.md, 
        borderRadius: 20, 
        marginBottom: spacing.sm,
        borderBottomWidth: 1,
    },
    avatarContainer: { position: 'relative' },
    avatar: { width: 54, height: 54, borderRadius: 27 },
    avatarPlaceholder: { 
        width: 54, height: 54, borderRadius: 27, 
        justifyContent: 'center', alignItems: 'center' 
    },
    avatarInitial: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: colors.coral },
    unreadDot: { 
        position: 'absolute', top: 0, right: 0, 
        width: 14, height: 14, borderRadius: 7, 
        backgroundColor: colors.coral, borderWidth: 2, borderColor: '#FFF' 
    },
    content: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    name: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
    time: { fontSize: 11, fontFamily: 'Poppins_400Regular' },
    preview: { fontSize: 13, flex: 1, marginRight: 10 },
    badge: { 
        backgroundColor: colors.coral, 
        minWidth: 18, height: 18, borderRadius: 9, 
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 
    },
    badgeText: { color: '#FFF', fontSize: 10, fontFamily: 'Poppins_700Bold' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { textAlign: 'center', marginTop: 20, fontFamily: 'Poppins_500Medium', lineHeight: 24 },
});
