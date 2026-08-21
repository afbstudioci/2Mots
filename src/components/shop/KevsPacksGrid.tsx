//src/components/shop/KevsPacksGrid.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, shadows, borderRadius } from '../../theme/theme';
import KevIcon from '../common/KevIcon';

interface KevsPacksGridProps {
  packs: any[];
  onPressPack?: (pack: any) => void;
  onBuy: (pack: any) => void;
}

export default function KevsPacksGrid({ packs, onPressPack, onBuy }: KevsPacksGridProps) {
  const { themeColors } = useTheme();

  return (
    <View style={styles.packsGrid}>
      {packs?.map((pack) => (
        <TouchableOpacity
          key={pack.id}
          style={[
            styles.packCard,
            { backgroundColor: themeColors.card, borderColor: pack.tag ? colors.coral : themeColors.cardBorder },
          ]}
          onPress={() => (onPressPack ? onPressPack(pack) : onBuy(pack))}
          activeOpacity={0.88}
        >
          {pack.tag && (
            <View style={[styles.tagBadge, { backgroundColor: colors.coral }]}>
              <Text style={styles.tagText}>{pack.tag}</Text>
            </View>
          )}
          <View style={[styles.packIconBox, { backgroundColor: colors.coral + '15' }]}>
            <KevIcon size={28} />
          </View>
          <Text style={[styles.packTitle, { color: themeColors.text }]} numberOfLines={1}>
            {pack.title}
          </Text>
          <Text style={[styles.packAmount, { color: colors.coral }]}>
            {pack.amount?.toLocaleString()}
          </Text>
          {pack.bonus > 0 ? (
            <Text style={styles.packBonus}>+{pack.bonus} OFFERTS</Text>
          ) : (
            <View style={{ height: 16 }} />
          )}
          <TouchableOpacity
            style={styles.priceBtn}
            onPress={() => onBuy(pack)}
            activeOpacity={0.85}
          >
            <Text style={styles.priceBtnText}>{pack.priceEur}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  packsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  packCard: {
    width: '31%',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.soft(false),
  },
  tagBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: 'Poppins_800ExtraBold',
    letterSpacing: 0.5,
  },
  packIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  packTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  packAmount: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
  },
  packBonus: {
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
    color: colors.mint,
    marginBottom: 4,
  },
  priceBtn: {
    backgroundColor: colors.coral,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  priceBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins_800ExtraBold',
  },
});