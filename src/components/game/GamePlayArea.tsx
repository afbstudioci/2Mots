//src/components/game/GamePlayArea.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface GamePlayAreaProps {
  currentPair: any;
}

export default function GamePlayArea({ currentPair }: GamePlayAreaProps) {
  const { themeColors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, { toValue: -2, duration: 1600, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 2, duration: 1600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: 2, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: -2, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim, floatAnim1, floatAnim2]);

  if (!currentPair) return null;

  const word1 = (currentPair.word1 || '').toUpperCase();
  const word2 = (currentPair.word2 || '').toUpperCase();

  return (
    <View style={styles.container}>
      {/* Badge Clé Mystère (si l'énigme porte une clé) */}
      {currentPair.hasKey && (
        <View style={styles.mysteryKeyPill}>
          <Ionicons name="key" size={11} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={styles.mysteryKeyText}>CLÉ MYSTÈRE</Text>
        </View>
      )}

      {/* Mot 1 : Carte Flottante Stylisée en Haut à Gauche */}
      <Animated.View
        style={[
          styles.wordCard,
          styles.cardLeft,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.cardBorder || 'rgba(255, 255, 255, 0.1)',
            transform: [{ translateY: floatAnim1 }],
          },
        ]}
      >
        <View style={styles.cardHeaderIndicator}>
          <View style={[styles.indicatorDot, { backgroundColor: colors.coral }]} />
          <Text style={[styles.cardTag, { color: themeColors.textSecondary }]}>MOT 1</Text>
        </View>
        <Text style={[styles.wordText, { color: themeColors.text }]} numberOfLines={1}>
          {word1}
        </Text>
      </Animated.View>

      {/* Connecteur Central avec Effet d'Association */}
      <View style={styles.connectorWrapper}>
        <View style={[styles.connectorLine, { backgroundColor: themeColors.border }]} />
        <Animated.View
          style={[
            styles.plusBadge,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </Animated.View>
        <View style={[styles.connectorLine, { backgroundColor: themeColors.border }]} />
      </View>

      {/* Mot 2 : Carte Flottante Stylisée en Bas à Droite */}
      <Animated.View
        style={[
          styles.wordCard,
          styles.cardRight,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.cardBorder || 'rgba(255, 255, 255, 0.1)',
            transform: [{ translateY: floatAnim2 }],
          },
        ]}
      >
        <View style={styles.cardHeaderIndicator}>
          <View style={[styles.indicatorDot, { backgroundColor: colors.mint }]} />
          <Text style={[styles.cardTag, { color: themeColors.textSecondary }]}>MOT 2</Text>
        </View>
        <Text style={[styles.wordText, { color: themeColors.text }]} numberOfLines={1}>
          {word2}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
  },
  wordCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.xl,
    minWidth: '58%',
    maxWidth: '82%',
    borderWidth: 1.5,
    ...shadows.soft(false),
  },
  cardLeft: {
    alignSelf: 'flex-start',
  },
  cardRight: {
    alignSelf: 'flex-end',
  },
  cardHeaderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  cardTag: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },
  wordText: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: 'Poppins_900Black',
    letterSpacing: 1.3,
  },
  mysteryKeyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  mysteryKeyText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  connectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  connectorLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  plusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    ...shadows.soft(true),
  },
});