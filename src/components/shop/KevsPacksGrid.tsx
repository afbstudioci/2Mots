//src/components/shop/KevsPacksGrid.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, shadows } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface KevsPacksGridProps {
  packs: any[];
  onBuy: (pack: any) => void;
}

export default function KevsPacksGrid({ packs, onBuy }: KevsPacksGridProps) {
  const { themeColors } = useTheme();

  return (
    <View style={styles.packsGrid}>
      {packs?.map((pack) => (
        <View
          key={pack.id}
          style={[
            styles.packCard,
            { backgroundColor: themeColors.card, borderColor: pack.tag ? colors.coral : themeColors.border },
          ]}
        >
          {pack.tag && (
            <View style={[styles.tagBadge, { backgroundColor: colors.coral }]}>
              <Text style={styles.tagText}>{pack.tag}</Text>
            </View>
          )}
          <View style={[styles.packIconBox, { backgroundColor: colors.coral + '15' }]}>
            <Ionicons name={pack.icon} size={28} color={colors.coral} />
          </View>
          <Text style={[styles.packAmount, { color: themeColors.text }]}>{pack.amount} Kevs</Text>
          {pack.bonus > 0 && <Text style={styles.packBonus}>+{pack.bonus} Offerts</Text>}
          <TouchableOpacity
            style={[styles.packBuyBtn, { backgroundColor: colors.coral }]}
            onPress={() => onBuy(pack)}
          >
            <Text style={styles.packBuyBtnText}>{pack.priceEur}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  packsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  packCard: {
    width: (width - spacing.md * 2 - 16) / 3,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: spacing.sm,
    alignItems: 'center',
    position: 'relative',
    ...shadows.soft(false),
  },
  tagBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: { color: '#FFF', fontSize: 8, fontFamily: 'Poppins_900Black' },
  packIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  packAmount: { fontSize: 12, fontFamily: 'Poppins_700Bold', textAlign: 'center' },
  packBonus: { fontSize: 9, fontFamily: 'Poppins_700Bold', color: colors.coral, marginBottom: 4 },
  packBuyBtn: { width: '100%', paddingVertical: 6, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  packBuyBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 12 },
});