// src/components/game/GameOverEnigmasCarousel.tsx
// CARROUSEL HORIZONTAL DES CHOIX ET CORRECTIONS (GAME OVER)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface EnigmaItem {
  word1: string;
  word2: string;
  userAnswer?: string;
  expectedAnswer?: string;
  isCorrect?: boolean;
}

interface GameOverEnigmasCarouselProps {
  playedEnigmas: EnigmaItem[];
}

export const GameOverEnigmasCarousel: React.FC<GameOverEnigmasCarouselProps> = ({
  playedEnigmas,
}) => {
  const { themeColors, isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [carouselWidth, setCarouselWidth] = useState<number>(0);
  const horizontalScrollRef = useRef<ScrollView>(null);

  if (!playedEnigmas || playedEnigmas.length === 0) return null;

  // Découpage par lots de 5 propositions par page
  const chunkSize = 5;
  const pages: EnigmaItem[][] = [];
  for (let i = 0; i < playedEnigmas.length; i += chunkSize) {
    pages.push(playedEnigmas.slice(i, i + chunkSize));
  }
  const totalPages = Math.max(1, pages.length);

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
                {pageItems.map((item, itemIdx) => {
                  const isItemCorrect = Boolean(item.isCorrect);

                  return (
                    <View
                      key={itemIdx}
                      style={[
                        styles.enigmaRow,
                        itemIdx !== pageItems.length - 1 && styles.enigmaRowBorder,
                        {
                          borderBottomColor: isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.06)',
                        },
                      ]}
                    >
                      <View style={styles.enigmaHeader}>
                        <Text
                          style={[styles.enigmaPairText, { color: themeColors.text }]}
                          numberOfLines={1}
                        >
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
                        <Text
                          style={[styles.answerExpectedText, { color: colors.mint }]}
                          numberOfLines={1}
                        >
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
  );
};

const styles = StyleSheet.create({
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
});
