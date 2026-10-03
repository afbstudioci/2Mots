// src/components/shop/FreeKevsCard.tsx
// CARTE BOUTIQUE "KEVS GRATUITS" AVEC GESTION TEMPS REEL DU COOLDOWN ADMOB
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis, Typographie Francaise Soignee)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import { useRewardedAd } from '../../hooks/useRewardedAd';
import KevIcon from '../common/KevIcon';
import CustomAlert from '../common/CustomAlert';
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

const DEFAULT_STATUS: AdStatus = {
  canWatch: true,
  dailyRemaining: 5,
  dailyLimit: 5,
  rewardKevs: 25,
  inCooldown: false,
  remainingCooldownSeconds: 0,
};

export const FreeKevsCard: React.FC<FreeKevsCardProps> = ({ onRewardClaimed }) => {
  const { themeColors } = useTheme();
  const { showRewardedAd, reloadAd } = useRewardedAd();
  const [status, setStatus] = useState<AdStatus>(DEFAULT_STATUS);
  const [cooldownSec, setCooldownSec] = useState<number>(0);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success';
    buttonText?: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/ads/shop-status');
      if (res.data?.status === 'success' && res.data?.data && isMountedRef.current) {
        setStatus(res.data.data);
        setCooldownSec(res.data.data.remainingCooldownSeconds || 0);
      }
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { fetchStatus(); }, [fetchStatus]));

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') fetchStatus();
    });
    return () => sub.remove();
  }, [fetchStatus]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const interval = setInterval(() => {
      setCooldownSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          fetchStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSec > 0, fetchStatus]);

  const handleWatchAd = () => {
    if (!status.canWatch || cooldownSec > 0 || status.dailyRemaining <= 0 || isClaiming) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setIsClaiming(true);
    setSuccessMsg(null);

    showRewardedAd(
      async () => {
        try {
          const res = await api.post('/ads/claim-shop');
          if (res.data?.status === 'success' && res.data?.data) {
            const d = res.data.data;
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
            onRewardClaimed(d.totalKevs);
            setSuccessMsg('+25 Kevs crédités avec succès !');
            setTimeout(() => { if (isMountedRef.current) setSuccessMsg(null); }, 4000);

            const remainingSec = d.remainingCooldownSeconds || 600;
            const newRemaining = d.dailyRemaining !== undefined ? d.dailyRemaining : Math.max(0, status.dailyRemaining - 1);
            setStatus((p) => ({ ...p, canWatch: false, inCooldown: true, dailyRemaining: newRemaining, remainingCooldownSeconds: remainingSec }));
            setCooldownSec(remainingSec);
          }
        } catch (error: any) {
          setAlertConfig({
            visible: true,
            title: 'Erreur de réclamation',
            message: error.response?.data?.message || 'Impossible de créditer votre récompense pour le moment.',
            type: 'error',
            buttonText: 'Fermer',
          });
          fetchStatus();
        } finally {
          if (isMountedRef.current) setIsClaiming(false);
        }
      },
      () => {
        if (isMountedRef.current) setIsClaiming(false);
        reloadAd();
        setAlertConfig({
          visible: true,
          title: 'Vidéo indisponible',
          message: "La vidéo publicitaire n'a pas pu se charger à temps. Vérifiez votre connexion Internet et réessayez.",
          type: 'error',
          buttonText: 'Plus tard',
          confirmText: 'Réessayer',
          onConfirm: () => {
            setAlertConfig({ visible: false, title: '', message: '' });
            setTimeout(() => handleWatchAd(), 300);
          },
        });
      }
    );
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
  const isCompleted = status.dailyRemaining <= 0;
  const isInCooldown = cooldownSec > 0;

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: isCompleted ? themeColors.border : colors.coral }]}>
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

      {successMsg ? <Text style={[styles.feedback, { color: colors.mint }]}>{successMsg}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!status.canWatch || isInCooldown || isCompleted || isClaiming}
        onPress={handleWatchAd}
        style={[styles.actionButton, { backgroundColor: isInCooldown || isCompleted ? themeColors.surface : colors.coral, opacity: isClaiming ? 0.75 : 1 }]}
      >
        {isClaiming ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : isInCooldown ? (
          <View style={styles.buttonContent}>
            <Ionicons name="time-outline" size={16} color={themeColors.textSecondary} />
            <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>Disponible dans {formatTimer(cooldownSec)}</Text>
          </View>
        ) : isCompleted ? (
          <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>Limite quotidienne atteinte ({status.dailyLimit}/{status.dailyLimit})</Text>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: colors.white }]}>Regarder la vidéo (+25</Text>
            <KevIcon size={16} />
            <Text style={[styles.buttonText, { color: colors.white }]}>)</Text>
          </View>
        )}
      </TouchableOpacity>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig({ visible: false, title: '', message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.md, borderWidth: 1.5, padding: spacing.md, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm + 4 },
  iconBox: { width: 42, height: 42, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm + 4 },
  titleBox: { flex: 1 },
  title: { fontFamily: 'Poppins_800ExtraBold', fontSize: 14 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  badgeText: { fontFamily: 'Poppins_700Bold', fontSize: 10 },
  feedback: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, textAlign: 'center', marginBottom: spacing.sm },
  actionButton: { borderRadius: borderRadius.sm, paddingVertical: spacing.sm + 4, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  buttonText: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
});
