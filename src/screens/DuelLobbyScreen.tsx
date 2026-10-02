//src/screens/DuelLobbyScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DuelBetModal } from '../components/duel/DuelBetModal';
import { DuelSkeleton } from '../components/duel/DuelSkeleton';
import { DuelAcceptModal } from '../components/duel/DuelAcceptModal';
import { ActiveDuelBanner } from '../components/duel/ActiveDuelBanner';
import { DuelHeaderTabs } from '../components/duel/DuelHeaderTabs';
import { OpponentItem, ReceivedInviteItem, SentInviteItem } from '../components/duel/DuelListItem';
import CustomAlert from '../components/common/CustomAlert';
import KevIcon from '../components/common/KevIcon';
import { DuelRulesModal } from '../components/duel/DuelRulesModal';
import { useDuelLobby } from '../hooks/useDuelLobby';

export default function DuelLobbyScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const { isUserOnline } = useSocketContext();

  const {
    activeTab,
    setActiveTab,
    opponents,
    invites,
    activeDuel,
    isLoading,
    isRefreshing,
    setIsRefreshing,
    isOffline,
    selectedOpponent,
    setSelectedOpponent,
    isSendingInvite,
    respondingInviteId,
    cancellingInviteId,
    showRulesModal,
    setShowRulesModal,
    acceptedDuelData,
    setAcceptedDuelData,
    alertConfig,
    setAlertConfig,
    loadData,
    handleSendInvite,
    handleRespond,
    handleCancelInvite,
    handleCancelActiveDuel,
    handleShareInvite,
  } = useDuelLobby(route?.params?.initialTab || 'opponents');

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab, setActiveTab]);

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
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Rules', { initialTab: 'duel' })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="help-circle-outline" size={22} color={themeColors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.balanceTag}>
            <KevIcon size={16} />
            <Text style={[styles.balanceText, { color: themeColors.text }]}>{user?.kevs || 0}</Text>
          </View>
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

      <DuelHeaderTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        receivedCount={invites.received.length}
        sentCount={invites.sent.length}
        themeColors={themeColors}
      />

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
                isOnline={Boolean(item.isOnline || isUserOnline(item._id))}
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
                onShare={handleShareInvite}
                isCancelling={cancellingInviteId === item._id}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadData(true);
              }}
              tintColor={colors.coral}
            />
          }
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

      <DuelRulesModal
        visible={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        onComplete={() => setShowRulesModal(false)}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { padding: spacing.xs },
  headerTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18 },
  balanceTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm },
  balanceText: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
  listContent: { padding: spacing.lg, gap: spacing.md },
  emptyText: { textAlign: 'center', fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 40 },
  offlineBox: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, marginTop: 40 },
  offlineTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 12 },
  offlineSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: borderRadius.md },
  retryText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 13 },
});
