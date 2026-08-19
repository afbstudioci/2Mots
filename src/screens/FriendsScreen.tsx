//src/screens/FriendsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/theme';
import api from '../services/api';

export default function FriendsScreen() {
  const { themeColors, isDark } = useTheme();
  const { refreshAll } = useData();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<'requests' | 'sent'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchGlobal, setSearchGlobal] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
  }>({ visible: false, title: '', message: '' });

  const fetchFriendData = async () => {
    try {
      setIsLoading(true);
      const [reqRes, sentRes] = await Promise.all([
        api.get('/friends/requests'),
        api.get('/friends/sent-requests'),
      ]);
      setRequests(reqRes.data.data || []);
      setSentRequests(sentRes.data.data || []);
    } catch {
      setRequests([]);
      setSentRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendData();
  }, []);

  const handleGlobalSearch = async (query: string) => {
    setSearchGlobal(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const res = await api.get(`/friends/search?q=${encodeURIComponent(query.trim())}`);
      setSearchResults(res.data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await api.post(`/friends/accept/${requestId}`);
      setAlertState({ visible: true, title: 'AMI AJOUTÉ !', message: 'Demande acceptée avec succès.', type: 'success' });
      fetchFriendData();
      refreshAll();
    } catch (err: any) {
      setAlertState({ visible: true, title: 'ERREUR', message: err.response?.data?.message || 'Action impossible.', type: 'error' });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await api.post(`/friends/reject/${requestId}`);
      setAlertState({ visible: true, title: 'DEMANDE REFUSÉE', message: 'La demande a été déclinée.', type: 'info' });
      fetchFriendData();
      refreshAll();
    } catch (err: any) {
      setAlertState({ visible: true, title: 'ERREUR', message: err.response?.data?.message || 'Action impossible.', type: 'error' });
    }
  };

  const sendRequest = async (userId: string) => {
    try {
      await api.post('/friends/request', { friendId: userId });
      setAlertState({ visible: true, title: 'DEMANDE ENVOYÉE', message: 'Votre invitation est en route.', type: 'success' });
      fetchFriendData();
      if (searchGlobal) handleGlobalSearch(searchGlobal);
    } catch (err: any) {
      setAlertState({ visible: true, title: 'ERREUR', message: err.response?.data?.message || 'Envoi impossible.', type: 'error' });
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>DEMANDES D'AMIS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.surface }]}>
          <Ionicons name="search" size={18} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Rechercher des joueurs..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchGlobal}
            onChangeText={handleGlobalSearch}
          />
          {searchGlobal.length > 0 && (
            <TouchableOpacity onPress={() => handleGlobalSearch('')}>
              <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchGlobal.length === 0 && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && { borderBottomColor: colors.coral }]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabCount, { color: activeTab === 'requests' ? colors.coral : themeColors.textSecondary }]}>
              {requests.length}
            </Text>
            <Text style={[styles.tabLabel, { color: activeTab === 'requests' ? colors.coral : themeColors.textSecondary }]}>
              REÇUES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && { borderBottomColor: colors.coral }]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabCount, { color: activeTab === 'sent' ? colors.coral : themeColors.textSecondary }]}>
              {sentRequests.length}
            </Text>
            <Text style={[styles.tabLabel, { color: activeTab === 'sent' ? colors.coral : themeColors.textSecondary }]}>
              ENVOYÉES
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFriendData} tintColor={colors.coral} />}
      >
        {searchGlobal.length > 0 ? (
          <View>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>RÉSULTATS DE RECHERCHE</Text>
            {isSearching ? (
              <ActivityIndicator color={colors.coral} style={{ marginTop: 20 }} />
            ) : searchResults.length === 0 ? (
              <Text style={[styles.noResult, { color: themeColors.textSecondary }]}>Aucun utilisateur trouvé</Text>
            ) : (
              searchResults.map((u) => (
                <View key={u._id} style={[styles.friendItem, { borderColor: themeColors.overlayLight }]}>
                  <View style={[styles.avatar, { backgroundColor: colors.coral + '20' }]}>
                    {u.avatar ? (
                      <Image source={{ uri: u.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={[styles.avatarText, { color: colors.coral }]}>{u.login?.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: themeColors.text }]}>{u.login}</Text>
                    <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {u.level || 1}</Text>
                  </View>
                  <TouchableOpacity onPress={() => sendRequest(u._id)} style={styles.addButton}>
                    <Ionicons name="person-add" size={22} color={colors.coral} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-unread-outline" size={48} color={themeColors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Boîte vide</Text>
              <Text style={[styles.emptyDesc, { color: themeColors.textSecondary }]}>Aucune demande d'ami en attente.</Text>
            </View>
          ) : (
            requests.map((r) => (
              <View key={r._id} style={[styles.friendItem, { borderColor: themeColors.overlayLight }]}>
                <View style={[styles.avatar, { backgroundColor: colors.coral + '20' }]}>
                  {r.requester?.avatar ? (
                    <Image source={{ uri: r.requester.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.coral }]}>{r.requester?.login?.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: themeColors.text }]}>{r.requester?.login}</Text>
                  <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {r.requester?.level || 1}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => rejectRequest(r._id)} style={styles.rejectBtn}>
                    <Ionicons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => acceptRequest(r._id)} style={styles.acceptBtn}>
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : sentRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="paper-plane-outline" size={48} color={themeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Rien d'envoyé</Text>
            <Text style={[styles.emptyDesc, { color: themeColors.textSecondary }]}>Aucune demande en attente de réponse.</Text>
          </View>
        ) : (
          sentRequests.map((r) => {
            const recipient = r.users?.find((u: any) => u._id?.toString() !== r.requester?.toString()) || r.recipient;
            return (
              <View key={r._id} style={[styles.friendItem, { borderColor: themeColors.overlayLight }]}>
                <View style={[styles.avatar, { backgroundColor: colors.coral + '20' }]}>
                  {recipient?.avatar ? (
                    <Image source={{ uri: recipient.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.coral }]}>{recipient?.login?.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: themeColors.text }]}>{recipient?.login}</Text>
                  <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {recipient?.level || 1}</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>EN ATTENTE</Text>
                </View>
              </View>
            );
          })
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
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40 },
  headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabCount: { fontSize: 18, fontFamily: 'Poppins_700Bold', marginBottom: -2 },
  tabLabel: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', letterSpacing: 0.5 },
  searchSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 45, borderRadius: borderRadius.xl },
  searchInput: { flex: 1, marginLeft: spacing.sm, ...typography.bodySmall },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 0.5 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontFamily: 'Poppins_700Bold' },
  friendInfo: { flex: 1, marginLeft: spacing.md },
  friendName: { fontSize: 15, fontFamily: 'Poppins_700Bold' },
  friendLevel: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(229, 62, 62, 0.15)', justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' },
  addButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  pendingBadge: { backgroundColor: 'rgba(0, 0, 0, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingText: { color: '#999', fontSize: 10, fontFamily: 'Poppins_700Bold' },
  sectionTitle: { fontSize: 11, fontFamily: 'Poppins_700Bold', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.md },
  noResult: { textAlign: 'center', marginTop: spacing.md, fontFamily: 'Poppins_500Medium' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', marginTop: 12 },
  emptyDesc: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginTop: 4 },
});