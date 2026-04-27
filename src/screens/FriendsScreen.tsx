//src/screens/FriendsScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, DeviceEventEmitter, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EmptyState from '../components/common/EmptyState';
import CustomAlert from '../components/common/CustomAlert';
import AppLoader from '../components/common/AppLoader';
import { useData } from '../context/DataContext';
import FriendCard from '../components/friends/FriendCard';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

export default function FriendsScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation<any>();
    const { friends, friendRequests, isLoading, updateFriends, updateFriendRequests, updateUnreadCount } = useData();
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'requests' | 'sent'>('list');
    
    // États de recherche par onglet
    const [searchGlobal, setSearchGlobal] = useState(''); // Recherche d'utilisateurs (Onglet Amis quand pas vide)
    const [filterList, setFilterList] = useState(''); // Filtre local Amis
    const [filterRequests, setFilterRequests] = useState(''); // Filtre local Reçues
    const [filterSent, setFilterSent] = useState(''); // Filtre local Envoyées

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
        fetchSentRequests();
        updateUnreadCount();
    }, []);

    useEffect(() => {
        if (searchGlobal.length > 2) {
            handleSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchGlobal]);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const response = await api.get(`/friends/search?query=${searchGlobal}`);
            setSearchResults(response.data.data);
        } catch (e) {
            console.log("Search error", e);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const response = await api.get('/friends/sent');
            const sent = response.data.data || [];
            setSentRequests(sent);
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

    const sendRequest = async (userId: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await api.post(`/friends/request/${userId}`);
            setPendingUserIds(prev => new Set(prev).add(userId));
            setAlertState({
                visible: true, title: 'Demande envoyée',
                message: 'Ta demande d\'ami a été envoyée avec succès !', type: 'success'
            });
            fetchSentRequests();
        } catch (e: any) {
            setAlertState({
                visible: true, title: 'Oups',
                message: e.response?.data?.message || 'Impossible d\'envoyer la demande.', type: 'error'
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
            await Promise.all([updateFriends(), updateFriendRequests(), fetchSentRequests(), updateUnreadCount()]);
        } catch (err) {
            setError(true);
        }
    };

    // Filtrage local
    const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(filterList.toLowerCase()));
    const filteredRequests = friendRequests.filter(r => r.requester.login.toLowerCase().includes(filterRequests.toLowerCase()));
    const filteredSent = sentRequests.filter(r => {
        const recipient = r.users.find((u: any) => u._id.toString() !== r.requester?.toString());
        return recipient?.login.toLowerCase().includes(filterSent.toLowerCase());
    });

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>COMMUNAUTÉ</Text>
            </View>

            {/* Stats / Tabs */}
            <View style={styles.tabsContainer}>
                {(['list', 'requests', 'sent'] as const).map((tab) => {
                    const labels = { list: 'AMIS', requests: 'REÇUES', sent: 'ENVOYÉES' };
                    const counts = { list: friends.length, requests: friendRequests.length, sent: sentRequests.length };
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity 
                            key={tab}
                            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                            style={[styles.tab, isActive && { borderBottomColor: colors.coral }]}
                        >
                            <Text style={[styles.tabCount, { color: isActive ? colors.coral : themeColors.text }]}>
                                {counts[tab]}
                            </Text>
                            <Text style={[styles.tabLabel, { color: isActive ? colors.coral : themeColors.textSecondary }]}>
                                {labels[tab]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Barre de recherche contextuelle */}
            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { backgroundColor: themeColors.card }]}>
                    <Ionicons name="search" size={18} color={themeColors.textSecondary} />
                    <TextInput 
                        placeholder={
                            activeTab === 'list' ? (friends.length > 0 ? "Filtrer mes amis..." : "Trouver des génies...") :
                            activeTab === 'requests' ? "Chercher dans les demandes..." : "Chercher une demande envoyée..."
                        }
                        placeholderTextColor={themeColors.textSecondary}
                        style={[styles.searchInput, { color: themeColors.text }]}
                        value={
                            activeTab === 'list' ? (friends.length > 0 ? filterList : searchGlobal) :
                            activeTab === 'requests' ? filterRequests : filterSent
                        }
                        onChangeText={(t) => {
                            if (activeTab === 'list') {
                                if (friends.length > 0) setFilterList(t);
                                else setSearchGlobal(t);
                            } else if (activeTab === 'requests') setFilterRequests(t);
                            else setFilterSent(t);
                        }}
                    />
                    {(activeTab === 'list' ? (friends.length > 0 ? filterList : searchGlobal) : activeTab === 'requests' ? filterRequests : filterSent).length > 0 && (
                        <TouchableOpacity onPress={() => {
                            if (activeTab === 'list') { setFilterList(''); setSearchGlobal(''); }
                            else if (activeTab === 'requests') setFilterRequests('');
                            else setFilterSent('');
                        }}>
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
                {/* Recherche Globale (quand on n'a pas d'amis ou qu'on cherche activement) */}
                {activeTab === 'list' && friends.length === 0 && searchGlobal.length > 0 ? (
                    <View>
                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>UTILISATEURS TROUVÉS</Text>
                        {isSearching ? <ActivityIndicator color={colors.coral} /> :
                         searchResults.length === 0 ? <Text style={[styles.noResult, { color: themeColors.textSecondary }]}>Aucun résultat</Text> :
                         searchResults.map(user => (
                             <FriendCard 
                                key={user._id}
                                friend={{ id: user._id, name: user.login, avatar: user.avatar, level: user.level }}
                                rightElement={
                                    pendingUserIds.has(user._id) ? (
                                        <View style={styles.sentBadge}><Text style={styles.sentText}>Envoyée</Text></View>
                                    ) : (
                                        <TouchableOpacity onPress={() => sendRequest(user._id)} style={styles.addButton}>
                                            <Ionicons name="person-add" size={18} color={colors.coral} />
                                        </TouchableOpacity>
                                    )
                                }
                             />
                         ))
                        }
                    </View>
                ) : activeTab === 'list' ? (
                    filteredFriends.length === 0 ? (
                        <EmptyState 
                            icon="people" iconColor={colors.mint}
                            title="Loup Solitaire"
                            message={filterList ? "Aucun ami ne correspond à ce nom." : "Ajoutez des amis pour comparer vos scores !"}
                        />
                    ) : (
                        filteredFriends.map(f => (
                            <FriendCard 
                                key={f.id}
                                friend={f}
                                onPress={() => navigation.navigate('Chat', { friendId: f.id, friendName: f.name, friendAvatar: f.avatar })}
                                onChallenge={() => console.log("Challenge", f.id)}
                            />
                        ))
                    )
                ) : activeTab === 'requests' ? (
                    filteredRequests.length === 0 ? (
                        <EmptyState icon="mail-unread" iconColor={colors.coral} title="Boîte vide" message="Aucune demande d'ami en attente." />
                    ) : (
                        filteredRequests.map(r => (
                            <FriendCard 
                                key={r._id}
                                friend={{ id: r.requester._id, name: r.requester.login, avatar: r.requester.avatar, level: r.requester.level }}
                                rightElement={
                                    <TouchableOpacity onPress={() => acceptRequest(r._id)} style={styles.acceptButton}>
                                        <Ionicons name="checkmark-circle" size={32} color={colors.mint} />
                                    </TouchableOpacity>
                                }
                            />
                        ))
                    )
                ) : (
                    filteredSent.length === 0 ? (
                        <EmptyState icon="paper-plane" iconColor={colors.coral} title="Rien d'envoyé" message="Aucune demande en attente de réponse." />
                    ) : (
                        filteredSent.map(r => {
                            const recipient = r.users.find((u: any) => u._id.toString() !== r.requester?.toString());
                            return (
                                <FriendCard 
                                    key={r._id}
                                    friend={{ id: recipient._id, name: recipient.login, avatar: recipient.avatar, level: recipient.level }}
                                    rightElement={
                                        <View style={styles.pendingBadge}><Text style={styles.pendingText}>EN ATTENTE</Text></View>
                                    }
                                />
                            );
                        })
                    )
                )}
            </ScrollView>

            <CustomAlert 
                visible={alertState.visible} title={alertState.title} message={alertState.message} type={alertState.type}
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
    tabCount: { fontSize: 18, fontFamily: 'Poppins_700Bold', marginBottom: -2 },
    tabLabel: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', letterSpacing: 0.5 },
    searchSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 45, borderRadius: borderRadius.xl },
    searchInput: { flex: 1, marginLeft: spacing.sm, ...typography.bodySmall },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
    friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 0.5 },
    avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
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
    sentBadge: { backgroundColor: 'rgba(255, 127, 80, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    sentText: { color: colors.coral, fontSize: 10, fontFamily: 'Poppins_700Bold' },
    pendingBadge: { backgroundColor: 'rgba(0, 0, 0, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pendingText: { color: '#999', fontSize: 10, fontFamily: 'Poppins_700Bold' },
    sectionTitle: { ...typography.bodySmall, fontSize: 10, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.md },
    noResult: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.md },
});