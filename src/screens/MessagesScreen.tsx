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
import { prefetchChat } from '../hooks/useChat';

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
            const data = response.data.data || [];
            setConversations(data);
            
            // PREFETCH : Charger les messages en arrière-plan pour chaque discussion
            data.forEach((conv: any) => {
                prefetchChat(conv.friend._id);
            });
            
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
                    <Text style={styles.communityBtnText}>AMIS</Text>
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
                        onPress={() => {
                            navigation.navigate('Chat', { 
                                friendId: item.friend._id, 
                                friendName: item.friend.login, 
                                friendAvatar: item.friend.avatar 
                            });
                        }} 
                    />
                )}
                ListEmptyComponent={() => !isLoading ? (
                    <View style={styles.empty}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.card }]}>
                            <Ionicons name="chatbubbles-outline" size={60} color={colors.coral} />
                        </View>
                        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                            Aucune discussion active.{"\n"}Lancez-en une avec vos amis !
                        </Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Friends')}
                            style={[styles.startBtn, { backgroundColor: colors.coral }]}
                        >
                            <Text style={styles.startBtnText}>Trouver des amis</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            />
        </ScreenWrapper>
    );
}

const ConversationCard = ({ item, onPress }: any) => {
    const { themeColors, isDark } = useTheme();
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
            style={[
                styles.card, 
                { 
                    backgroundColor: themeColors.card, 
                    // Contour corail en mode jour, bordure subtile en mode nuit
                    borderColor: !isDark ? colors.coral : themeColors.overlayLight,
                    borderWidth: !isDark ? 2 : 1,
                },
                shadows.soft(isDark)
            ]}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.avatarWrapper, { borderColor: isUnread ? colors.coral : 'transparent' }]}>
                    {item.friend.avatar ? (
                        <Image source={{ uri: item.friend.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.coral + '20' }]}>
                            <Text style={styles.avatarInitial}>{item.friend.login.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                </View>
                {isUnread && (
                    <Animated.View style={[styles.unreadBadge, { opacity: blinkAnim }]}>
                        <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
                    </Animated.View>
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
                    <View style={styles.previewContainer}>
                        {lastMsg && lastMsg.sender !== item.friend._id && (
                            <Ionicons 
                                name={lastMsg.read ? "checkmark-done" : "checkmark"} 
                                size={14} 
                                color={lastMsg.read ? colors.mint : themeColors.textSecondary} 
                                style={{ marginRight: 4 }}
                            />
                        )}
                        <Text 
                            style={[
                                styles.preview, 
                                { 
                                    color: isUnread ? themeColors.text : themeColors.textSecondary, 
                                    fontFamily: isUnread ? 'Poppins_700Bold' : 'Poppins_400Regular',
                                }
                            ]} 
                            numberOfLines={1}
                        >
                            {!lastMsg ? 'Démarrer la discussion...' : (lastMsg?.isDeleted ? 'Message supprimé' : (lastMsg.text || 'Média'))}
                        </Text>
                    </View>
                </View>
            </View>
            
            <Ionicons name="chevron-forward" size={18} color={themeColors.overlayMedium} />
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
    listContent: { paddingHorizontal: spacing.md, paddingBottom: 120, paddingTop: spacing.sm },
    card: { 
        flexDirection: 'row', 
        padding: spacing.md, 
        borderRadius: 24, 
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    avatarContainer: { position: 'relative' },
    avatarWrapper: {
        padding: 2,
        borderRadius: 30,
        borderWidth: 2,
    },
    avatar: { width: 54, height: 54, borderRadius: 27 },
    avatarPlaceholder: { 
        width: 54, height: 54, borderRadius: 27, 
        justifyContent: 'center', alignItems: 'center' 
    },
    avatarInitial: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: colors.coral },
    unreadBadge: { 
        position: 'absolute', top: -4, right: -4, 
        minWidth: 22, height: 22, borderRadius: 11, 
        backgroundColor: colors.coral, 
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#FFF',
        paddingHorizontal: 4
    },
    unreadCountText: { color: '#FFF', fontSize: 10, fontFamily: 'Poppins_900Black' },
    content: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    name: { fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 0.5 },
    time: { fontSize: 11, fontFamily: 'Poppins_500Medium', opacity: 0.6 },
    previewContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    preview: { fontSize: 13, flex: 1 },
    empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: spacing.xl },
    emptyIconContainer: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: spacing.xl,
        ...shadows.soft(false)
    },
    emptyText: { textAlign: 'center', marginBottom: spacing.xl, fontFamily: 'Poppins_500Medium', lineHeight: 24, fontSize: 16 },
    startBtn: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 30,
        ...shadows.soft(false)
    },
    startBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 14 }
});
