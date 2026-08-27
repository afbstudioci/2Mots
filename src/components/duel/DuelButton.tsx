//src/components/duel/DuelButton.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

interface DuelButtonProps {
  onPress: () => void;
  pendingCount?: number;
  userLevel: number;
}

export const DuelButton: React.FC<DuelButtonProps> = ({
  onPress,
  pendingCount = 0,
  userLevel
}) => {
  const { themeColors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scalePressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (userLevel >= 5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [userLevel]);

  if (userLevel < 5) return null;

  const handlePressIn = () => {
    Animated.spring(scalePressAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Animated.spring(scalePressAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(pulseAnim, scalePressAnim) }],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: themeColors.card,
            borderColor: colors.coral,
          },
          shadows.soft(isDark),
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 127, 80, 0.15)' }]}>
          <Ionicons name="flash" size={20} color={colors.coral} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: themeColors.text }]}>ARÈNE DUEL 1v1</Text>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Défiez des joueurs et misez des Kevs
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.coral} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: spacing.xs,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
});
