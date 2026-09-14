//src/screens/GameOverScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useAudio } from '../hooks/useAudio';
import { GameOverStatsCard } from '../components/game/GameOverStatsCard';
import { GameOverEnigmasCarousel } from '../components/game/GameOverEnigmasCarousel';
import { GameOverFooterActions } from '../components/game/GameOverFooterActions';
import { colors, spacing, borderRadius } from '../theme/theme';

export default function GameOverScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { themeColors } = useTheme();
  const { playGameOver, stopGameOver } = useAudio();
  const { refreshProfile } = useAuth();
  const { updateLeaderboard } = useData();

  const { score, reason, stats, enigmasSummary = [], corrections = [], details = [] } = route.params || {};
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const targetScore = typeof score === 'number' ? score : 0;
  const isScorePositive = targetScore > 0;

  const accuracy = stats?.accuracy ?? (details[0]?.accuracy ?? (targetScore > 0 ? 100 : 0));
  const correctCount = stats?.correctCount ?? (details[1]?.value ?? targetScore);
  const errorCount = stats?.errorCount ?? (details[2]?.value ?? corrections.length);

  const playedEnigmas = enigmasSummary.length > 0
    ? enigmasSummary
    : corrections.map((c: any) => ({
        word1: c.word1,
        word2: c.word2,
        userAnswer: 'Temps écoulé',
        expectedAnswer: c.expectedAnswer,
        isCorrect: false,
      }));

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshProfile();
      updateLeaderboard();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    playGameOver(isScorePositive);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (targetScore === 0) {
      setAnimatedScore(0);
      return;
    }

    const duration = 1000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeProgress * targetScore);
      setAnimatedScore(current);

      if (progress >= 1) {
        clearInterval(timer);
        setAnimatedScore(targetScore);
      }
    }, 16);

    return () => {
      clearInterval(timer);
      stopGameOver();
    };
  }, [targetScore, isScorePositive]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.scoreLabel, { color: themeColors.textSecondary }]}>SCORE FINAL</Text>
          <Text style={styles.scoreValue}>{animatedScore}</Text>

          {reason && (
            <View style={styles.reasonBadge}>
              <Text style={styles.reasonText}>{reason.toUpperCase()}</Text>
            </View>
          )}

          <GameOverStatsCard
            accuracy={accuracy}
            correctCount={correctCount}
            errorCount={errorCount}
          />

          <GameOverEnigmasCarousel playedEnigmas={playedEnigmas} />
        </ScrollView>

        <GameOverFooterActions
          score={targetScore}
          onDoubleClaimed={() => refreshProfile()}
          onReplay={() => navigation.replace('Game')}
          onHome={() => navigation.replace('Home')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontFamily: 'Poppins_900Black',
    color: colors.coral,
    fontSize: 64,
    lineHeight: 70,
    marginBottom: spacing.xs,
  },
  reasonBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: spacing.md,
  },
  reasonText: {
    color: colors.error,
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
});