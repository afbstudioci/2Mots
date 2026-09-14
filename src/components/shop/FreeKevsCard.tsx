// src/components/shop/FreeKevsCard.tsx
// CARTE BOUTIQUE "KEVS GRATUITS" AVEC RECOMPENSE PUBLICITAIRE ADMOB
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import { useRewardedAd } from '../../hooks/useRewardedAd';
import KevIcon from '../common/KevIcon';
import api from '../../services/api';

interface FreeKevsCardProps {
  onRewardClaimed: (newTotalKevs: number) => void;
}

interface AdStatus {
  canWatch: boolean;
  dailyRemaining: number;
  dailyLimit: number;
  rewardKevs: number;
  inCooldown: boolean;
  remainingCooldownSeconds: number;
}

export const FreeKevsCard: React.FC<FreeKevsCardProps> = ({ onRewardClaimed }) => {
  const { themeColors, isDark } = useTheme();
  const { isLoaded, showRewardedAd } = useRewardedAd();
  const [status, setStatus] = useState<AdStatus | null>(null);
  const [cooldownSec, setCooldownSec] = useState<number>(0);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/ads/shop-status');
      if (res.data?.status === 'success' && res.data?.data) {
        setStatus(res.data.data);
        setCooldownSec(res.data.data.remainingCooldownSeconds || 0);
      }
    } catch {
      // Mode dégradé
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (cooldownSec > 0) {
      timerRef.current = setInterval(() => {
        setCooldownSec((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            fetchStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldownSec, fetchStatus]);

  const handleWatchAd = () => {
    if (!status?.canWatch || cooldownSec > 0 || isClaiming) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsClaiming(true);
    setFeedbackMessage(null);

    showRewardedAd(
      async () => {
        try {
          const res = await api.post('/ads/claim-shop');
          if (res.data?.status === 'success' && res.data?.data) {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            onRewardClaimed(res.data.data.totalKevs);
            setFeedbackMessage('+25 Kevs crédités avec succès !');
            fetchStatus();
          }
        } catch (error: any) {
          setFeedbackMessage(error.response?.data?.message || 'Erreur lors de la réclamation.');
        } finally {
          setIsClaiming(false);
        }
      },
      (error: any) => {
        setIsClaiming(false);
        setFeedbackMessage(error?.message || 'La vidéo est indisponible. Réessayez.');
      }
    );
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!status) return null;

  const isCompleted = status.dailyRemaining <= 0;
  const isInCooldown = cooldownSec > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: isCompleted ? themeColors.border : colors.coral,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.coral }]}>
          <Ionicons name="play-circle" size={24} color={colors.white} />
        </View>
        <View style={styles.titleBox}>
          <Text style={[styles.title, { color: themeColors.text }]}>Kevs Gratuits</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Regardez une courte vidéo pour gagner +25 Kevs
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.badgeText, { color: colors.coral }]}>
            {status.dailyRemaining}/{status.dailyLimit} restants
          </Text>
        </View>
      </View>

      {feedbackMessage ? (
        <Text style={[styles.feedback, { color: colors.mint }]}>{feedbackMessage}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!status.canWatch || isInCooldown || isCompleted || isClaiming}
        onPress={handleWatchAd}
        style={[
          styles.actionButton,
          {
            backgroundColor:
              isInCooldown || isCompleted
                ? themeColors.surface
                : colors.coral,
            opacity: isClaiming ? 0.7 : 1,
          },
        ]}
      >
        {isClaiming ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : isInCooldown ? (
          <View style={styles.buttonContent}>
            <Ionicons name="time-outline" size={16} color={themeColors.textSecondary} />
            <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>
              Disponible dans {formatTimer(cooldownSec)}
            </Text>
          </View>
        ) : isCompleted ? (
          <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>
            Limite quotidienne atteinte (5/5)
          </Text>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Regarder la vidéo (+25
            </Text>
            <KevIcon size={16} />
            <Text style={[styles.buttonText, { color: colors.white }]}>)</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  titleBox: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
  feedback: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actionButton: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
});
