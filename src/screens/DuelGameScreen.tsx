//src/screens/DuelGameScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useDuelArena } from '../hooks/useDuelArena';
import { DuelResultModal } from '../components/duel/DuelResultModal';
import { DuelBuzzerButton } from '../components/duel/DuelBuzzerButton';
import { DuelWaitingLobby } from '../components/duel/DuelWaitingLobby';
import CustomAlert from '../components/common/CustomAlert';
import KevIcon from '../components/common/KevIcon';

export default function DuelGameScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { duelId } = route.params;
  const { user } = useAuth();
  const { themeColors } = useTheme();

  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const currentUserId = user?._id || user?.id || '';
  const {
    duel,
    currentEnigma,
    scores,
    globalSecondsLeft,
    buzzerSecondsLeft,
    buzzerState,
    activeBuzzerUserName,
    isWaitingForOpponent,
    lobbySecondsLeft,
    lobbyTimeoutInfo,
    cancelLobbyWait,
    isMyBuzzer,
    isOpponentBuzzer,
    isGameOver,
    isOpponentDisconnected,
    disconnectSecondsLeft,
    forfeitInfo,
    forfeitGame,
    pressBuzzer,
    submitAnswer,
  } = useDuelArena(duelId, currentUserId);

  const challengerId = duel?.challenger?._id ? String(duel.challenger._id) : String(duel?.challenger || '');
  const isChallenger = String(currentUserId) === challengerId;
  const myScore = isChallenger ? scores.challenger : scores.opponent;
  const opponentScore = isChallenger ? scores.opponent : scores.challenger;
  const opponentUser = isChallenger ? duel?.opponent : duel?.challenger;

  const penaltyKevs = Math.max(1, Math.ceil((duel?.betAmount || 20) * 0.15));

  const handleBackPress = useCallback(() => {
    if (isGameOver) {
      navigation.replace('DuelLobby');
      return true;
    }
    if (isWaitingForOpponent) {
      cancelLobbyWait();
      navigation.replace('DuelLobby');
      return true;
    }
    setShowQuitConfirm(true);
    return true;
  }, [isGameOver, isWaitingForOpponent, cancelLobbyWait, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  const handleConfirmQuit = useCallback(() => {
    setShowQuitConfirm(false);
    forfeitGame();
    navigation.replace('DuelLobby');
  }, [forfeitGame, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {isWaitingForOpponent ? (
        <DuelWaitingLobby
          challengerName={user?.login || 'Vous'}
          challengerAvatar={user?.avatar}
          opponentName={opponentUser?.login || 'Adversaire'}
          opponentAvatar={opponentUser?.avatar}
          betAmount={duel?.betAmount || 25}
          secondsLeft={lobbySecondsLeft}
          onCancel={() => {
            cancelLobbyWait();
            navigation.replace('DuelLobby');
          }}
        />
      ) : (
        <>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleBackPress} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.timerBadge, { backgroundColor: themeColors.overlayLight, borderColor: globalSecondsLeft < 15 ? colors.error : colors.coral }]}>
              <Ionicons name="time-outline" size={16} color={globalSecondsLeft < 15 ? colors.error : colors.coral} />
              <Text style={[styles.timerText, { color: globalSecondsLeft < 15 ? colors.error : themeColors.text }]}>
                {`${globalSecondsLeft}s`}
              </Text>
            </View>

            <View style={styles.potTag}>
              <KevIcon size={14} />
              <Text style={[styles.potText, { color: '#FFB84D' }]}>{duel?.totalPot || 0}</Text>
            </View>
          </View>

          <View style={styles.statusBarContainer}>
            {isOpponentDisconnected ? (
              <View style={[styles.statusToast, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.error }]}>
                <ActivityIndicator size="small" color={colors.error} />
                <Text style={[styles.statusToastText, { color: colors.error }]}>
                  Adversaire déconnecté... Attente ({disconnectSecondsLeft}s)
                </Text>
              </View>
            ) : buzzerState === 'my_turn' ? (
              <View style={[styles.statusToast, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.mint }]}>
                <Ionicons name="hand-right" size={16} color={colors.mint} />
                <Text style={[styles.statusToastText, { color: colors.mint }]}>Vous avez la parole ! ({buzzerSecondsLeft}s)</Text>
              </View>
            ) : buzzerState === 'opponent_turn' ? (
              <View style={[styles.statusToast, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.error }]}>
                <Ionicons name="lock-closed" size={16} color={colors.error} />
                <Text style={[styles.statusToastText, { color: colors.error }]}>{activeBuzzerUserName || 'Adversaire'} répond... ({buzzerSecondsLeft}s)</Text>
              </View>
            ) : (
              <View style={[styles.statusToast, { backgroundColor: themeColors.overlayLight, borderColor: themeColors.border }]}>
                <Ionicons name="radio-outline" size={16} color={colors.coral} />
                <Text style={[styles.statusToastText, { color: themeColors.text }]}>Parole libre — Buzzez pour répondre !</Text>
              </View>
            )}
          </View>

          <View style={[styles.versusContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.playerBlock}>
              <Text style={[styles.playerName, { color: colors.coral }]} numberOfLines={1}>{user?.login}</Text>
              <Text style={[styles.playerScore, { color: themeColors.text }]}>{myScore} pts</Text>
            </View>
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.playerBlock}>
              <Text style={[styles.playerName, { color: themeColors.textSecondary }]} numberOfLines={1}>{opponentUser?.login || 'Adversaire'}</Text>
              <Text style={[styles.playerScore, { color: themeColors.text }]}>{opponentScore} pts</Text>
            </View>
          </View>

          <View style={[styles.enigmaCard, { backgroundColor: themeColors.card, borderColor: isMyBuzzer ? colors.coral : themeColors.border }]}>
            <Text style={[styles.enigmaLabel, { color: themeColors.textSecondary }]}>TROUVEZ LE MOT LIÉ</Text>
            <View style={styles.wordsRow}>
              <View style={[styles.wordBubble, { backgroundColor: themeColors.overlayLight }]}>
                <Text style={[styles.wordText, { color: themeColors.text }]}>{currentEnigma?.word1 || '...'}</Text>
              </View>
              <Text style={[styles.plusSign, { color: colors.coral }]}>+</Text>
              <View style={[styles.wordBubble, { backgroundColor: themeColors.overlayLight }]}>
                <Text style={[styles.wordText, { color: themeColors.text }]}>{currentEnigma?.word2 || '...'}</Text>
              </View>
            </View>
            {currentEnigma?.clue ? (
              <Text style={[styles.clueText, { color: themeColors.textSecondary }]}>Indice : {currentEnigma.clue}</Text>
            ) : null}
          </View>

          <View style={styles.propositionsContainer}>
            {currentEnigma?.propositions?.map((prop, idx) => (
              <TouchableOpacity
                key={idx}
                disabled={!isMyBuzzer}
                onPress={() => submitAnswer(prop)}
                style={[
                  styles.propButton,
                  {
                    backgroundColor: isMyBuzzer ? themeColors.card : themeColors.overlayLight,
                    borderColor: isMyBuzzer ? colors.coral : themeColors.border,
                    opacity: isMyBuzzer ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={[styles.propText, { color: isMyBuzzer ? colors.coral : themeColors.text }]}>{prop}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buzzerSection}>
            {isMyBuzzer ? (
              <View style={styles.buzzerActiveBox}>
                <Text style={[styles.buzzerCountText, { color: colors.mint }]}>À VOUS ! {buzzerSecondsLeft}s</Text>
                <Text style={[styles.buzzerSubtext, { color: themeColors.textSecondary }]}>Choisissez votre réponse ci-dessus</Text>
              </View>
            ) : isOpponentBuzzer ? (
              <View style={[styles.buzzerLockBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="lock-closed" size={24} color={colors.error} />
                <Text style={[styles.buzzerLockText, { color: colors.error }]}>{activeBuzzerUserName || 'Adversaire'} répond... ({buzzerSecondsLeft}s)</Text>
              </View>
            ) : (
              <DuelBuzzerButton onPress={pressBuzzer} />
            )}
          </View>
        </>
      )}

      {/* TIMEOUT OU ANNULATION LOBBY (REMBOURSEMENT TOTAL) */}
      <CustomAlert
        visible={Boolean(lobbyTimeoutInfo?.visible)}
        title="Session de duel"
        message={lobbyTimeoutInfo?.message || "La session de duel a pris fin. Vos Kevs sont intacts."}
        type="info"
        buttonText="Retour au Lobby"
        onClose={() => navigation.replace('DuelLobby')}
      />

      {/* CONFIRMATION D'ABANDON */}
      <CustomAlert
        visible={showQuitConfirm}
        title="Abandonner le duel ?"
        message={`En quittant la partie avant la fin, vous perdrez ${penaltyKevs} Kevs (15% de pénalité) reversés à votre adversaire.`}
        type="error"
        buttonText="Rester"
        confirmText="Abandonner"
        onConfirm={handleConfirmQuit}
        onClose={() => setShowQuitConfirm(false)}
      />

      {/* RÉSULTAT PAR ABANDON */}
      <CustomAlert
        visible={Boolean(forfeitInfo?.visible)}
        title={forfeitInfo?.isWinner ? 'Victoire par abandon !' : 'Partie terminée'}
        message={forfeitInfo?.message || ''}
        type={forfeitInfo?.isWinner ? 'success' : 'info'}
        buttonText="Retour au Lobby"
        onClose={() => navigation.replace('DuelLobby')}
      />

      <DuelResultModal
        visible={isGameOver && !forfeitInfo?.visible}
        duel={duel}
        currentUserId={currentUserId}
        onClose={() => navigation.replace('DuelLobby')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  closeBtn: { padding: spacing.xs },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.md, borderWidth: 1 },
  timerText: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
  potTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  potText: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
  statusBarContainer: { marginVertical: spacing.xs },
  statusToast: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: borderRadius.md, borderWidth: 1 },
  statusToastText: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
  versusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginVertical: spacing.xs },
  playerBlock: { alignItems: 'center', flex: 1 },
  playerName: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
  playerScore: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18, marginTop: 2 },
  vsBadge: { backgroundColor: 'rgba(255, 127, 80, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm },
  vsText: { fontFamily: 'Poppins_900Black', fontSize: 12, color: colors.coral },
  enigmaCard: { alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 2, marginVertical: spacing.xs },
  enigmaLabel: { fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 1, marginBottom: spacing.xs },
  wordsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.xs },
  wordBubble: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.sm },
  wordText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 17 },
  plusSign: { fontFamily: 'Poppins_900Black', fontSize: 18 },
  clueText: { fontFamily: 'Poppins_400Regular', fontSize: 12, textAlign: 'center', marginTop: 4 },
  propositionsContainer: { gap: 8, marginVertical: spacing.xs },
  propButton: { paddingVertical: 11, borderRadius: borderRadius.md, borderWidth: 1.5, alignItems: 'center' },
  propText: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
  buzzerSection: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: spacing.sm },
  buzzerActiveBox: { alignItems: 'center' },
  buzzerCountText: { fontFamily: 'Poppins_900Black', fontSize: 24 },
  buzzerSubtext: { fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 4 },
  buzzerLockBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 12, borderRadius: borderRadius.md },
  buzzerLockText: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
});
