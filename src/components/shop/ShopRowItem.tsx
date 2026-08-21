//src/components/shop/ShopRowItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, shadows, borderRadius, colors } from '../../theme/theme';
import KevIcon from '../common/KevIcon';

interface ShopRowItemProps {
  title: string;
  desc: string;
  priceKevs: number;
  icon: any;
  accentColor?: string;
  onPressItem?: () => void;
  onBuy: () => void;
}

const THEME_STYLES: Record<string, { bg: string; color: string }> = {
  flame: { bg: '#FFEDE5', color: '#F97316' },
  'hourglass-outline': { bg: '#E0F2FE', color: '#0284C7' },
  'bulb-outline': { bg: '#FEF3C7', color: '#D97706' },
  'refresh-circle-outline': { bg: '#D1FAE5', color: '#059669' },
  'gift-outline': { bg: '#EDE9FE', color: '#7C3AED' },
  'shield-checkmark-outline': { bg: '#FCE7F3', color: '#DB2777' },
};

export default function ShopRowItem({
  title,
  desc,
  priceKevs,
  icon,
  accentColor,
  onPressItem,
  onBuy,
}: ShopRowItemProps) {
  const { themeColors, isDark } = useTheme();
  const themeStyle = THEME_STYLES[icon] || {
    bg: isDark ? 'rgba(255, 107, 107, 0.2)' : '#FFEAE6',
    color: accentColor || colors.coral,
  };

  const finalColor = accentColor || themeStyle.color;
  const finalBg = isDark ? `${finalColor}25` : themeStyle.bg;

  return (
    <TouchableOpacity
      style={[
        styles.singleItemRow,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.cardBorder,
          borderWidth: themeColors.cardBorderWidth || 1,
        },
        shadows.soft(isDark),
      ]}
      onPress={onPressItem || onBuy}
      activeOpacity={0.88}
    >
      <View style={[styles.itemIconBox, { backgroundColor: finalBg }]}>
        <Ionicons name={icon} size={25} color={finalColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, { color: themeColors.text }]}>
          {title}
        </Text>
        <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {desc}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.kevsBuyBtn, { backgroundColor: finalColor }]}
        onPress={onBuy}
        activeOpacity={0.85}
      >
        <Text style={styles.kevsBuyBtnText}>{priceKevs}</Text>
        <KevIcon size={14} style={{ marginLeft: 5 }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  singleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: 12,
  },
  itemIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14.5,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 20,
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 17,
    marginTop: 2,
  },
  kevsBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    flexShrink: 0,
    minWidth: 70,
  },
  kevsBuyBtnText: {
    color: '#FFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 13.5,
  },
});