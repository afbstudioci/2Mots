//src/components/shop/ShopRowItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, shadows } from '../../theme/theme';

interface ShopRowItemProps {
  title: string;
  desc: string;
  priceKevs: number;
  icon: any;
  accentColor: string;
  onBuy: () => void;
}

export default function ShopRowItem({
  title,
  desc,
  priceKevs,
  icon,
  accentColor,
  onBuy,
}: ShopRowItemProps) {
  const { themeColors } = useTheme();

  return (
    <View
      style={[
        styles.singleItemRow,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <View style={[styles.itemIconBox, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={icon} size={22} color={accentColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.itemTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]}>{desc}</Text>
      </View>
      <TouchableOpacity
        style={[styles.kevsBuyBtn, { backgroundColor: accentColor }]}
        onPress={onBuy}
      >
        <Text style={styles.kevsBuyBtnText}>{priceKevs}</Text>
        <Ionicons name="diamond" size={13} color="#FFF" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  singleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    ...shadows.soft(false),
  },
  itemIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontFamily: 'Poppins_700Bold' },
  itemDesc: { fontSize: 11, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  kevsBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  kevsBuyBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 13 },
});