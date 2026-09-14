// src/components/game/GameOverFooterActions.tsx
// ACTIONS DE PIED DE PAGE : DOUBLE KEVS ADMOB, REJOUER, ACCUEIL (GAME OVER)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { DoubleKevsButton } from './DoubleKevsButton';

interface GameOverFooterActionsProps {
  score: number;
  onDoubleClaimed: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const GameOverFooterActions: React.FC<GameOverFooterActionsProps> = ({
  score,
  onDoubleClaimed,
  onReplay,
  onHome,
}) => {
  const { themeColors } = useTheme();

  return (
    <View style={styles.footer}>
      <DoubleKevsButton score={score} onClaimed={onDoubleClaimed} />

      <TouchableOpacity
        style={styles.replayButton}
        activeOpacity={0.85}
        onPress={onReplay}
      >
        <Text style={styles.replayText}>REJOUER</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        activeOpacity={0.7}
        onPress={onHome}
      >
        <Text style={[styles.homeText, { color: themeColors.textSecondary }]}>
          RETOUR À L'ACCUEIL
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  replayButton: {
    backgroundColor: colors.coral,
    height: 48,
    borderRadius: borderRadius.xl,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  replayText: {
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FFF',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  homeButton: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
});
