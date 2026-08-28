//src/screens/DuelLobbyScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DuelBetModal } from '../components/duel/DuelBetModal';
import { DuelSkeleton } from '../components/duel/DuelSkeleton';
import { DuelAcceptModal } from '../components/duel/DuelAcceptModal';
import { ActiveDuelBanner } from '../components/duel/ActiveDuelBanner';
import { OpponentItem, ReceivedInviteItem, SentInviteItem } from '../components/duel/DuelListItem';
import CustomAlert from '../components/common/CustomAlert';
import KevIcon from '../components/common/KevIcon';
import {
  getEligibleOpponents,
  getPendingInvites,
  getActiveDuel,
  getCachedOpponents,
  getCachedInvites,
  sendDuelInvite,
  respondDuelInvite,
  cancelDuelInvite,
  cancelInactiveDuel,
  Opponent,
  DuelInvite,
  DuelSessionData,
} from '../services/duelApi';

export default function DuelLobbyScreen() {
  const navigation = useNavigation<any>();
  const { themeColors } = useTheme();
  const { user, refreshProfile } = useAuth();
  const { emit, subscribe } = useSocketContext();

  const [activeTab, setActiveTab] = useState<'opponents' | 'received' | 'sent'>('opponents');
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [invites, setInvites] = useState<{ received: DuelInvite[]; sent: DuelInvite[] }>({ received: [], sent: [] });
  const [activeDuel, setActiveDuel] = useState<DuelSessionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [acceptedDuelData, setAcceptedDuelData] = useState<{ visible: boolean; opponentName: string; duelId: string }>({
    visible: false,
    opponentName: '',
    duelId: '',
  });
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(null);
  const [cancellingInviteId, setCancellingInviteId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success';
    buttonText?: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const [cachedOpps, cachedInvs] = await Promise.all([getCachedOpponents(), getCachedInvites()]);
        if (cachedOpps && cachedOpps.length > 0) setOpponents(cachedOpps);
        if (cachedInvs) setInvites(cachedInvs);
      }
      const [opps, invs, active] = await Promise.all([
        getEligibleOpponents(),
        getPendingInvites(),
        getActiveDuel(),
      ]);
      setOpponents(opps);
      setInvites(invs);
      setActiveDuel(active);
      setIsOffline(false);
    } catch (e: any) {
      if (!e.response && opponents.length === 0) setIsOffline(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [opponents.length]);

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [loadData])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadData(true);
      }
    });

    const unsubInviteReceived = subscribe('duel_invite_received', () => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      loadData(true);
    });

    const unsubInviteResponse = subscribe('duel_invite_response', (data: any) => {
      loadData(true);
      if (data?.accept && data?.duelId) {
        setAcceptedDuelData({
          visible: true,
          opponentName: data.opponentName || 'Votre adversaire',
          duelId: data.duelId,
        });
      }
    });

    const unsubCancelled = subscribe('duel_invite_cancelled', () => {
      loadData(true);
    });

    return () => {
      subscription.remove();
      unsubInviteReceived();
      unsubInviteResponse();
      unsubCancelled();
    };
  }, [loadData, subscribe]);

  const handleSendInvite = async (betAmount: number) => {
    if (!selectedOpponent) return;
    try {
      setIsSendingInvite(true);
      const res = await sendDuelInvite(selectedOpponent._id, betAmount);
      emit('duel_send_invite', {
        opponentId: String(selectedOpponent._id),
        challengerName: user?.login,
        betAmount,
        duelId: String(res?._id || ''),
      });
      setSelectedOpponent(null);
      setAlertConfig({
        visible: true,
        title: 'Défi envoyé !',
        message: `Votre invitation pour ${betAmount} Kevs a été transmise à ${selectedOpponent.login}.`,
        type: 'success',
      });
      loadData(true);
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: 'Impossible de défier',
        message: e?.response?.data?.message || e.message || 'Une erreur est survenue.',
        type: 'error',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRespond = async (duelId: string, accept: boolean) => {
    try {
      setRespondingInviteId(duelId);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

      const res = await respondDuelInvite(duelId, accept);
      setInvites((prev) => ({
        ...prev,
        received: prev.received.filter((i) => i._id !== duelId),
      }));

      emit('duel_respond_invite', {
        challengerId: String(res?.challenger?._id || res?.challenger || ''),
        opponentName: user?.login,
        accept,
        duelId,
      });

      if (accept) {
        await refreshProfile();
        navigation.navigate('DuelGame', { duelId: res?._id || duelId });
      } else {
        loadData(true);
      }
    } catch (e: any) {
      loadData(true);
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || 'Action impossible.',
        type: 'error',
      });
    } finally {
      setRespondingInviteId(null);
    }
  };

  const handleCancelInvite = async (duelId: string, opponentId?: string) => {
    try {
      setCancellingInviteId(duelId);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      await cancelDuelInvite(duelId);
      if (opponentId) {
        emit('duel_cancel_invite', { opponentId: String(opponentId), duelId });
      }
      setInvites((prev) => ({
        ...prev,
        sent: prev.sent.filter((i) => i._id !== duelId),
      }));
      loadData(true);
    } catch (e: any) {
      loadData(true);
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || "Impossible d'annuler.",
        type: 'error',
      });
    } finally {
      setCancellingInviteId(null);
    }
  };

  const handleCancelActiveDuel = async (duelId: string) => {
    try {
      await cancelInactiveDuel(duelId);
      await refreshProfile();
      setActiveDuel(null);
      loadData(true);
      setAlertConfig({
        visible: true,
        title: 'Duel annulé',
        message: 'Le duel a été annulé et vos Kevs ont été remboursés.',
        type: 'success',
      });
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || "Impossible d'annuler.",
        type: 'error',
      });
    }
  };

  const pendingSentOpponentIds = invites.sent.map((i) => String(i.opponent?._id));
  const activeOpponentId = activeDuel
    ? String(activeDuel.challenger?._id === user?._id ? activeDuel.opponent?._id : activeDuel.challenger?._id)
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>ARÈNE DUEL 1V1</Text>
        <View style={styles.balanceTag}>
          <KevIcon size={16} />
          <Text style={[styles.balanceText, { color: themeColors.text }]}>{user?.kevs || 0}</Text>
        </View>
      </View>

      {activeDuel && (
        <ActiveDuelBanner
          duel={activeDuel}
          currentUserId={user?._id || ''}
          themeColors={themeColors}
          onJoin={(duelId) => navigation.navigate('DuelGame', { duelId })}
          onCancel={handleCancelActiveDuel}
        />
      )}

      <View style={styles.tabContainer}>
        {(['opponents', 'received', 'sent'] as const).map((tabKey) => {
          const count = tabKey === 'opponents' ? opponents.length : tabKey === 'received' ? invites.received.length : invites.sent.length;
          const label = tabKey === 'opponents' ? 'ADVERSAIRES' : tabKey === 'received' ? 'REÇUS' : 'ATTENTES';
          const isActive = activeTab === tabKey;
          return (
            <TouchableOpacity key={tabKey} onPress={() => setActiveTab(tabKey)} style={[styles.tabButton, isActive && styles.activeTab]}>
              <Text style={[styles.tabText, { color: isActive ? colors.coral : themeColors.textSecondary }]}>
                {label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && opponents.length === 0 ? (
        <DuelSkeleton />
      ) : isOffline && opponents.length === 0 ? (
        <View style={styles.offlineBox}>
          <Ionicons name="cloud-offline" size={48} color={themeColors.textSecondary} />
          <Text style={[styles.offlineTitle, { color: themeColors.text }]}>Aucune connexion Internet</Text>
          <Text style={[styles.offlineSub, { color: themeColors.textSecondary }]}>Veuillez vérifier votre réseau.</Text>
          <TouchableOpacity onPress={() => loadData(true)} style={[styles.retryBtn, { backgroundColor: colors.coral }]}>
            <Text style={styles.retryText}>RÉESSAYER</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<any>
          data={activeTab === 'opponents' ? opponents : activeTab === 'received' ? invites.received : invites.sent}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            activeTab === 'opponents' ? (
              <OpponentItem
                item={item}
                isAlreadyInvited={pendingSentOpponentIds.includes(String(item._id)) || activeOpponentId === String(item._id)}
                themeColors={themeColors}
                onSelect={setSelectedOpponent}
              />
            ) : activeTab === 'received' ? (
              <ReceivedInviteItem
                item={item}
                themeColors={themeColors}
                onRespond={handleRespond}
                isResponding={respondingInviteId === item._id}
              />
            ) : (
              <SentInviteItem
                item={item}
                themeColors={themeColors}
                onCancel={(invite) => handleCancelInvite(invite._id, invite.opponent?._id)}
                isCancelling={cancellingInviteId === item._id}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(true); }} tintColor={colors.coral} />}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              {activeTab === 'opponents'
                ? 'Aucun joueur niveau 5 disponible pour le moment.'
                : activeTab === 'received'
                ? 'Aucun défi reçu en attente.'
                : 'Aucune invitation envoyée en attente.'}
            </Text>
          }
        />
      )}

      <DuelBetModal
        visible={Boolean(selectedOpponent)}
        opponent={selectedOpponent}
        userKevs={user?.kevs || 0}
        onClose={() => setSelectedOpponent(null)}
        onConfirm={handleSendInvite}
        isLoading={isSendingInvite}
      />

      <DuelAcceptModal
        visible={acceptedDuelData.visible}
        opponentName={acceptedDuelData.opponentName}
        duelId={acceptedDuelData.duelId}
        onStartNow={() => {
          setAcceptedDuelData((prev) => ({ ...prev, visible: false }));
          navigation.navigate('DuelGame', { duelId: acceptedDuelData.duelId });
        }}
      />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText || 'Fermer'}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { padding: spacing.xs },
  headerTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18 },
  balanceTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm },
  balanceText: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tabButton: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  activeTab: { borderBottomColor: colors.coral, borderBottomWidth: 3 },
  tabText: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
  listContent: { padding: spacing.lg, gap: spacing.md },
  emptyText: { textAlign: 'center', fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 40 },
  offlineBox: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, marginTop: 40 },
  offlineTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 12 },
  offlineSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: borderRadius.md },
  retryText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 13 },
});
