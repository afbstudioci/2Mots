//src/components/duel/DuelAcceptModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';

interface DuelAcceptModalProps {
  visible: boolean;
  opponentName: string;
  duelId: string;
  onStartNow: () => void;
}

export const DuelAcceptModal: React.FC<DuelAcceptModalProps> = ({
  visible,
  opponentName,
  duelId,
  onStartNow,
}) => {
  const { themeColors } = useTheme();
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!visible) {
      setCountdown(3);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onStartNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, onStartNow]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: colors.mint }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
            <Ionicons name="checkmark-circle" size={48} color={colors.mint} />
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>DÉFI ACCEPTÉ !</Text>
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>
            <Text style={{ color: colors.coral, fontFamily: 'Poppins_700Bold' }}>{opponentName}</Text> a relevé votre défi !
          </Text>

          <View style={styles.countdownBox}>
            <Text style={[styles.countdownNumber, { color: colors.coral }]}>{countdown}</Text>
            <Text style={[styles.countdownLabel, { color: themeColors.textSecondary }]}>
              Lancement automatique dans {countdown}s...
            </Text>
          </View>

          <TouchableOpacity onPress={onStartNow} style={[styles.startButton, { backgroundColor: colors.coral }]}>
            <Text style={styles.startButtonText}>COMMENCER MAINTENANT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
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
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  countdownBox: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  countdownNumber: {
    fontFamily: 'Poppins_900Black',
    fontSize: 40,
  },
  countdownLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginTop: 2,
  },
  startButton: {
    width: '100%',
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
