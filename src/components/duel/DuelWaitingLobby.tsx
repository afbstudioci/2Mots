// src/components/duel/DuelWaitingLobby.tsx
// SALLE D'ATTENTE SYNCHRONISEE (LOBBY 60S) AVEC ANNULATION SANS FRAIS
// Clean Architecture / Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import KevIcon from '../common/KevIcon';

interface DuelWaitingLobbyProps {
  challengerName?: string;
  challengerAvatar?: string;
  opponentName?: string;
  opponentAvatar?: string;
  betAmount?: number;
  secondsLeft: number;
  onCancel: () => void;
}

export const DuelWaitingLobby: React.FC<DuelWaitingLobbyProps> = ({
  challengerName = 'Vous',
  challengerAvatar,
  opponentName = 'Adversaire',
  opponentAvatar,
  betAmount = 25,
  secondsLeft,
  onCancel,
}) => {
  const { themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>SALLE D'ATTENTE</Text>
          <View style={[styles.betBadge, { backgroundColor: themeColors.overlayLight }]}>
            <KevIcon size={14} />
            <Text style={[styles.betText, { color: colors.coral }]}>{betAmount} Kevs</Text>
          </View>
        </View>

        <View style={styles.versusBlock}>
          <View style={styles.playerColumn}>
            <View style={[styles.avatarWrapper, { borderColor: colors.coral }]}>
              {challengerAvatar ? (
                <Image source={{ uri: challengerAvatar }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={28} color={colors.coral} />
              )}
            </View>
            <Text style={[styles.playerName, { color: themeColors.text }]} numberOfLines={1}>
              {challengerName}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.mint }]} />
              <Text style={[styles.statusPillText, { color: colors.mint }]}>Prêt</Text>
            </View>
          </View>

          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.playerColumn}>
            <View style={[styles.avatarWrapper, { borderColor: themeColors.border }]}>
              {opponentAvatar ? (
                <Image source={{ uri: opponentAvatar }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person-outline" size={28} color={themeColors.textSecondary} />
              )}
            </View>
            <Text style={[styles.playerName, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {opponentName}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: 'rgba(255, 127, 80, 0.15)' }]}>
              <ActivityIndicator size="small" color={colors.coral} style={styles.spinner} />
              <Text style={[styles.statusPillText, { color: colors.coral }]}>Attente</Text>
            </View>
          </View>
        </View>

        <View style={[styles.timerContainer, { backgroundColor: themeColors.overlayLight, borderColor: colors.coral }]}>
          <Ionicons name="time-outline" size={20} color={colors.coral} />
          <Text style={[styles.timerNumber, { color: colors.coral }]}>{secondsLeft}s</Text>
          <Text style={[styles.timerLabel, { color: themeColors.textSecondary }]}>avant annulation auto</Text>
        </View>

        <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>
          Si votre adversaire ne rejoint pas la salle dans le délai imparti, le duel sera annulé automatiquement et votre mise vous sera intégralement restituée.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCancel}
          style={[styles.cancelButton, { borderColor: colors.coral }]}
        >
          <Ionicons name="close-circle-outline" size={18} color={colors.coral} />
          <Text style={[styles.cancelButtonText, { color: colors.coral }]}>
            Annuler le défi (Sans frais)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    letterSpacing: 1,
  },
  betBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  betText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  versusBlock: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  playerColumn: {
    alignItems: 'center',
    width: 90,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  playerName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  spinner: {
    transform: [{ scale: 0.7 }],
  },
  statusPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontFamily: 'Poppins_900Black',
    color: colors.white,
    fontSize: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 8,
    marginBottom: spacing.md,
  },
  timerNumber: {
    fontFamily: 'Poppins_900Black',
    fontSize: 18,
  },
  timerLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  hintText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    gap: 8,
    width: '100%',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
});
