// src/components/duel/DuelHeaderTabs.tsx
// COMPOSANT D'ONGLETS DE L'ARENE DUEL AVEC INDICATEURS MAGENTA CLIGNOTANTS
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/theme';

interface DuelHeaderTabsProps {
  activeTab: 'opponents' | 'received' | 'sent';
  onSelectTab: (tab: 'opponents' | 'received' | 'sent') => void;
  receivedCount: number;
  sentCount: number;
  themeColors: any;
}

export const DuelHeaderTabs: React.FC<DuelHeaderTabsProps> = ({
  activeTab,
  onSelectTab,
  receivedCount,
  sentCount,
  themeColors,
}) => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (receivedCount > 0 || sentCount > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.35,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [receivedCount, sentCount, blinkAnim]);

  const tabs: { key: 'opponents' | 'received' | 'sent'; label: string; count?: number }[] = [
    { key: 'opponents', label: 'ADVERSAIRES' },
    { key: 'received', label: 'REÇUS', count: receivedCount },
    { key: 'sent', label: 'ATTENTES', count: sentCount },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tab.count ?? 0;
        const hasActiveCount = tab.count !== undefined && count > 0;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.75}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabButton, isActive && styles.activeTab]}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.coral : themeColors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>

              {tab.count !== undefined && (
                hasActiveCount ? (
                  <Animated.View
                    style={[
                      styles.magentaBadge,
                      { opacity: blinkAnim },
                    ]}
                  >
                    <Text style={styles.magentaBadgeText}>{count}</Text>
                  </Animated.View>
                ) : (
                  <Text
                    style={[
                      styles.neutralCountText,
                      { color: isActive ? colors.coral : themeColors.textSecondary },
                    ]}
                  >
                    ({count})
                  </Text>
                )
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: colors.coral,
    borderBottomWidth: 3,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  neutralCountText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },
  magentaBadge: {
    backgroundColor: colors.magenta,
    minWidth: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: colors.magenta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  magentaBadgeText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 14,
  },
});
