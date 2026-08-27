//src/screens/DuelLobbyScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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
import { OpponentItem, ReceivedInviteItem, SentInviteItem } from '../components/duel/DuelListItem';
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

  const handlePromptCancelInvite = (invite: DuelInvite) => {
    setAlertConfig({
      visible: true,
      title: 'Annuler l\'invitation ?',
      message: `Voulez-vous vraiment annuler votre défi de ${invite.betAmount} Kevs transmis à ${invite.opponent?.login || 'ce joueur'} ?`,
      type: 'info',
      buttonText: 'Non',
      confirmText: 'Oui, annuler',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        await handleCancelInvite(invite._id);
      },
    });
  };

  const pendingSentOpponentIds = invites.sent.map((i) => String(i.opponent?._id));

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
        <FlatList<any>
          data={activeTab === 'opponents' ? opponents : activeTab === 'received' ? invites.received : invites.sent}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            activeTab === 'opponents' ? (
              <OpponentItem
                item={item}
                isAlreadyInvited={pendingSentOpponentIds.includes(String(item._id))}
                themeColors={themeColors}
                onSelect={setSelectedOpponent}
              />
            ) : activeTab === 'received' ? (
              <ReceivedInviteItem item={item} themeColors={themeColors} onRespond={handleRespond} />
            ) : (
              <SentInviteItem item={item} themeColors={themeColors} onCancel={handlePromptCancelInvite} />
            )
          }
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
        buttonText={alertConfig.buttonText || "Fermer"}
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
