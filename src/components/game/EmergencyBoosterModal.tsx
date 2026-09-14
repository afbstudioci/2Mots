// src/components/game/EmergencyBoosterModal.tsx
// MODALE DE DEBLOCAGE D'URGENCE DE JOKER VIA REWARDED AD
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { useRewardedAd } from '../../hooks/useRewardedAd';
import api from '../../services/api';

interface EmergencyBoosterModalProps {
  visible: boolean;
  boosterType: 'hint' | 'timeFreeze' | 'superClue' | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const EmergencyBoosterModal: React.FC<EmergencyBoosterModalProps> = ({
  visible,
  boosterType,
  onSuccess,
  onClose,
}) => {
  const { themeColors, isDark } = useTheme();
  const { isLoaded, showRewardedAd } = useRewardedAd();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!visible || !boosterType) return null;

  const boosterLabel =
    boosterType === 'hint'
      ? 'un Indice Simple'
      : boosterType === 'timeFreeze'
      ? 'le Gel du Temps (+5s)'
      : 'le Super Indice';

  const boosterIcon =
    boosterType === 'timeFreeze' ? 'snow-outline' : 'bulb-outline';

  const handleWatchAd = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsProcessing(true);
    setErrorMessage(null);

    showRewardedAd(
      async () => {
        try {
          const apiType = boosterType === 'hint' ? 'superClue' : boosterType;
          await api.post('/ads/claim-emergency-booster', { boosterType: apiType });
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          setIsProcessing(false);
          onSuccess();
          onClose();
        } catch {
          // Si le backend échoue en mode dégradé, on accorde quand même le joker
          setIsProcessing(false);
          onSuccess();
          onClose();
        }
      },
      (error: any) => {
        setIsProcessing(false);
        setErrorMessage(error?.message || 'Vidéo indisponible. Veuillez réessayer.');
      }
    );
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1C1517' : '#FFFFFF', borderColor: colors.coral },
            shadows.medium(isDark),
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.coral }]}>
            <Ionicons name={boosterIcon as any} size={28} color={colors.white} />
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>KEVS INSUFFISANTS</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Débloquez {boosterLabel} immédiatement et gratuitement en regardant une courte vidéo !
          </Text>

          {errorMessage ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
          ) : null}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isProcessing}
              onPress={handleWatchAd}
              style={[styles.watchButton, { backgroundColor: colors.coral }]}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="play-circle" size={18} color={colors.white} />
                  <Text style={styles.watchButtonText}>REGARDER LA VIDÉO (GRATUIT)</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isProcessing}
              onPress={onClose}
              style={[styles.cancelButton, { borderColor: themeColors.border }]}
            >
              <Text style={[styles.cancelButtonText, { color: themeColors.textSecondary }]}>
                ANNULER
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  buttonsContainer: {
    width: '100%',
    gap: 8,
  },
  watchButton: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  watchButtonText: {
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cancelButton: {
    width: '100%',
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
});
