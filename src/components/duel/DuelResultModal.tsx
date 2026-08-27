//src/components/duel/DuelResultModal.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import KevIcon from '../common/KevIcon';
import { DuelSessionData } from '../../services/duelApi';

interface DuelResultModalProps {
  visible: boolean;
  duel: DuelSessionData | null;
  currentUserId: string;
  onClose: () => void;
  onRematch?: () => void;
}

export const DuelResultModal: React.FC<DuelResultModalProps> = ({
  visible,
  duel,
  currentUserId,
  onClose,
  onRematch,
}) => {
  const { themeColors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isWinner = duel?.winner?._id ? String(duel.winner._id) === String(currentUserId) : false;
  const isDraw = Boolean(duel?.isDraw);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      try {
        if (isWinner) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } catch {}
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible, isWinner]);

  if (!duel) return null;

  const myScore = String(currentUserId) === String(duel.challenger._id)
    ? duel.scores.challenger
    : duel.scores.opponent;
  const opponentScore = String(currentUserId) === String(duel.challenger._id)
    ? duel.scores.opponent
    : duel.scores.challenger;
  const opponentName = String(currentUserId) === String(duel.challenger._id)
    ? duel.opponent.login
    : duel.challenger.login;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: themeColors.card,
              borderColor: isWinner ? '#FFB84D' : (isDraw ? themeColors.border : colors.error),
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name={isWinner ? 'trophy' : isDraw ? 'git-compare' : 'close-circle'}
              size={48}
              color={isWinner ? '#FFB84D' : isDraw ? colors.coral : colors.error}
            />
          </View>

          <Text style={[styles.headline, { color: isWinner ? '#FFB84D' : isDraw ? colors.coral : colors.error }]}>
            {isWinner ? 'VICTOIRE ÉCLATANTE !' : isDraw ? 'MATCH NUL !' : 'DÉFAITE'}
          </Text>

          <Text style={[styles.subheadline, { color: themeColors.textSecondary }]}>
            {isWinner
              ? `Vous avez triomphé de ${opponentName} !`
              : isDraw
              ? 'Scores identiques, vos mises ont été remboursées.'
              : `${opponentName} remporte le duel cette fois-ci.`}
          </Text>

          {/* SCORES COMPARATIFS */}
          <View style={[styles.scoreBoard, { backgroundColor: themeColors.overlayLight }]}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scorePlayerLabel, { color: colors.coral }]}>VOUS</Text>
              <Text style={[styles.scoreValue, { color: themeColors.text }]}>{myScore} pts</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={[styles.scorePlayerLabel, { color: themeColors.textSecondary }]}>{opponentName}</Text>
              <Text style={[styles.scoreValue, { color: themeColors.text }]}>{opponentScore} pts</Text>
            </View>
          </View>

          {/* GAINS */}
          {isWinner && (
            <View style={styles.rewardBox}>
              <KevIcon size={24} />
              <Text style={[styles.rewardAmount, { color: '#FFB84D' }]}>
                +{duel.totalPot} Kevs
              </Text>
              <Text style={[styles.xpGain, { color: colors.mint }]}>+50 XP</Text>
            </View>
          )}

          {/* BOUTONS */}
          <View style={styles.buttonRow}>
            {onRematch && (
              <TouchableOpacity onPress={onRematch} style={[styles.actionBtn, { backgroundColor: colors.coral }]}>
                <Text style={styles.actionBtnText}>REVANCHE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: onRematch ? themeColors.overlayLight : colors.coral,
                  borderColor: themeColors.border,
                  borderWidth: onRematch ? 1 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  { color: onRematch ? themeColors.text : '#FFFFFF' },
                ]}
              >
                SALON DE DUEL
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: 'Poppins_900Black',
    fontSize: 22,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subheadline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scorePlayerLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 22,
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  rewardAmount: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
  },
  xpGain: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    marginLeft: 4,
  },
  buttonRow: {
    width: '100%',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
