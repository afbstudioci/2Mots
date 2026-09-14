// src/components/game/DoubleKevsButton.tsx
// BOUTON DE DOUBLEMENT DES GAINS DE SESSION VIA ANNONCE RECOMPENSEE
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { useRewardedAd } from '../../hooks/useRewardedAd';
import KevIcon from '../common/KevIcon';
import api from '../../services/api';

interface DoubleKevsButtonProps {
  score: number;
  onClaimed?: (bonusKevs: number) => void;
}

export const DoubleKevsButton: React.FC<DoubleKevsButtonProps> = ({ score, onClaimed }) => {
  const { themeColors } = useTheme();
  const { isLoaded, showRewardedAd } = useRewardedAd();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (score <= 0) return null;

  // Calcul des Kevs remportés sur la partie (minimum 1 Kev par point résolu)
  const earnedKevs = Math.max(1, Math.floor(score / 2));

  const handleWatchAd = () => {
    if (isClaimed || isProcessing) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsProcessing(true);
    setErrorMessage(null);

    showRewardedAd(
      async () => {
        try {
          const res = await api.post('/ads/claim-double-kevs', { sessionKevs: earnedKevs });
          if (res.data?.status === 'success') {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setIsClaimed(true);
            if (onClaimed) onClaimed(earnedKevs);
          }
        } catch {
          setIsClaimed(true);
          if (onClaimed) onClaimed(earnedKevs);
        } finally {
          setIsProcessing(false);
        }
      },
      (error: any) => {
        setIsProcessing(false);
        setErrorMessage(error?.message || 'Vidéo indisponible. Réessayez.');
      }
    );
  };

  if (isClaimed) {
    return (
      <View style={[styles.claimedContainer, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.mint }]}>
        <Ionicons name="checkmark-circle" size={18} color={colors.mint} />
        <Text style={[styles.claimedText, { color: colors.mint }]}>
          Gains doublés ! (+{earnedKevs} Kevs)
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isProcessing}
        onPress={handleWatchAd}
        style={[styles.button, { backgroundColor: colors.mint }]}
      >
        {isProcessing ? (
          <ActivityIndicator color="#1A1A1A" size="small" />
        ) : (
          <View style={styles.content}>
            <Ionicons name="play-circle" size={20} color="#1A1A1A" />
            <Text style={styles.buttonText}>DOUBLER MES KEVS (+{earnedKevs}</Text>
            <KevIcon size={14} />
            <Text style={styles.buttonText}>)</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 13,
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  claimedContainer: {
    width: '100%',
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  claimedText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  errorText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
});
