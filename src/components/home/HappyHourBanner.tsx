// src/components/home/HappyHourBanner.tsx
// BANNIERE INDICATRICE DE L'HEURE MAGIQUE (X2 GAINS)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import { useHappyHour } from '../../hooks/useHappyHour';

export const HappyHourBanner: React.FC = () => {
  const { isHappyHour, multiplier } = useHappyHour();
  const { themeColors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isHappyHour) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [isHappyHour, pulseAnim]);

  if (!isHappyHour) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? themeColors.card : colors.sand,
          borderColor: colors.coral,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.coral }]}>
        <Ionicons name="flash" size={18} color={colors.white} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.coral }]}>
          HEURE MAGIQUE ACTIVE !
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.text }]}>
          Tous vos gains de Kevs et XP sont multipliés par {multiplier}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 1,
  },
});
