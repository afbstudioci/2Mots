//src/components/game/GameOverLimitModal.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, typography, borderRadius } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface GameOverLimitModalProps {
  visible: boolean;
  errorCount: number;
  onConfirm: () => void;
}

export default function GameOverLimitModal({
  visible,
  errorCount,
  onConfirm,
}: GameOverLimitModalProps) {
  const { themeColors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 45, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(badgePulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
    }
  }, [visible]);

  if (!visible) return null;

  const isConsecutive = errorCount === 3;
  const title = isConsecutive ? '3 ERREURS DE SUITE !' : '5 ERREURS CUMULÉES !';
  const subtitle = isConsecutive
    ? 'Ashhh ! Trois erreurs consécutives entraînent la fin de la partie.'
    : 'Ashhh ! Vous avez atteint le quota maximal de 5 erreurs.';

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onConfirm}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1C1517' : '#FFFFFF',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
            shadows.medium(isDark),
          ]}
        >
          <Animated.View
            style={[
              styles.badgeContainer,
              { transform: [{ scale: badgePulse }] },
            ]}
          >
            <View style={styles.badgeInner}>
              <Text style={styles.badgeNumber}>{errorCount}</Text>
            </View>
          </Animated.View>

          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>VOIR LE BILAN</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.error,
  },
  badgeInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    fontFamily: 'Poppins_900Black',
    fontSize: 34,
    color: '#FFFFFF',
    lineHeight: 38,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    width: '100%',
    height: 52,
    borderRadius: borderRadius.lg,
    ...shadows.soft(false),
  },
  actionBtnText: {
    ...typography.buttonPrimary,
    fontSize: 15,
    letterSpacing: 1,
  },
});