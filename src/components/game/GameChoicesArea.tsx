//src/components/game/GameChoicesArea.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import KevIcon from '../common/KevIcon';

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

  const formatClueTypography = (text?: string | null) => {
    if (!text || text.trim().length === 0) return 'Quel point commun les relie ?';
    return text
      .replace(/\b([ldscnjm]|qu)\s+([aeiouyhéèêëàâîïôûù])/gi, "$1'$2")
      .replace(/(\w)'\s+(\w)/g, "$1'$2")
      .trim();
  };

  const displayQuestion = formatClueTypography(clue);

  return (
    <View style={styles.container}>
      {/* Bulle d'indice complète avec typographie française soignée */}
      <View style={[styles.questionCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Ionicons name="help-circle-outline" size={16} color={colors.coral} style={styles.questionIcon} />
        <Text style={[styles.questionText, { color: themeColors.text }]}>
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
          style={[styles.boosterBtn, { backgroundColor: isHintUsed ? 'rgba(255, 184, 77, 0.2)' : themeColors.surface, borderColor: isHintUsed ? '#FFB84D' : themeColors.border }]}
          onPress={onHintPress}
          activeOpacity={0.75}
          disabled={isChecking || isHintUsed}
        >
          <Ionicons name="bulb-outline" size={16} color={isHintUsed ? '#FFB84D' : colors.coral} />
          <Text style={[styles.boosterText, { color: isHintUsed ? '#FFB84D' : themeColors.text }]}>
            {isHintUsed ? '50/50' : '50/50'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boosterBtn, { backgroundColor: isTimeFrozen ? 'rgba(56, 189, 248, 0.2)' : themeColors.surface, borderColor: isTimeFrozen ? '#38BDF8' : themeColors.border }]}
          onPress={onTimeFreezePress}
          activeOpacity={0.75}
          disabled={isChecking || isTimeFrozen}
        >
          <Ionicons name="snow-outline" size={16} color="#38BDF8" />
          <Text style={[styles.boosterText, { color: '#38BDF8' }]}>
            {isTimeFrozen ? 'Gelé' : (timeFreezeCount > 0 ? `Gel (${timeFreezeCount})` : 'Gel')}
          </Text>
          {!isTimeFrozen && timeFreezeCount <= 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.boosterPriceText, { color: '#38BDF8' }]}>15</Text>
              <KevIcon size={11} style={{ marginLeft: 2 }} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boosterBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={onSuperCluePress}
          activeOpacity={0.75}
          disabled={isChecking || (eliminatedChoices && eliminatedChoices.length >= 2)}
        >
          <Ionicons name="flash-outline" size={16} color="#FBBF24" />
          <Text style={[styles.boosterText, { color: '#FBBF24' }]}>
            {superClueCount > 0 ? `Super (${superClueCount})` : 'Super'}
          </Text>
          {superClueCount <= 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.boosterPriceText, { color: '#FBBF24' }]}>25</Text>
              <KevIcon size={11} style={{ marginLeft: 2 }} />
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
    paddingBottom: spacing.sm,
    paddingTop: 2,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
    width: '100%',
  },
  questionIcon: { marginRight: 6 },
  questionText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    flexShrink: 1,
  },
  choicesList: { width: '100%', gap: 8 },
  choiceButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    ...shadows.soft(false),
  },
  choiceText: { fontSize: 15, fontFamily: 'Poppins_700Bold', letterSpacing: 0.8 },
  choiceIcon: { position: 'absolute', right: 16 },
  boostersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 8,
  },
  boosterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 38,
  },
  boosterText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  boosterPriceText: {
    fontSize: 11,
    fontFamily: 'Poppins_800ExtraBold',
  },
});