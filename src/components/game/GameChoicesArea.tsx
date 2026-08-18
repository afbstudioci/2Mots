//src/components/game/GameChoicesArea.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface GameChoicesAreaProps {
  options: string[];
  selectedChoice: string | null;
  correctChoice: string | null;
  isCorrectState: boolean | null;
  onSelectChoice: (choice: string) => void;
  isChecking: boolean;
  expectedType?: string;
  clue?: string;
  eliminatedChoice: string | null;
  isHintUsed: boolean;
  onHintPress?: () => void;
}

export default function GameChoicesArea({
  options,
  selectedChoice,
  correctChoice,
  isCorrectState,
  onSelectChoice,
  isChecking,
  expectedType = 'nom',
  clue,
  eliminatedChoice,
  isHintUsed,
  onHintPress,
}: GameChoicesAreaProps) {
  const { themeColors } = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const clueFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCorrectState === false) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [isCorrectState, shakeAnim]);

  useEffect(() => {
    if (isHintUsed) {
      Animated.timing(clueFadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    } else {
      clueFadeAnim.setValue(0);
    }
  }, [isHintUsed, clueFadeAnim]);

  const formatGrammarType = (type: string) => {
    const lower = (type || 'nom').toLowerCase().trim();
    if (lower === 'verbe') return 'un verbe';
    if (lower === 'adjectif') return 'un adjectif';
    if (lower === 'expression') return 'une expression';
    return 'un nom';
  };

  const normalizeChoice = (text: string) =>
    (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  return (
    <View style={styles.container}>
      {/* Indication grammaticale homogene */}
      <View style={[styles.typeBadge, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.coral} style={styles.badgeIcon} />
        <Text style={[styles.typeText, { color: themeColors.textSecondary }]}>
          La solution est {formatGrammarType(expectedType)}
        </Text>
      </View>

      {/* Banniere Indice Logique Révélée */}
      {isHintUsed && clue ? (
        <Animated.View style={[styles.clueBanner, { opacity: clueFadeAnim, borderColor: '#FFB84D' }]}>
          <Ionicons name="bulb" size={18} color="#FFB84D" style={{ marginRight: 8 }} />
          <Text style={[styles.clueBannerText, { color: themeColors.text }]}>
            {clue}
          </Text>
        </Animated.View>
      ) : null}

      {/* 3 Choix Multiples */}
      <Animated.View style={[styles.choicesList, { transform: [{ translateX: shakeAnim }] }]}>
        {(options || []).map((option, index) => {
          const normOption = normalizeChoice(option);
          const normSelected = normalizeChoice(selectedChoice || '');
          const normCorrect = normalizeChoice(correctChoice || '');
          const isEliminated = eliminatedChoice && normalizeChoice(eliminatedChoice) === normOption;

          const isThisSelected = selectedChoice !== null && normOption === normSelected;
          const isThisCorrectAnswer = correctChoice !== null && normOption === normCorrect;

          let btnBgColor = themeColors.surface;
          let btnBorderColor = themeColors.border;
          let textColor = themeColors.text;
          let iconName: any = null;

          if (isThisSelected) {
            if (isCorrectState === true) {
              btnBgColor = colors.success;
              btnBorderColor = colors.success;
              textColor = '#FFFFFF';
              iconName = 'checkmark-circle';
            } else if (isCorrectState === false) {
              btnBgColor = colors.error;
              btnBorderColor = colors.error;
              textColor = '#FFFFFF';
              iconName = 'close-circle';
            }
          } else if (isCorrectState === false && isThisCorrectAnswer) {
            btnBgColor = colors.success;
            btnBorderColor = colors.success;
            textColor = '#FFFFFF';
            iconName = 'checkmark-circle';
          }

          if (isEliminated) {
            btnBgColor = 'rgba(128, 128, 128, 0.08)';
            btnBorderColor = 'rgba(128, 128, 128, 0.2)';
            textColor = themeColors.textSecondary;
          }

          return (
            <TouchableOpacity
              key={`${option}-${index}`}
              style={[
                styles.choiceButton,
                {
                  backgroundColor: btnBgColor,
                  borderColor: btnBorderColor,
                  opacity: isEliminated ? 0.4 : 1,
                },
              ]}
              activeOpacity={0.85}
              disabled={isChecking || selectedChoice !== null || Boolean(isEliminated)}
              onPress={() => onSelectChoice(option)}
            >
              <Text
                style={[
                  styles.choiceText,
                  {
                    color: textColor,
                    textDecorationLine: isEliminated ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={1}
              >
                {option.toUpperCase()}
              </Text>
              {iconName ? (
                <Ionicons name={iconName} size={22} color="#FFF" style={styles.choiceIcon} />
              ) : isEliminated ? (
                <Ionicons name="close-circle-outline" size={20} color={themeColors.textSecondary} style={styles.choiceIcon} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Bouton Indice Logique & 50/50 Payant */}
      <View style={styles.hintContainer}>
        <TouchableOpacity
          style={[
            styles.hintButton,
            {
              backgroundColor: isHintUsed ? 'rgba(255, 184, 77, 0.15)' : themeColors.surface,
              borderColor: isHintUsed ? '#FFB84D' : themeColors.border,
            },
          ]}
          onPress={onHintPress}
          activeOpacity={0.75}
          disabled={isChecking || isHintUsed}
        >
          <Ionicons name="bulb" size={18} color={isHintUsed ? '#FFB84D' : colors.coral} />
          <Text style={[styles.hintText, { color: isHintUsed ? '#FFB84D' : themeColors.text }]}>
            {isHintUsed ? '50/50 Activé' : '50/50 (-5 Kevs)'}
          </Text>
          {!isHintUsed && (
            <View style={styles.diamondBadge}>
              <Ionicons name="diamond" size={12} color="#81E6D9" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  badgeIcon: {
    marginRight: 6,
  },
  typeText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  clueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 184, 77, 0.12)',
    marginBottom: spacing.sm,
  },
  clueBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    fontStyle: 'italic',
  },
  choicesList: {
    width: '100%',
    gap: 10,
  },
  choiceButton: {
    height: 56,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    ...shadows.soft(false),
  },
  choiceText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },
  choiceIcon: {
    position: 'absolute',
    right: 18,
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 6,
  },
  diamondBadge: {
    marginLeft: 6,
  },
});