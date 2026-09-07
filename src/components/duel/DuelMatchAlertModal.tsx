// src/components/duel/DuelMatchAlertModal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../navigation/navigationRef';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme/theme';
import KevIcon from '../common/KevIcon';

interface DuelAlertData {
  duelId: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar?: string;
  opponentLevel?: number;
  betAmount: number;
  expiresAt: number;
}

const ALERT_DURATION_SEC = 15;

export default function DuelMatchAlertModal() {
  const { subscribe, emit } = useSocketContext();
  const { user } = useAuth();
  const { themeColors } = useTheme();

  const [alertData, setAlertData] = useState<DuelAlertData | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(ALERT_DURATION_SEC);

  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef<any>(null);

  const handleDismiss = useCallback((accepted = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!accepted && alertData && user) {
      emit('duel_alert_response', {
        duelId: alertData.duelId,
        userId: user._id,
        accept: false,
      });
    }

    setAlertData(null);
    progressAnim.setValue(1);
  }, [alertData, user, emit, progressAnim]);

  useEffect(() => {
    const unsub = subscribe('duel_match_alert', (data: DuelAlertData) => {
      if (!data?.duelId) return;

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}

      setAlertData(data);
      setRemainingSec(ALERT_DURATION_SEC);
      progressAnim.setValue(1);

      Animated.timing(progressAnim, {
        toValue: 0,
        duration: ALERT_DURATION_SEC * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleDismiss(false);
            return 0;
          }
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          return prev - 1;
        });
      }, 1000);
    });

    return () => {
      unsub();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [subscribe, handleDismiss, progressAnim]);

  useEffect(() => {
    if (alertData) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [alertData, pulseAnim]);

  const handleAccept = () => {
    if (!alertData) return;
    const targetDuelId = alertData.duelId;
    handleDismiss(true);
    navigate('DuelGame', { duelId: targetDuelId });
  };

  const handleReject = () => {
    handleDismiss(false);
  };

  if (!alertData) return null;

  return (
    <Modal visible={true} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: colors.coral }]}>
          <View style={styles.headerBadge}>
            <Ionicons name="flash" size={18} color={colors.white} />
            <Text style={styles.headerBadgeText}>DÉFI EN DIRECT !</Text>
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>
            {alertData.opponentName}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            a accepté votre invitation !
          </Text>

          <Animated.View style={[styles.betContainer, { transform: [{ scale: pulseAnim }] }]}>
            <KevIcon size={28} />
            <Text style={styles.betText}>{alertData.betAmount} KEVS</Text>
          </Animated.View>

          <View style={styles.timerBlock}>
            <View style={styles.timerTrack}>
              <Animated.View
                style={[
                  styles.timerBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.timerCountdown, { color: themeColors.textSecondary }]}>
              Départ dans {remainingSec}s
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnAccept]}
              onPress={handleAccept}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={20} color={colors.white} />
              <Text style={styles.btnAcceptText}>REJOINDRE LE DUEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnReject, { borderColor: themeColors.border }]}
              onPress={handleReject}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnRejectText, { color: themeColors.textSecondary }]}>
                Refuser / Occupé
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    ...shadows.lg,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coral,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  headerBadgeText: {
    ...typography.buttonSmall,
    color: colors.white,
    fontFamily: 'Poppins_700Bold',
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Poppins_900Black',
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  betContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 127, 80, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  betText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: colors.coral,
    marginLeft: spacing.sm,
    letterSpacing: 1,
  },
  timerBlock: {
    width: '100%',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  timerTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    backgroundColor: colors.mint,
    borderRadius: 3,
  },
  timerCountdown: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  actions: {
    width: '100%',
    marginTop: spacing.sm,
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnAccept: {
    backgroundColor: colors.mint,
    marginBottom: spacing.sm,
  },
  btnAcceptText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 15,
    color: colors.white,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  btnReject: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  btnRejectText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
});
