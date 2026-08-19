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
  const vipPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(vipPulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(vipPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [vipPulseAnim]);

  return (
    <Animated.View
      style={[
        styles.vipCard,
        {
          backgroundColor: isDark ? '#261B0B' : '#FFF9E6',
          borderColor: '#FFD700',
          transform: [{ scale: vipPulseAnim }],
        },
      ]}
    >
      <View style={styles.vipHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="ribbon" size={24} color="#FFD700" style={{ marginRight: 8 }} />
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
            <Ionicons name="checkmark-circle" size={16} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={[styles.perkText, { color: themeColors.text }]}>{perk}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.vipButton, { backgroundColor: '#FFD700' }]}
        onPress={onBuy}
        activeOpacity={0.85}
      >
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
    borderWidth: 2,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium(false),
  },
  vipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  vipTitle: { fontSize: 17, fontFamily: 'Poppins_900Black', color: '#B38B00' },
  vipPriceBadge: { alignItems: 'flex-end' },
  vipPriceText: { fontSize: 17, fontFamily: 'Poppins_900Black', color: '#B38B00' },
  vipPeriodText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: '#B38B00' },
  vipPerksList: { marginBottom: spacing.md },
  perkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  perkText: { fontSize: 13, fontFamily: 'Poppins_500Medium' },
  vipButton: {
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  vipButtonText: { color: '#000', fontFamily: 'Poppins_900Black', fontSize: 14, letterSpacing: 0.5 },
});