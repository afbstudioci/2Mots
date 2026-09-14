//src/components/game/GameOverLimitModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows, spacing, borderRadius } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { useRewardedAd } from '../../hooks/useRewardedAd';
import KevIcon from '../common/KevIcon';
import api from '../../services/api';

interface GameOverLimitModalProps {
  visible: boolean;
  errorCount: number;
  secondChanceCount?: number;
  userKevs?: number;
  onConfirm: () => void;
  onUseSecondChance?: () => void;
}

export default function GameOverLimitModal({
  visible,
  errorCount,
  secondChanceCount = 0,
  userKevs = 0,
  onConfirm,
  onUseSecondChance,
}: GameOverLimitModalProps) {
  const { themeColors, isDark } = useTheme();
  const { showRewardedAd } = useRewardedAd();
  const [isClaimingAd, setIsClaimingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setAdError(null);
      setIsClaimingAd(false);
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

  const hasDirectAccess = secondChanceCount > 0 || userKevs >= 30;

  const handleWatchAdSecondChance = () => {
    if (isClaimingAd) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    setIsClaimingAd(true);
    setAdError(null);

    showRewardedAd(
      async () => {
        try {
          await api.post('/ads/claim-second-chance');
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          setIsClaimingAd(false);
          if (onUseSecondChance) onUseSecondChance();
        } catch {
          setIsClaimingAd(false);
          if (onUseSecondChance) onUseSecondChance();
        }
      },
      (error: any) => {
        setIsClaimingAd(false);
        setAdError(error?.message || 'Vidéo indisponible. Réessayez.');
      }
    );
  };

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
          <Animated.View style={[styles.badgeContainer, { transform: [{ scale: badgePulse }] }]}>
            <View style={styles.badgeInner}>
              <Text style={styles.badgeNumber}>{errorCount}</Text>
            </View>
          </Animated.View>

          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
          {adError && <Text style={[styles.adErrorText, { color: colors.error }]}>{adError}</Text>}

          <View style={styles.buttonsContainer}>
            {onUseSecondChance && (
              hasDirectAccess ? (
                <TouchableOpacity style={styles.secondChanceBtn} onPress={onUseSecondChance} activeOpacity={0.85}>
                  <Ionicons name="refresh-circle" size={20} color="#1A1A1A" style={{ marginRight: 6 }} />
                  <Text style={styles.secondChanceBtnText}>
                    {secondChanceCount > 0 ? `SECONDE CHANCE (${secondChanceCount} DISPO)` : 'SECONDE CHANCE (-30'}
                  </Text>
                  {secondChanceCount <= 0 && <KevIcon size={13} style={{ marginLeft: 4, marginRight: 2 }} />}
                  {secondChanceCount <= 0 && <Text style={styles.secondChanceBtnText}>)</Text>}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.secondChanceBtn, { backgroundColor: colors.coral }]}
                  onPress={handleWatchAdSecondChance}
                  activeOpacity={0.85}
                  disabled={isClaimingAd}
                >
                  {isClaimingAd ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="play-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.secondChanceBtnText, { color: '#FFFFFF' }]}>
                        SECONDE CHANCE (VIDÉO GRATUITE)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={styles.actionBtnText}>VOIR LE BILAN</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
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
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.error,
  },
  badgeInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    fontFamily: 'Poppins_900Black',
    fontSize: 30,
    color: '#FFFFFF',
    lineHeight: 34,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 19,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  adErrorText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  buttonsContainer: {
    width: '100%',
    gap: 8,
  },
  secondChanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
    width: '100%',
    height: 46,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
  },
  secondChanceBtnText: {
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1A1A1A',
    fontSize: 12.5,
    letterSpacing: 0.3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    width: '100%',
    height: 48,
    borderRadius: borderRadius.lg,
  },
  actionBtnText: {
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.8,
  },
});