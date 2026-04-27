//src/screens/FriendsScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EmptyState from '../components/common/EmptyState';
import CustomAlert from '../components/common/CustomAlert';
import AppLoader from '../components/common/AppLoader';
import { useData } from '../context/DataContext';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

export default function FriendsScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation<any>();
    const { friends, friendRequests, isLoading, updateFriends, updateFriendRequests } = useData();
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'requests' | 'sent'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [pendingUserIds, setPendingUserIds] = useState<Set<string>>(new Set());
    const scrollRef = useRef<ScrollView>(null);

    // CustomAlert state
    const [alertState, setAlertState] = useState<{
        visible: boolean; title: string; message: string; type: 'success' | 'error';
    }>({ visible: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('SCROLL_TO_TOP_Friends', () => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        fetchSentRequests();
    }, []);

    useEffect(() => {
        if (searchQuery.length > 2) {
            handleSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const fetchSentRequests = async () => {
        try {
            const response = await api.get('/friends/sent');
            const sent = response.data.data || [];
            setSentRequests(sent);
            // Construire le set des IDs pour lesquels une demande est déjà envoyée
            const ids = new Set<string>();
            sent.forEach((s: any) => {
                s.users.forEach((u: any) => {
                    const uid = u._id || u;
                    if (uid.toString() !== 'self') ids.add(uid.toString());
                });
            });
            setPendingUserIds(ids);
        } catch (e) {
            console.log("Error fetching sent requests:", e);
        }
    };

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const response = await api.get(`/friends/search?query=${searchQuery}`);
            setSearchResults(response.data.data);
        } catch (e) {
            console.log("Search error", e);
        } finally {
            setIsSearching(false);
        }
    };

    const sendRequest = async (userId: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await api.post(`/friends/request/${userId}`);
            // Marquer comme envoyé localement
            setPendingUserIds(prev => new Set(prev).add(userId));
            setAlertState({
                visible: true,
                title: 'Demande envoyée',
                message: 'Ta demande d\'ami a été envoyée avec succès !',
                type: 'success'
            });
            fetchSentRequests();
        } catch (e: any) {
            setAlertState({
                visible: true,
                title: 'Oups',
                message: e.response?.data?.message || 'Impossible d\'envoyer la demande.',
                type: 'error'
            });
        }
    };

    const acceptRequest = async (requestId: string) => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            await api.post(`/friends/accept/${requestId}`);
            updateFriends();
            updateFriendRequests();
            setAlertState({
                visible: true, title: 'Nouvel ami !',
                message: 'Vous êtes maintenant amis. Lancez un chat !', type: 'success'
            });
        } catch (e) {
            setAlertState({
                visible: true, title: 'Erreur',
                message: 'Impossible d\'accepter cette demande.', type: 'error'
            });
        }
    };

    const onRefresh = async () => {
        try {
            setError(false);
            await Promise.all([updateFriends(), updateFriendRequests(), fetchSentRequests()]);
        } catch (err) {
            setError(true);
        }
    };

    const isAlreadySent = (userId: string) => pendingUserIds.has(userId);

    if (isLoading && friends.length === 0 && friendRequests.length === 0) {
        return (
            <ScreenWrapper>
                <AppLoader error={error} onRetry={onRefresh} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>COMMUNAUTÉ</Text>
            </View>

            {/* 3 Onglets */}
            <View style={styles.tabsContainer}>
                {(['list', 'requests', 'sent'] as const).map((tab) => {
                    const labels = { list: 'AMIS', requests: 'REÇUES', sent: 'ENVOYÉES' };
                    const counts = { list: friends.length, requests: friendRequests.length, sent: sentRequests.length };
                    return (
                        <TouchableOpacity 
                            key={tab}
                            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.coral }]}
                        >
                            <View style={styles.requestTabRow}>
                                <Text style={[styles.tabText, { color: activeTab === tab ? colors.coral : themeColors.textSecondary }]}>
                                    {labels[tab]}
                                </Text>
                                {counts[tab] > 0 && (
                                    <View style={[styles.badge, tab === 'requests' && { backgroundColor: colors.coral }]}>
                                        <Text style={styles.badgeText}>{counts[tab]}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { backgroundColor: themeColors.card }]}>
                    <Ionicons name="search" size={18} color={themeColors.textSecondary} />
                    <TextInput 
                        placeholder="Trouver des génies de la logique..." 
                        placeholderTextColor={themeColors.textSecondary}
                        style={[styles.searchInput, { color: themeColors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView 
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.coral} />
                }
            >
                {/* Résultats de recherche */}
                {searchQuery.length > 0 ? (
                    <View>
                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>RÉSULTATS</Text>
                        {searchResults.length === 0 && !isSearching ? (
                            <Text style={[styles.noResult, { color: themeColors.textSecondary }]}>Aucun utilisateur trouvé</Text>
                        ) : (
                            searchResults.map(user => (
                                <View key={user._id} style={[styles.friendItem, { borderBottomColor: themeColors.border }]}>
                                    <View style={[styles.avatar, { backgroundColor: themeColors.surface }]}>
                                        <Text style={[styles.avatarText, { color: themeColors.primary }]}>{user.login.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.friendInfo}>
                                        <Text style={[styles.friendName, { color: themeColors.text }]}>{user.login}</Text>
                                        <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {user.level}</Text>
                                    </View>
                                    {isAlreadySent(user._id) ? (
                                        <View style={[styles.sentBadge, { backgroundColor: themeColors.surface }]}>
                                            <Ionicons name="time-outline" size={14} color={themeColors.textSecondary} />
                                            <Text style={[styles.sentText, { color: themeColors.textSecondary }]}>Envoyée</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity 
                                            onPress={() => sendRequest(user._id)}
                                            style={[styles.addButton, { backgroundColor: colors.coral }]}
                                        >
                                            <Ionicons name="person-add" size={16} color={colors.white} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        )}
                    </View>

                /* Onglet AMIS */
                ) : activeTab === 'list' ? (
                    friends.length === 0 ? (
                        <EmptyState 
                            icon="people"
                            iconColor={colors.mint}
                            title="Loup Solitaire"
                            message="Recherchez et ajoutez des amis pour comparer vos scores et lancer des défis !"
                        />
                    ) : (
                        friends.map((friend) => (
                            <TouchableOpacity 
                                key={friend.id} 
                                style={[styles.friendItem, { borderBottomColor: themeColors.border }]}
                                onPress={() => navigation.navigate('Chat', { friendId: friend.id, friendName: friend.name })}
                            >
                                <View style={[styles.avatar, { backgroundColor: themeColors.surface }]}>
                                    <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                                        {friend.name.charAt(0).toUpperCase()}
                                    </Text>
                                    <View style={[
                                        styles.statusDot, 
                                        { backgroundColor: friend.status === 'online' ? colors.mint : themeColors.textSecondary }
                                    ]} />
                                </View>
                                <View style={styles.friendInfo}>
                                    <Text style={[styles.friendName, { color: themeColors.text }]}>{friend.name}</Text>
                                    <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {friend.level}</Text>
                                </View>
                                <View style={styles.actions}>
                                    <Ionicons name="chatbubble-ellipses" size={22} color={themeColors.primary} style={{ marginRight: spacing.md }} />
                                    <TouchableOpacity style={[styles.challengeButton, { borderColor: colors.coral }]}>
                                        <Text style={[styles.challengeText, { color: colors.coral }]}>DÉFI</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )

                /* Onglet DEMANDES REÇUES */
                ) : activeTab === 'requests' ? (
                    friendRequests.length === 0 ? (
                        <EmptyState 
                            icon="mail-unread"
                            iconColor={colors.coral}
                            title="Boîte vide"
                            message="Vous n'avez aucune demande d'ami en attente."
                        />
                    ) : (
                        friendRequests.map((req) => (
                            <View key={req._id} style={[styles.friendItem, { borderBottomColor: themeColors.border }]}>
                                <View style={[styles.avatar, { backgroundColor: themeColors.surface }]}>
                                    <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                                        {req.requester.login.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.friendInfo}>
                                    <Text style={[styles.friendName, { color: themeColors.text }]}>{req.requester.login}</Text>
                                    <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {req.requester.level}</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => acceptRequest(req._id)}
                                    style={[styles.acceptButton, { backgroundColor: colors.mint }]}
                                >
                                    <Ionicons name="checkmark" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )

                /* Onglet DEMANDES ENVOYÉES */
                ) : (
                    sentRequests.length === 0 ? (
                        <EmptyState 
                            icon="paper-plane"
                            iconColor={colors.coral}
                            title="Rien d'envoyé"
                            message="Recherchez des joueurs et envoyez-leur une demande d'ami !"
                        />
                    ) : (
                        sentRequests.map((req) => {
                            const recipient = req.users.find((u: any) => u._id.toString() !== req.requester?.toString());
                            if (!recipient) return null;
                            return (
                                <View key={req._id} style={[styles.friendItem, { borderBottomColor: themeColors.border }]}>
                                    <View style={[styles.avatar, { backgroundColor: themeColors.surface }]}>
                                        <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                                            {recipient.login.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.friendInfo}>
                                        <Text style={[styles.friendName, { color: themeColors.text }]}>{recipient.login}</Text>
                                        <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {recipient.level}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 127, 80, 0.15)' }]}>
                                        <Ionicons name="time-outline" size={14} color={colors.coral} />
                                        <Text style={[styles.statusText, { color: colors.coral }]}>En attente</Text>
                                    </View>
                                </View>
                            );
                        })
                    )
                )}
            </ScrollView>

            <CustomAlert 
                visible={alertState.visible}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState({ ...alertState, visible: false })}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignItems: 'center' },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 3 },
    tabsContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText: { ...typography.buttonPrimary, fontSize: 11 },
    requestTabRow: { flexDirection: 'row', alignItems: 'center' },
    badge: { backgroundColor: colors.mint, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 6, paddingHorizontal: 4 },
    badgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
    searchSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 45, borderRadius: borderRadius.xl },
    searchInput: { flex: 1, marginLeft: spacing.sm, ...typography.bodySmall },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
    friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 0.5 },
    avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    avatarText: { ...typography.titleLarge, fontSize: 20 },
    statusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.nightBlue },
    friendInfo: { flex: 1, marginLeft: spacing.md },
    friendName: { ...typography.bodyMedium, fontWeight: 'bold' },
    friendLevel: { ...typography.bodySmall, fontSize: 12 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    challengeButton: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.sm },
    challengeText: { ...typography.bodySmall, fontSize: 10, fontWeight: 'bold' },
    acceptButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    addButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    sentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
    sentText: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
    statusText: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    sectionTitle: { ...typography.bodySmall, fontSize: 10, letterSpacing: 1, marginBottom: spacing.sm },
    noResult: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.md },
});