//src/screens/DuelLobbyScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DuelBetModal } from '../components/duel/DuelBetModal';
import { DuelSkeleton } from '../components/duel/DuelSkeleton';
import { DuelAcceptModal } from '../components/duel/DuelAcceptModal';
import CustomAlert from '../components/common/CustomAlert';
import KevIcon from '../components/common/KevIcon';
import {
  getEligibleOpponents,
  getPendingInvites,
  sendDuelInvite,
  respondDuelInvite,
  cancelDuelInvite,
  Opponent,
  DuelInvite,
} from '../services/duelApi';

export default function DuelLobbyScreen() {
  const navigation = useNavigation<any>();
  const { themeColors } = useTheme();
  const { user, refreshProfile } = useAuth();
  const { subscribe } = useSocketContext();

  const [activeTab, setActiveTab] = useState<'opponents' | 'received' | 'sent'>('opponents');
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [invites, setInvites] = useState<{ received: DuelInvite[]; sent: DuelInvite[] }>({ received: [], sent: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [acceptedDuelData, setAcceptedDuelData] = useState<{ visible: boolean; opponentName: string; duelId: string }>({
    visible: false,
    opponentName: '',
    duelId: '',
  });
  const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; type?: 'info' | 'error' | 'success' }>({
    visible: false,
    title: '',
    message: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsOffline(false);
      const [opps, invs] = await Promise.all([getEligibleOpponents(), getPendingInvites()]);
      setOpponents(opps);
      setInvites(invs);
    } catch (e: any) {
      if (!e.response) setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const unsubInviteReceived = subscribe('duel_invite_received', () => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      loadData();
    });

    const unsubInviteResponse = subscribe('duel_invite_response', (data: any) => {
      loadData();
      if (data?.accept && data?.duelId) {
        setAcceptedDuelData({
          visible: true,
          opponentName: data.opponentName || 'Votre adversaire',
          duelId: data.duelId,
        });
      }
    });

    const unsubCancelled = subscribe('duel_invite_cancelled', () => {
      loadData();
    });

    return () => {
      unsubInviteReceived();
      unsubInviteResponse();
      unsubCancelled();
    };
  }, [loadData, subscribe]);

  const handleSendInvite = async (betAmount: number) => {
    if (!selectedOpponent) return;
    try {
      setIsSendingInvite(true);
      await sendDuelInvite(selectedOpponent._id, betAmount);
      setSelectedOpponent(null);
      setAlertConfig({
        visible: true,
        title: 'Défi envoyé !',
        message: `Votre invitation de duel pour ${betAmount} Kevs a été transmise à ${selectedOpponent.login}.`,
        type: 'success',
      });
      loadData();
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
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
      const res = await respondDuelInvite(duelId, accept);
      if (accept) {
        await refreshProfile();
        navigation.navigate('DuelGame', { duelId: res._id || duelId });
      } else {
        loadData();
      }
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || 'Action impossible.',
        type: 'error',
      });
    }
  };

  const handleCancelInvite = async (duelId: string) => {
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      await cancelDuelInvite(duelId);
      loadData();
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || 'Impossible d\'annuler.',
        type: 'error',
      });
    }
  };

  const pendingSentOpponentIds = invites.sent.map((i) => String(i.opponent?._id));

  const renderOpponentItem = ({ item }: { item: Opponent }) => {
    const isAlreadyInvited = pendingSentOpponentIds.includes(String(item._id));
    return (
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.userRow}>
          <View style={[styles.avatarBox, { backgroundColor: themeColors.overlayLight }]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarPlaceholder, { color: colors.coral }]}>{item.login[0].toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>{item.login}</Text>
            <Text style={[styles.userLevel, { color: themeColors.textSecondary }]}>
              Niveau {item.level} {item.isFriend ? '• Ami' : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          disabled={isAlreadyInvited}
          onPress={() => setSelectedOpponent(item)}
          style={[styles.challengeBtn, { backgroundColor: isAlreadyInvited ? colors.mint : colors.coral }]}
        >
          <Ionicons name={isAlreadyInvited ? 'checkmark-circle' : 'flash'} size={14} color="#FFFFFF" />
          <Text style={styles.challengeBtnText}>{isAlreadyInvited ? 'INVITÉ' : 'DÉFIER'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReceivedItem = ({ item }: { item: DuelInvite }) => (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: colors.coral }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>Défi de {item.challenger.login}</Text>
        <View style={styles.betRow}>
          <Text style={[styles.userLevel, { color: themeColors.textSecondary }]}>Mise : </Text>
          <KevIcon size={14} />
          <Text style={[styles.betText, { color: colors.coral }]}>{item.betAmount} Kevs</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => handleRespond(item._id, true)} style={[styles.acceptBtn, { backgroundColor: colors.mint }]}>
          <Text style={styles.btnActionText}>ACCEPTER</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRespond(item._id, false)} style={[styles.rejectBtn, { backgroundColor: themeColors.overlayLight }]}>
          <Text style={[styles.btnActionText, { color: themeColors.textSecondary }]}>REFUSER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentItem = ({ item }: { item: DuelInvite }) => (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>Défi à {item.opponent.login}</Text>
        <View style={styles.betRow}>
          <Text style={[styles.userLevel, { color: themeColors.textSecondary }]}>Mise : </Text>
          <KevIcon size={14} />
          <Text style={[styles.betText, { color: colors.coral }]}>{item.betAmount} Kevs</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleCancelInvite(item._id)} style={[styles.cancelSentBtn, { borderColor: colors.error }]}>
        <Text style={[styles.cancelSentBtnText, { color: colors.error }]}>ANNULER</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>ARÈNE DUEL 1v1</Text>
        <View style={styles.balanceTag}>
          <KevIcon size={16} />
          <Text style={[styles.balanceText, { color: themeColors.text }]}>{user?.kevs || 0}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('opponents')} style={[styles.tabButton, activeTab === 'opponents' && styles.activeTab]}>
          <Text style={[styles.tabText, { color: activeTab === 'opponents' ? colors.coral : themeColors.textSecondary }]}>
            ADVERSAIRES ({opponents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('received')} style={[styles.tabButton, activeTab === 'received' && styles.activeTab]}>
          <Text style={[styles.tabText, { color: activeTab === 'received' ? colors.coral : themeColors.textSecondary }]}>
            REÇUS ({invites.received.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('sent')} style={[styles.tabButton, activeTab === 'sent' && styles.activeTab]}>
          <Text style={[styles.tabText, { color: activeTab === 'sent' ? colors.coral : themeColors.textSecondary }]}>
            ATTENTES ({invites.sent.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <DuelSkeleton />
      ) : isOffline ? (
        <View style={styles.offlineBox}>
          <Ionicons name="cloud-offline" size={48} color={themeColors.textSecondary} />
          <Text style={[styles.offlineTitle, { color: themeColors.text }]}>Aucune connexion Internet</Text>
          <Text style={[styles.offlineSub, { color: themeColors.textSecondary }]}>Veuillez vérifier votre réseau pour afficher les adversaires.</Text>
          <TouchableOpacity onPress={loadData} style={[styles.retryBtn, { backgroundColor: colors.coral }]}>
            <Text style={styles.retryText}>RÉESSAYER</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'opponents' ? opponents : activeTab === 'received' ? invites.received : invites.sent}
          keyExtractor={(item) => item._id}
          renderItem={activeTab === 'opponents' ? renderOpponentItem : activeTab === 'received' ? renderReceivedItem : (renderSentItem as any)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.coral} />}
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
        buttonText="Fermer"
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
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  userInfo: { flex: 1, marginRight: 8 },
  userName: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
  userLevel: { fontFamily: 'Poppins_400Regular', fontSize: 11 },
  challengeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: borderRadius.sm },
  challengeBtnText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 11 },
  betRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  betText: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 6 },
  acceptBtn: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: borderRadius.sm },
  rejectBtn: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: borderRadius.sm },
  btnActionText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 11 },
  cancelSentBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: borderRadius.sm, borderWidth: 1 },
  cancelSentBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 11 },
  emptyText: { textAlign: 'center', fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 40 },
  offlineBox: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, marginTop: 40 },
  offlineTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 12 },
  offlineSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: borderRadius.md },
  retryText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 13 },
});
