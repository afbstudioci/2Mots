//src/screens/MessagesScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import Skeleton from '../components/common/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { colors, spacing, shadows, typography } from '../theme/theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessagesScreen() {
  const { themeColors, isDark } = useTheme();
  const { friendRequests } = useData();
  const navigation = useNavigation<any>();

  const [conversations, setConversations] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pendingFriendsCount = (friendRequests || []).length;

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data.data.conversations || []);

      const favKeys = await AsyncStorage.getAllKeys();
      const favFriendIds = favKeys
        .filter((k) => k.startsWith('@twomots_favorite_'))
        .map((k) => k.replace('@twomots_favorite_', ''));
      setFavorites(favFriendIds);
    } catch {
      setConversations([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchConversations();
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    const isAFav = favorites.includes(a.friend?._id);
    const isBFav = favorites.includes(b.friend?._id);
    if (isAFav && !isBFav) return -1;
    if (!isAFav && isBFav) return 1;

    const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>MESSAGES</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Friends')}
          style={[styles.communityBtn, { backgroundColor: colors.coral + '15' }]}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={18} color={colors.coral} />
          <Text style={styles.communityBtnText}>AMIS</Text>
          {pendingFriendsCount > 0 && (
            <View style={styles.friendsBadge}>
              <Text style={styles.friendsBadgeText}>
                {pendingFriendsCount > 9 ? '9+' : pendingFriendsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ConversationSkeleton />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={sortedConversations}
          keyExtractor={(item) => item.friend?._id || Math.random().toString()}
          renderItem={({ item }) => (
            <ConversationCard
              item={item}
              isFavorite={favorites.includes(item.friend?._id)}
              onPress={() =>
                navigation.navigate('Chat', {
                  friendId: item.friend?._id,
                  friendName: item.friend?.login,
                  friendAvatar: item.friend?.avatar,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.coral} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.card }]}>
                  <Ionicons name="chatbubbles-outline" size={54} color={colors.coral} />
                </View>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                  Aucune discussion active.{'\n'}Lancez un défi à un ami !
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Friends')}
                  style={[styles.startBtn, { backgroundColor: colors.coral }]}
                >
                  <Text style={styles.startBtnText}>Trouver des amis</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </ScreenWrapper>
  );
}

const ConversationSkeleton = () => {
  const { themeColors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.overlayLight,
          borderWidth: 1,
        },
      ]}
    >
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Skeleton width={120} height={20} borderRadius={6} />
          <Skeleton width={40} height={14} borderRadius={4} />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <Skeleton width="80%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const ConversationCard = ({ item, isFavorite, onPress }: any) => {
  const { themeColors, isDark } = useTheme();
  const lastMsg = item.lastMessage;
  const isUnread = item.unreadCount > 0;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isUnread) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isUnread]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: isUnread ? (isDark ? '#2A1F1F' : '#FFF5F5') : themeColors.card,
          borderColor: isUnread ? colors.coral : isDark ? themeColors.overlayLight : '#E5E5E5',
          borderWidth: isUnread ? 2 : 1,
        },
        shadows.medium(isDark),
      ]}
    >
      <View style={styles.avatarContainer}>
        <Animated.View
          style={[
            styles.avatarWrapper,
            { borderColor: isUnread ? colors.coral : 'transparent', opacity: blinkAnim },
          ]}
        >
          {item.friend?.avatar ? (
            <Image source={{ uri: item.friend.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.coral + '20' }]}>
              <Text style={styles.avatarInitial}>{item.friend?.login?.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </Animated.View>
        {isUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCountText}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {isFavorite && <Ionicons name="star" size={14} color={colors.coral} style={{ marginRight: 6 }} />}
            <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
              {item.friend?.login}
            </Text>
          </View>
          <Text style={[styles.time, { color: isUnread ? colors.coral : themeColors.textSecondary }]}>
            {lastMsg
              ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.previewContainer}>
            {lastMsg && lastMsg.sender !== item.friend?._id && (
              <Ionicons
                name={lastMsg.isRead ? 'checkmark-done' : 'checkmark'}
                size={15}
                color={lastMsg.isRead ? colors.mint : themeColors.textSecondary}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              style={[
                styles.preview,
                {
                  color: isUnread ? themeColors.text : themeColors.textSecondary,
                  fontFamily: isUnread ? 'Poppins_700Bold' : 'Poppins_400Regular',
                },
              ]}
              numberOfLines={1}
            >
              {!lastMsg
                ? 'Démarrer la discussion...'
                : lastMsg?.isDeletedForEveryone
                ? 'Ce message a été supprimé'
                : lastMsg.text || 'Message vocal'}
            </Text>
          </View>
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
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
  communityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  communityBtnText: {
    marginLeft: 6,
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: colors.coral,
  },
  friendsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  friendsBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins_900Black',
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
    borderRadius: 32,
    borderWidth: 2,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: colors.coral },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    paddingHorizontal: 5,
  },
  unreadCountText: { color: '#FFF', fontSize: 11, fontFamily: 'Poppins_900Black' },
  content: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 0.3 },
  time: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
  previewContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  preview: { fontSize: 13, flex: 1 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: spacing.xl },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium(false),
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 24,
    fontSize: 16,
  },
  startBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
    ...shadows.medium(false),
  },
  startBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 15 },
});