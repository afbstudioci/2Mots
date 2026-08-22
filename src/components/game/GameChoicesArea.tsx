//src/components/game/GameChoicesArea.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface GameChoicesAreaProps {
  options: string[];
  selectedChoice: string | null;
  correctChoice: string | null;
  isCorrectState: boolean | null;
  isChecking: boolean;
  expectedType?: string;
  isHintUsed?: boolean;
  clue?: string | null;
  eliminatedChoices?: string[];
  timeFreezeCount?: number;
  superClueCount?: number;
  isTimeFrozen?: boolean;
  onSelectChoice: (choice: string) => void;
  onHintPress?: () => void;
  onTimeFreezePress?: () => void;
  onSuperCluePress?: () => void;
}

export default function GameChoicesArea({
  options,
  selectedChoice,
  correctChoice,
  isCorrectState,
  isChecking,
  isHintUsed = false,
  clue = null,
  eliminatedChoices = [],
  timeFreezeCount = 0,
  superClueCount = 0,
  isTimeFrozen = false,
  onSelectChoice,
  onHintPress,
  onTimeFreezePress,
  onSuperCluePress,
}: GameChoicesAreaProps) {
  const { themeColors } = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCorrectState === false) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [isCorrectState, shakeAnim]);

  const normalizeChoice = (text: string) =>
    (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const displayQuestion = clue && clue.trim().length > 0
    ? clue
    : 'Quel point commun les relie ?';

  return (
    <View style={styles.container}>
      {/* Bulle de question stimulante (Point Commun) */}
      <View style={[styles.questionCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Ionicons name="help-circle-outline" size={17} color={colors.coral} style={styles.questionIcon} />
        <Text style={[styles.questionText, { color: themeColors.text }]} numberOfLines={2}>
          {displayQuestion}
        </Text>
      </View>

      <Animated.View style={[styles.choicesList, { transform: [{ translateX: shakeAnim }] }]}>
        {(options || []).map((option, index) => {
          const normOption = normalizeChoice(option);
          const normSelected = normalizeChoice(selectedChoice || '');
          const normCorrect = normalizeChoice(correctChoice || '');
          const isEliminated = (eliminatedChoices || []).some((e) => normalizeChoice(e) === normOption);

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
                  opacity: isEliminated ? 0.35 : 1,
                },
              ]}
              activeOpacity={0.85}
              disabled={isChecking || selectedChoice !== null || isEliminated}
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

      {/* Barre des Jokers Tactiques */}
      <View style={styles.boostersRow}>
        <TouchableOpacity
          style={[
            styles.boosterBtn,
            {
              backgroundColor: isHintUsed ? 'rgba(255, 184, 77, 0.2)' : themeColors.surface,
              borderColor: isHintUsed ? '#FFB84D' : themeColors.border,
            },
          ]}
          onPress={onHintPress}
          activeOpacity={0.75}
          disabled={isChecking || isHintUsed}
        >
          <Ionicons name="bulb-outline" size={17} color={isHintUsed ? '#FFB84D' : colors.coral} />
          <Text style={[styles.boosterText, { color: isHintUsed ? '#FFB84D' : themeColors.text }]}>
            {isHintUsed ? '50/50 Actif' : '50/50'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boosterBtn,
            {
              backgroundColor: isTimeFrozen ? 'rgba(56, 189, 248, 0.2)' : themeColors.surface,
              borderColor: isTimeFrozen ? '#38BDF8' : themeColors.border,
            },
          ]}
          onPress={onTimeFreezePress}
          activeOpacity={0.75}
          disabled={isChecking || isTimeFrozen}
        >
          <Ionicons name="snow-outline" size={17} color="#38BDF8" />
          <Text style={[styles.boosterText, { color: '#38BDF8' }]}>
            {isTimeFrozen ? 'Gelé' : `Gel (${timeFreezeCount > 0 ? timeFreezeCount : '15 K'})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boosterBtn,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
          onPress={onSuperCluePress}
          activeOpacity={0.75}
          disabled={isChecking || (eliminatedChoices && eliminatedChoices.length >= 2)}
        >
          <Ionicons name="flash-outline" size={17} color="#FBBF24" />
          <Text style={[styles.boosterText, { color: '#FBBF24' }]}>
            {`Super (${superClueCount > 0 ? superClueCount : '25 K'})`}
          </Text>
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
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    maxWidth: '96%',
  },
  questionIcon: { marginRight: 8 },
  questionText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', textAlign: 'center' },
  choicesList: { width: '100%', gap: 10 },
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
  choiceText: { fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
  choiceIcon: { position: 'absolute', right: 18 },
  boostersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: spacing.md,
  },
  boosterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    minHeight: 44,
  },
  boosterText: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 4,
  },
});