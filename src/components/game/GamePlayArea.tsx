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
        Animated.timing(floatAnim1, { toValue: -3, duration: 1600, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 3, duration: 1600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: 3, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: -3, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim, floatAnim1, floatAnim2]);

  if (!currentPair) return null;

  const word1 = (currentPair.word1 || '').toUpperCase();
  const word2 = (currentPair.word2 || '').toUpperCase();

  return (
    <View style={styles.container}>
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
          <Ionicons name="add" size={20} color="#FFFFFF" />
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
    paddingVertical: spacing.sm,
  },
  wordCard: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: borderRadius.xl,
    minWidth: '60%',
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
    letterSpacing: 1.2,
  },
  wordText: {
    fontSize: 22,
    fontFamily: 'Poppins_900Black',
    letterSpacing: 1.5,
  },
  connectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  connectorLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
  },
  plusBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    ...shadows.soft(true),
  },
});