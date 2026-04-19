//src/components/game/WordCard.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface WordCardProps {
  word1: string;
  word2: string;
  expectedType: string;
}

const WordCard: React.FC<WordCardProps> = ({ word1, word2, expectedType }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(30);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 12,
        tension: 90,
        useNativeDriver: true,
      })
    ]).start();
  }, [word1, word2]); 

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.typeContainer}>
        <Text style={styles.typeText}>{expectedType}</Text>
      </View>
      <View style={styles.wordsContainer}>
        <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit>
          {word1.toUpperCase()}
        </Text>
        <View style={styles.separator} />
        <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit>
          {word2.toUpperCase()}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#242B3A', 
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    ...shadows.soft,
  },
  typeContainer: {
    backgroundColor: 'rgba(247, 245, 240, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  typeText: {
    ...typography.bodyMedium,
    color: colors.coral,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  word: {
    ...typography.titleLarge,
    color: colors.sand,
    flex: 1,
    textAlign: 'center',
  },
  separator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
    marginHorizontal: spacing.md,
  },
});

export default WordCard;