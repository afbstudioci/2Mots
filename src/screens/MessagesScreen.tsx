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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import Skeleton from '../components/common/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { colors, spacing, shadows, typography, borderRadius } from '../theme/theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessagesScreen() {
  const { themeColors, isDark } = useTheme();
  const { friendRequests, friends, updateFriends } = useData();
  const navigation = useNavigation<any>();

  const [conversations, setConversations] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pendingFriendsCount = (friendRequests || []).length;

  const fetchConversations = async () => {
    try {
      const [chatRes] = await Promise.all([
        api.get('/chat/conversations'),
        updateFriends(),
      ]);
      setConversations(chatRes.data.data.conversations || []);

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

  const handleOpenChat = (friendObj: any) => {
    const targetFriend = friendObj.friend || friendObj;
    const fId = targetFriend._id || targetFriend.id;
    const fName = targetFriend.login || targetFriend.name || 'Ami';
    const fAvatar = targetFriend.avatar;
    navigation.navigate('Chat', {
      friendId: fId,
      friendName: fName,
      friendAvatar: fAvatar,
      friend: targetFriend,
    });
  };

  const renderHeader = () => (
    <View style={styles.friendsSection}>
      <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, marginBottom: spacing.xs }]}>
        MES AMIS
      </Text>

      {friends && friends.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsScroll}>
          {friends.map((f: any) => {
            const friendData = f.friend || f;
            const fId = friendData._id || friendData.id;
            return (
              <TouchableOpacity
                key={fId}
                style={styles.friendBubble}
                onPress={() => handleOpenChat(friendData)}
                activeOpacity={0.8}
              >
                <View style={[styles.friendAvatarWrapper, { borderColor: colors.coral }]}>
                  {friendData.avatar ? (
                    <Image source={{ uri: friendData.avatar }} style={styles.friendBubbleAvatar} />
                  ) : (
                    <View style={[styles.friendBubblePlaceholder, { backgroundColor: colors.coral + '20' }]}>
                      <Text style={styles.friendBubbleInitial}>
                        {friendData.login?.charAt(0).toUpperCase() || 'A'}
                      </Text>
                    </View>
                  )}
                  {friendData.isOnline && <View style={styles.onlineDot} />}
                </View>
                <Text style={[styles.friendBubbleName, { color: themeColors.text }]} numberOfLines={1}>
                  {friendData.login}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <TouchableOpacity
          style={[styles.noFriendsRow, { backgroundColor: themeColors.card }]}
          onPress={() => navigation.navigate('Friends')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={18} color={colors.coral} style={{ marginRight: 8 }} />
          <Text style={[styles.noFriendsText, { color: themeColors.textSecondary }]}>
            Aucun ami pour le moment. Touchez pour ajouter !
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }]}>
        CONVERSATIONS RÉCENTES
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>MESSAGES</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Friends')}
          style={[styles.communityBtn, { backgroundColor: colors.coral + '15' }]}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={17} color={colors.coral} />
          <Text style={styles.communityBtnText}>AJOUTER</Text>
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
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ConversationCard
              item={item}
              isFavorite={favorites.includes(item.friend?._id)}
              onPress={() => handleOpenChat(item.friend)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.coral}
              colors={[colors.coral]}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.surface }]}>
                  <Ionicons name="chatbubbles-outline" size={48} color={colors.coral} />
                </View>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                  Aucune conversation active pour le moment. Touchez un ami ci-dessus pour lui écrire !
                </Text>
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
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.overlayLight, borderWidth: 1 }]}>
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
        <Animated.View style={[styles.avatarWrapper, { borderColor: isUnread ? colors.coral : 'transparent', opacity: blinkAnim }]}>
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
            <Text style={styles.unreadCountText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {isFavorite && <Ionicons name="bookmark" size={14} color={colors.coral} style={{ marginRight: 6 }} />}
            <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
              {item.friend?.login}
            </Text>
          </View>
          <Text style={[styles.time, { color: isUnread ? colors.coral : themeColors.textSecondary }]}>
            {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                { color: isUnread ? themeColors.text : themeColors.textSecondary, fontFamily: isUnread ? 'Poppins_700Bold' : 'Poppins_400Regular' },
              ]}
              numberOfLines={1}
            >
              {!lastMsg ? 'Démarrer la discussion...' : lastMsg?.isDeletedForEveryone ? 'Ce message a été supprimé' : lastMsg.text || 'Message vocal'}
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
    fontFamily: 'Poppins_800ExtraBold',
    color: colors.coral,
    letterSpacing: 0.5,
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
  friendsBadgeText: { color: '#FFF', fontSize: 10, fontFamily: 'Poppins_900Black' },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  friendsSection: { marginBottom: spacing.md, paddingTop: spacing.xs, paddingHorizontal: spacing.xs },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 1.2 },
  friendsScroll: { paddingVertical: spacing.xs, gap: 14 },
  friendBubble: { alignItems: 'center', width: 62 },
  friendAvatarWrapper: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, padding: 2, position: 'relative' },
  friendBubbleAvatar: { width: '100%', height: '100%', borderRadius: 26 },
  friendBubblePlaceholder: { width: '100%', height: '100%', borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  friendBubbleInitial: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.coral },
  friendBubbleName: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', textAlign: 'center', width: '100%', marginTop: 2 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.mint, borderWidth: 2, borderColor: '#FFF' },
  noFriendsRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, marginVertical: spacing.xs },
  noFriendsText: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  card: { flexDirection: 'row', padding: spacing.md, borderRadius: 24, marginBottom: spacing.md, alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatarWrapper: { padding: 2, borderRadius: 32, borderWidth: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: colors.coral },
  unreadBadge: { position: 'absolute', top: -2, right: -2, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.coral, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', paddingHorizontal: 5 },
  unreadCountText: { color: '#FFF', fontSize: 11, fontFamily: 'Poppins_900Black' },
  content: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 0.3 },
  time: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
  previewContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  preview: { fontSize: 13, flex: 1 },
  empty: { alignItems: 'center', marginTop: 40, paddingHorizontal: spacing.xl },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, ...shadows.medium(false) },
  emptyText: { textAlign: 'center', marginBottom: spacing.xl, fontFamily: 'Poppins_500Medium', lineHeight: 22, fontSize: 14 },
});