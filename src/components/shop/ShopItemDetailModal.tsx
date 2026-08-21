//src/components/shop/ShopItemDetailModal.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import KevIcon from '../common/KevIcon';

interface ShopItemDetailModalProps {
  visible: boolean;
  item: {
    id: string;
    title: string;
    desc?: string;
    priceKevs?: number;
    priceEur?: string;
    amount?: number;
    bonus?: number;
    tag?: string;
    icon?: any;
    accentColor?: string;
    perks?: string[];
    category?: string;
  } | null;
  onClose: () => void;
  onBuy: (item: any) => void;
}

export default function ShopItemDetailModal({
  visible,
  item,
  onClose,
  onBuy,
}: ShopItemDetailModalProps) {
  const { themeColors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && item) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.75);
      opacityAnim.setValue(0);
    }
  }, [visible, item]);

  if (!visible || !item) return null;

  const accent = item.accentColor || (item.priceEur ? '#F59E0B' : colors.coral);
  const isKevsPack = Boolean(item.amount);
  const isVip = Boolean(item.perks);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: themeColors.card,
              borderColor: accent,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.iconBox, { backgroundColor: accent + '20' }]}>
            {isKevsPack ? (
              <KevIcon size={38} />
            ) : (
              <Ionicons name={item.icon || 'bag-handle'} size={36} color={accent} />
            )}
          </View>

          {item.tag && (
            <View style={[styles.tagBadge, { backgroundColor: accent }]}>
              <Text style={styles.tagBadgeText}>{item.tag}</Text>
            </View>
          )}

          <Text style={[styles.title, { color: themeColors.text }]}>{item.title}</Text>

          {isKevsPack ? (
            <View style={styles.packDetailsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.packMainAmount, { color: colors.coral }]}>
                  +{item.amount?.toLocaleString()}
                </Text>
                <KevIcon size={20} style={{ marginLeft: 6 }} />
              </View>
              {Boolean(item.bonus) && (
                <Text style={styles.packBonusAmount}>+ {item.bonus} Kevs Minéraux offerts !</Text>
              )}
            </View>
          ) : isVip ? (
            <View style={styles.perksContainer}>
              {item.perks?.map((perk: string, idx: number) => (
                <View key={idx} style={styles.perkRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#F59E0B" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[styles.perkText, { color: themeColors.text }]}>{perk}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.desc, { color: themeColors.textSecondary }]}>
              {item.desc || "Article exclusif 2Mots pour améliorer vos performances en partie."}
            </Text>
          )}

          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: themeColors.textSecondary }]}>PRIX TOTAL</Text>
            <View style={styles.priceValueRow}>
              {item.priceEur ? (
                <Text style={[styles.priceValueText, { color: accent }]}>{item.priceEur}</Text>
              ) : (
                <>
                  <Text style={[styles.priceValueText, { color: accent }]}>{item.priceKevs}</Text>
                  <KevIcon size={22} style={{ marginLeft: 6 }} />
                </>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: accent }]}
            onPress={() => {
              onClose();
              onBuy(item);
            }}
            activeOpacity={0.88}
          >
            <View style={styles.buyBtnContent}>
              {item.priceEur ? (
                <Text style={styles.buyBtnText}>{`COMMANDER (${item.priceEur})`}</Text>
              ) : (
                <>
                  <Text style={styles.buyBtnText}>{`OBTENIR (${item.priceKevs}`}</Text>
                  <KevIcon size={16} style={{ marginLeft: 4, marginRight: 2 }} />
                  <Text style={styles.buyBtnText}>{`)`}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  tagBadgeText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  desc: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  packDetailsBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  packMainAmount: {
    fontFamily: 'Poppins_900Black',
    fontSize: 22,
  },
  packBonusAmount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: colors.mint,
    marginTop: 2,
  },
  perksContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  perkText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    flex: 1,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  priceLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceValueText: {
    fontFamily: 'Poppins_900Black',
    fontSize: 24,
  },
  buyBtn: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buyBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    color: '#FFF',
    letterSpacing: 1,
  },
});