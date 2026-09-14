// src/components/game/GameOverStatsCard.tsx
// CARTE DES STATISTIQUES DE SESSION (GAME OVER)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface GameOverStatsCardProps {
  accuracy: number;
  correctCount: number;
  errorCount: number;
}

export const GameOverStatsCard: React.FC<GameOverStatsCardProps> = ({
  accuracy,
  correctCount,
  errorCount,
}) => {
  const { themeColors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.statsCard,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.cardBorder,
          borderWidth: themeColors.cardBorderWidth || 1,
        },
        shadows.soft(isDark),
      ]}
    >
      <View style={styles.statBox}>
        <Text style={[styles.statNumber, { color: colors.coral }]}>{accuracy}%</Text>
        <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Précision</Text>
      </View>

      <View
        style={[
          styles.statDivider,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
        ]}
      />

      <View style={styles.statBox}>
        <Text style={[styles.statNumber, { color: colors.mint }]}>{correctCount}</Text>
        <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Trouvés</Text>
      </View>

      <View
        style={[
          styles.statDivider,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
        ]}
      />

      <View style={styles.statBox}>
        <Text style={[styles.statNumber, { color: colors.error }]}>{errorCount}</Text>
        <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Erreurs</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Poppins_900Black',
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
});
