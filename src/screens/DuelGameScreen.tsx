//src/screens/DuelGameScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useDuelArena } from '../hooks/useDuelArena';
import { DuelResultModal } from '../components/duel/DuelResultModal';
import KevIcon from '../components/common/KevIcon';

export default function DuelGameScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { duelId } = route.params;
  const { user } = useAuth();
  const { themeColors, isDark } = useTheme();

  const currentUserId = user?._id || user?.id || '';
  const {
    duel,
    currentEnigma,
    scores,
    globalSecondsLeft,
    buzzerSecondsLeft,
    isMyBuzzer,
    isOpponentBuzzer,
    isGameOver,
    isLoading,
    lastAnswerStatus,
    pressBuzzer,
    submitAnswer,
  } = useDuelArena(duelId, currentUserId);

  const isChallenger = String(currentUserId) === String(duel?.challenger?._id);
  const myScore = isChallenger ? scores.challenger : scores.opponent;
  const opponentScore = isChallenger ? scores.opponent : scores.challenger;
  const opponentUser = isChallenger ? duel?.opponent : duel?.challenger;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* HEADER TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={themeColors.textSecondary} />
        </TouchableOpacity>

        {/* CHRONOMÈTRE GLOBAL */}
        <View style={[styles.timerBadge, { backgroundColor: themeColors.overlayLight, borderColor: globalSecondsLeft < 15 ? colors.error : colors.coral }]}>
          <Ionicons name="time-outline" size={16} color={globalSecondsLeft < 15 ? colors.error : colors.coral} />
          <Text style={[styles.timerText, { color: globalSecondsLeft < 15 ? colors.error : themeColors.text }]}>
            {globalSecondsLeft}s
          </Text>
        </View>

        <View style={styles.potTag}>
          <KevIcon size={14} />
          <Text style={[styles.potText, { color: '#FFB84D' }]}>{duel?.totalPot || 0}</Text>
        </View>
      </View>

      {/* DUEL VERSUS BAR */}
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

      {/* ZONE ÉNIGME */}
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

      {/* PROPOSITIONS DE RÉPONSE */}
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

      {/* ZONE BUZZER & ÉTAT */}
      <View style={styles.buzzerSection}>
        {isMyBuzzer ? (
          <View style={styles.buzzerActiveBox}>
            <Text style={[styles.buzzerCountText, { color: colors.coral }]}>À VOUS ! {buzzerSecondsLeft}s</Text>
            <Text style={[styles.buzzerSubtext, { color: themeColors.textSecondary }]}>Sélectionnez vite une proposition ci-dessus</Text>
          </View>
        ) : isOpponentBuzzer ? (
          <View style={[styles.buzzerLockBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Ionicons name="lock-closed" size={24} color={colors.error} />
            <Text style={[styles.buzzerLockText, { color: colors.error }]}>L'adversaire répond... ({buzzerSecondsLeft}s)</Text>
          </View>
        ) : (
          <Pressable onPress={pressBuzzer} style={styles.buzzerButton}>
            <View style={[styles.buzzerInner, { backgroundColor: colors.coral }]}>
              <Ionicons name="flash" size={36} color="#FFFFFF" />
              <Text style={styles.buzzerText}>BUZZER</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* MODALE DE FIN DE DUEL */}
      <DuelResultModal
        visible={isGameOver}
        duel={duel}
        currentUserId={currentUserId}
        onClose={() => navigation.navigate('DuelLobby')}
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
  versusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginVertical: spacing.sm },
  playerBlock: { alignItems: 'center', flex: 1 },
  playerName: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
  playerScore: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18, marginTop: 2 },
  vsBadge: { backgroundColor: 'rgba(255, 127, 80, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm },
  vsText: { fontFamily: 'Poppins_900Black', fontSize: 12, color: colors.coral },
  enigmaCard: { alignItems: 'center', padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 2, marginVertical: spacing.sm },
  enigmaLabel: { fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 1, marginBottom: spacing.sm },
  wordsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.xs },
  wordBubble: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.sm },
  wordText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 17 },
  plusSign: { fontFamily: 'Poppins_900Black', fontSize: 18 },
  clueText: { fontFamily: 'Poppins_400Regular', fontSize: 12, textAlign: 'center', marginTop: 4 },
  propositionsContainer: { gap: 8, marginVertical: spacing.sm },
  propButton: { paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1.5, alignItems: 'center' },
  propText: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
  buzzerSection: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: spacing.md },
  buzzerButton: { width: 140, height: 140, borderRadius: 70, elevation: 12, shadowColor: colors.coral, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 15 },
  buzzerInner: { width: '100%', height: '100%', borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  buzzerText: { color: '#FFFFFF', fontFamily: 'Poppins_900Black', fontSize: 16, marginTop: 2 },
  buzzerActiveBox: { alignItems: 'center' },
  buzzerCountText: { fontFamily: 'Poppins_900Black', fontSize: 24 },
  buzzerSubtext: { fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 4 },
  buzzerLockBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 12, borderRadius: borderRadius.md },
  buzzerLockText: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
});
