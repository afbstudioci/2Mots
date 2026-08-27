//src/components/duel/DuelButton.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
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
  userLevel,
}) => {
  const { themeColors, isDark } = useTheme();
  const [imageError, setImageError] = useState(false);

  if (userLevel < 5) return null;

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadows.soft(isDark),
      ]}
    >
      <View style={styles.leftContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: themeColors.overlayLight }]}>
          {!imageError ? (
            <Image
              source={require('../../../assets/duelicon.png')}
              style={styles.iconImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <Ionicons name="flash" size={20} color={colors.coral} />
          )}
        </View>

        <View style={styles.textWrapper}>
          <Text style={[styles.title, { color: themeColors.text }]}>ARÈNE DUEL 1v1</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Défiez des joueurs et gagnez leurs Kevs
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
    overflow: 'hidden',
  },
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
});
