//src/screens/GameOverScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useAudio } from '../hooks/useAudio';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';

export default function GameOverScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { themeColors, isDark } = useTheme();
  const { playGameOver, stopGameOver } = useAudio();
  const { refreshProfile } = useAuth();
  const { updateLeaderboard } = useData();

  useEffect(() => {
    refreshProfile();
    updateLeaderboard();
  }, []);

  const { score, reason, stats, enigmasSummary = [], corrections = [], details = [] } = route.params || {};
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [carouselWidth, setCarouselWidth] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const horizontalScrollRef = useRef<ScrollView>(null);

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

  // Découpage par lots de 5 propositions par page
  const chunkSize = 5;
  const pages: any[][] = [];
  for (let i = 0; i < playedEnigmas.length; i += chunkSize) {
    pages.push(playedEnigmas.slice(i, i + chunkSize));
  }
  const totalPages = Math.max(1, pages.length);

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

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (carouselWidth <= 0) return;
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / carouselWidth);
    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && carouselWidth > 0) {
      const nextPage = currentPage + 1;
      horizontalScrollRef.current?.scrollTo({ x: nextPage * carouselWidth, animated: true });
      setCurrentPage(nextPage);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && carouselWidth > 0) {
      const prevPage = currentPage - 1;
      horizontalScrollRef.current?.scrollTo({ x: prevPage * carouselWidth, animated: true });
      setCurrentPage(prevPage);
    }
  };

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

          {/* STATS DU BILAN */}
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.cardBorder,
                borderWidth: themeColors.cardBorderWidth || 1,
              },
              shadows.soft(isDark),
            ]}
          >
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.coral }]}>{accuracy}%</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Précision</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.mint }]}>{correctCount}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Trouvés</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.error }]}>{errorCount}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Erreurs</Text>
            </View>
          </View>

          {/* CARROUSEL HORIZONTAL 5 PROPOSITIONS PAR SLIDE */}
          {playedEnigmas.length > 0 && (
            <View
              style={[
                styles.summaryWrapper,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.cardBorder,
                  borderWidth: themeColors.cardBorderWidth || 1,
                },
                shadows.soft(isDark),
              ]}
            >
              <View style={styles.summaryTitleRow}>
                <Text style={[styles.summaryTitle, { color: colors.coral }]}>
                  CHOIX EFFECTUÉS & CORRECTIONS
                </Text>
                {totalPages > 1 && (
                  <View style={styles.pageNavigationRow}>
                    {currentPage > 0 && (
                      <TouchableOpacity onPress={goToPrevPage} style={styles.arrowBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={17} color={colors.coral} />
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.pageIndicatorText, { color: themeColors.textSecondary }]}>
                      {currentPage + 1}/{totalPages}
                    </Text>
                    {currentPage < totalPages - 1 && (
                      <TouchableOpacity onPress={goToNextPage} style={styles.arrowBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-forward" size={17} color={colors.coral} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Zone dynamique mesurant la largeur exacte disponible */}
              <View
                style={styles.carouselContainer}
                onLayout={(e) => {
                  const measuredWidth = Math.round(e.nativeEvent.layout.width);
                  if (measuredWidth > 0 && measuredWidth !== carouselWidth) {
                    setCarouselWidth(measuredWidth);
                  }
                }}
              >
                {carouselWidth > 0 && (
                  <ScrollView
                    ref={horizontalScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    decelerationRate="fast"
                    snapToInterval={carouselWidth}
                    snapToAlignment="center"
                  >
                    {pages.map((pageItems, pageIdx) => (
                      <View key={pageIdx} style={[styles.pageSlide, { width: carouselWidth }]}>
                        {pageItems.map((item: any, itemIdx: number) => {
                          const isItemCorrect = Boolean(item.isCorrect);

                          return (
                            <View
                              key={itemIdx}
                              style={[
                                styles.enigmaRow,
                                itemIdx !== pageItems.length - 1 && styles.enigmaRowBorder,
                                { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                              ]}
                            >
                              <View style={styles.enigmaHeader}>
                                <Text style={[styles.enigmaPairText, { color: themeColors.text }]} numberOfLines={1}>
                                  {item.word1?.toUpperCase()} + {item.word2?.toUpperCase()}
                                </Text>
                                <Ionicons
                                  name={isItemCorrect ? 'checkmark-circle' : 'close-circle'}
                                  size={22}
                                  color={isItemCorrect ? colors.mint : colors.error}
                                  style={{ marginLeft: 6 }}
                                />
                              </View>

                              <View style={styles.answersBlock}>
                                <Text
                                  style={[
                                    styles.answerChoiceText,
                                    { color: isItemCorrect ? colors.mint : colors.error },
                                  ]}
                                  numberOfLines={1}
                                >
                                  Votre choix : {item.userAnswer?.toUpperCase() || 'TEMPS ÉCOULÉ'}
                                </Text>
                                <Text style={[styles.answerExpectedText, { color: colors.mint }]} numberOfLines={1}>
                                  Solution : {item.expectedAnswer?.toUpperCase()}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.replayButton}
            activeOpacity={0.85}
            onPress={() => navigation.replace('Game')}
          >
            <Text style={styles.replayText}>REJOUER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.7}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={[styles.homeText, { color: themeColors.textSecondary }]}>RETOUR À L'ACCUEIL</Text>
          </TouchableOpacity>
        </View>
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
  statsCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Poppins_900Black',
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  summaryWrapper: {
    width: '100%',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.8,
    flex: 1,
  },
  pageNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    marginHorizontal: 2,
  },
  carouselContainer: {
    width: '100%',
  },
  pageSlide: {
    paddingHorizontal: 2,
  },
  enigmaRow: {
    paddingVertical: 8,
  },
  enigmaRowBorder: {
    borderBottomWidth: 1,
  },
  enigmaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  enigmaPairText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13.5,
    letterSpacing: 0.3,
    flex: 1,
  },
  answersBlock: {
    gap: 1,
  },
  answerChoiceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  answerExpectedText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  footer: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  replayButton: {
    backgroundColor: colors.coral,
    height: 48,
    borderRadius: borderRadius.xl,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  replayText: {
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FFF',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  homeButton: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
});