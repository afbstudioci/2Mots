//src/components/shop/VipCard.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../../theme/theme';

interface VipCardProps {
  vip: {
    id: string;
    title: string;
    priceEur: string;
    perks: string[];
  };
  isVip: boolean;
  onBuy: () => void;
}

export default function VipCard({ vip, isVip, onBuy }: VipCardProps) {
  const { themeColors, isDark } = useTheme();
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1800, useNativeDriver: false }),
      ])
    ).start();
  }, [glowAnim]);

  return (
    <Animated.View
      style={[
        styles.vipCard,
        {
          backgroundColor: isDark ? '#261B0B' : '#FFF9E6',
          borderColor: isDark ? '#F59E0B' : '#F59E0B',
          borderWidth: 2,
        },
        shadows.medium(isDark),
      ]}
    >
      <View style={styles.vipHeader}>
        <View style={styles.titleRow}>
          <View style={styles.crownIconBox}>
            <Ionicons name="ribbon" size={22} color="#D97706" />
          </View>
          <Text style={styles.vipTitle}>{vip.title}</Text>
        </View>
        <View style={styles.vipPriceBadge}>
          <Text style={styles.vipPriceText}>{vip.priceEur}</Text>
          <Text style={styles.vipPeriodText}>/mois</Text>
        </View>
      </View>

      <View style={styles.vipPerksList}>
        {vip.perks.map((perk: string, idx: number) => (
          <View key={idx} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={17} color="#D97706" style={{ marginRight: 8 }} />
            <Text style={[styles.perkText, { color: themeColors.text }]}>{perk}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.vipButton, { backgroundColor: '#F59E0B' }]}
        onPress={onBuy}
        activeOpacity={0.85}
      >
        <Ionicons name={isVip ? "shield-checkmark" : "ribbon"} size={18} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={styles.vipButtonText}>
          {isVip ? 'MEMBRE VIP ACTIF' : 'DEVENIR VIP (2,99 €)'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  vipCard: {
    borderRadius: 24,
    padding: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  vipTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  vipPriceBadge: {
    alignItems: 'flex-end',
  },
  vipPriceText: {
    fontSize: 18,
    fontFamily: 'Poppins_900Black',
    color: '#D97706',
  },
  vipPeriodText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#D97706',
    marginTop: -2,
  },
  vipPerksList: {
    marginBottom: spacing.md,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  perkText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
    lineHeight: 18,
  },
  vipButton: {
    height: 48,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  vipButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    letterSpacing: 1,
  },
});