//src/components/game/GameHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import KevIcon from '../common/KevIcon';

interface GameHeaderProps {
  level: number;
  currentXp: number;
  xpNeeded: number;
  kevs?: number;
  kevyKeys?: number;
}

export default function GameHeader({ level, currentXp, xpNeeded, kevs = 0, kevyKeys = 0 }: GameHeaderProps) {
  const { themeColors } = useTheme();
  const navigation = useNavigation();

  const progress = xpNeeded > 0 ? (currentXp / xpNeeded) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Bouton Retour */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { backgroundColor: themeColors.overlayLight }]}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={24} color={themeColors.text} />
      </TouchableOpacity>

      <View
        style={[
          styles.statCard,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.cardBorder,
            borderWidth: themeColors.cardBorderWidth,
            shadowColor: themeColors.text,
          },
        ]}
      >
        {/* Section Niveau */}
        <View style={styles.levelRow}>
          <Text style={[styles.levelLabel, { color: themeColors.textSecondary }]}>NIVEAU</Text>
          <Text style={[styles.levelValue, { color: themeColors.text }]}>{level}</Text>
        </View>

        {/* Barre de Progression XP (Large et aérée) */}
        <View style={styles.xpWrapper}>
          <View style={styles.xpInfo}>
            <Text style={[styles.xpText, { color: themeColors.textSecondary }]}>Progression</Text>
            <Text style={[styles.xpText, { color: themeColors.text }]}>
              {currentXp}/{xpNeeded}
            </Text>
          </View>
          <View style={[styles.xpTrack, { backgroundColor: themeColors.overlayLight }]}>
            <View style={[styles.xpBar, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Colonne Droite : Clés Mystères AU-DESSUS des Kevs */}
        <View style={styles.rightColumn}>
          {kevyKeys >= 1 && (
            <View style={styles.keysBadge}>
              <Ionicons name="key" size={11} color="#F59E0B" style={{ marginRight: 3 }} />
              <Text style={styles.keysValue}>{`${kevyKeys}/3`}</Text>
            </View>
          )}

          <View style={styles.kevsBadge}>
            <KevIcon size={14} style={{ marginRight: 4 }} />
            <Text style={[styles.kevsValue, { color: themeColors.text }]}>{kevs}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 4,
    gap: spacing.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  levelRow: {
    alignItems: 'center',
    marginRight: spacing.sm,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.08)',
    minWidth: 50,
  },
  levelLabel: {
    ...typography.bodySmall,
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.8,
  },
  levelValue: {
    ...typography.titleLarge,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_900Black',
  },
  xpWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  xpText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
  },
  xpTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: colors.mint,
    borderRadius: 3,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    gap: 3,
  },
  keysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  keysValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#F59E0B',
  },
  kevsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 230, 217, 0.15)',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  kevsValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
});