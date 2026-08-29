//src/components/duel/DuelBetModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import KevIcon from '../common/KevIcon';
import { Opponent } from '../../services/duelApi';

interface DuelBetModalProps {
  visible: boolean;
  opponent: Opponent | null;
  userKevs: number;
  onClose: () => void;
  onConfirm: (betAmount: number) => void;
  isLoading?: boolean;
}

const QUICK_BETS = [25, 50, 100, 200, 500];

export const DuelBetModal: React.FC<DuelBetModalProps> = ({
  visible,
  opponent,
  userKevs,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { themeColors } = useTheme();
  const [betAmount, setBetAmount] = useState<number>(25);
  const [customInput, setCustomInput] = useState<string>('25');

  if (!opponent) return null;

  const handleSelectQuickBet = (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const safeAmount = Math.min(amount, userKevs);
    setBetAmount(safeAmount);
    setCustomInput(String(safeAmount));
  };

  const handleCustomChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomInput(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      setBetAmount(num);
    } else {
      setBetAmount(0);
    }
  };

  const handleMaxBet = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const maxAmount = Math.max(5, userKevs);
    setBetAmount(maxAmount);
    setCustomInput(String(maxAmount));
  };

  const handleConfirm = () => {
    if (isLoading || betAmount < 5 || betAmount > userKevs) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onConfirm(betAmount);
  };

  const canAfford = betAmount >= 5 && betAmount <= userKevs;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>DÉFIER EN DUEL</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.opponentText, { color: themeColors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
            Adversaire : <Text style={{ color: colors.coral, fontFamily: 'Poppins_700Bold' }}>{opponent.login}</Text> (Niveau {opponent.level})
          </Text>

          <View style={[styles.balanceBox, { backgroundColor: themeColors.overlayLight }]}>
            <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]}>Votre solde :</Text>
            <View style={styles.balanceValueRow}>
              <KevIcon size={18} />
              <Text style={[styles.balanceValue, { color: themeColors.text }]}>{userKevs} Kevs</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Saisir ou choisir la mise :</Text>

          <View style={[styles.inputRow, { backgroundColor: themeColors.overlayLight, borderColor: themeColors.border }]}>
            <KevIcon size={20} />
            <TextInput
              style={[styles.numericInput, { color: themeColors.text }]}
              value={customInput}
              onChangeText={handleCustomChange}
              keyboardType="number-pad"
              placeholder="Montant libre..."
              placeholderTextColor={themeColors.textSecondary}
              maxLength={7}
            />
            <TouchableOpacity onPress={handleMaxBet} style={styles.maxBadge}>
              <Text style={styles.maxBadgeText}>MAX</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.betOptionsGrid}>
            {QUICK_BETS.map((amount) => {
              const isSelected = betAmount === amount;
              const isAvailable = userKevs >= amount;
              return (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleSelectQuickBet(amount)}
                  disabled={!isAvailable || isLoading}
                  style={[
                    styles.betButton,
                    {
                      backgroundColor: isSelected ? colors.coral : themeColors.overlayLight,
                      borderColor: isSelected ? colors.coral : themeColors.border,
                      opacity: isAvailable ? 1 : 0.35,
                    },
                  ]}
                >
                  <Text style={[styles.betButtonText, { color: isSelected ? '#FFFFFF' : themeColors.text }]}>
                    {amount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rewardPreview}>
            <Ionicons name="trophy-outline" size={16} color="#FFB84D" />
            <Text style={[styles.rewardText, { color: themeColors.textSecondary }]}>
              Cagnotte à remporter : <Text style={{ color: '#FFB84D', fontFamily: 'Poppins_700Bold' }}>{betAmount * 2} Kevs</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!canAfford || isLoading}
            style={[
              styles.confirmButton,
              {
                backgroundColor: canAfford ? colors.coral : themeColors.border,
                opacity: isLoading ? 0.8 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {betAmount < 5 ? 'MINIMUM 5 KEVS' : canAfford ? 'LANCER LE DÉFI' : 'SOLDE INSUFFISANT'}
              </Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: spacing.xs,
  },
  opponentText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginBottom: spacing.md,
  },
  balanceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    gap: 8,
  },
  numericInput: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    paddingVertical: 4,
  },
  maxBadge: {
    backgroundColor: colors.coral,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  maxBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  betOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: spacing.md,
  },
  betButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  betButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  rewardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  rewardText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  confirmButton: {
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    letterSpacing: 1,
  },
});
