// src/components/home/HomeStatsCards.tsx
// CARTES DES STATISTIQUES ET SOLDES ACTUALISABLES (ACCUEIL)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../../theme/theme';
import KevIcon from '../common/KevIcon';

interface HomeStatsCardsProps {
  bestScore: number;
  kevs: number;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  spin: Animated.AnimatedInterpolation<string | number>;
  kevsBounceAnim: Animated.Value;
  onRefreshRecord: () => void;
  onRefreshKevs: () => void;
}

export const HomeStatsCards: React.FC<HomeStatsCardsProps> = ({
  bestScore,
  kevs,
  fadeAnim,
  slideAnim,
  spin,
  kevsBounceAnim,
  onRefreshRecord,
  onRefreshKevs,
}) => {
  const { themeColors, isDark } = useTheme();

  return (
    <Animated.View
      style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      {/* CARTE RECORD ACTUALISABLE */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onRefreshRecord}
        style={[
          styles.statCard,
          { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 },
          shadows.soft(isDark),
        ]}
      >
        <Animated.View
          style={[
            styles.statIconContainer,
            { backgroundColor: 'rgba(255, 184, 77, 0.15)', transform: [{ rotate: spin }] },
          ]}
        >
          <Ionicons name="trophy" size={20} color="#FFB84D" />
        </Animated.View>
        <View>
          <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>RECORD</Text>
          <Text style={[styles.statValueText, { color: themeColors.text }]}>{bestScore || 0}</Text>
        </View>
      </TouchableOpacity>

      {/* CARTE KEVS ACTUALISABLE */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onRefreshKevs}
        style={[
          styles.statCard,
          { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 },
          shadows.soft(isDark),
        ]}
      >
        <Animated.View
          style={[
            styles.statIconContainer,
            { backgroundColor: 'rgba(129, 230, 217, 0.15)', transform: [{ scale: kevsBounceAnim }] },
          ]}
        >
          <KevIcon size={20} />
        </Animated.View>
        <View>
          <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>KEVS</Text>
          <Text style={[styles.statValueText, { color: themeColors.text }]}>{kevs || 0}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    width: '100%',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    maxWidth: 160,
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statLabelText: { fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 1, marginBottom: -2 },
  statValueText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 17 },
});
