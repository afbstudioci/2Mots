//src/components/duel/DuelRulesModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/theme';
import { DUEL_RULES_STEPS, DUEL_RULES_SEEN_KEY } from './duelRulesData';

export { DUEL_RULES_SEEN_KEY };

interface DuelRulesModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const DuelRulesModal: React.FC<DuelRulesModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const { themeColors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const stepData = DUEL_RULES_STEPS[currentStep];
  const isLastStep = currentStep === DUEL_RULES_STEPS.length - 1;

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (currentStep < DUEL_RULES_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.setItem(DUEL_RULES_SEEN_KEY, 'true');
    } catch {}
    setCurrentStep(0);
    onComplete();
  };

  const handleDismiss = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.cardBorder,
              borderWidth: themeColors.cardBorderWidth,
            },
            shadows.soft(isDark),
          ]}
        >
          {/* Entête avec badge et bouton fermer */}
          <View style={styles.header}>
            <View style={[styles.stepBadge, { backgroundColor: themeColors.primary + '18' }]}>
              <Text style={[styles.stepBadgeText, { color: themeColors.primary }]}>
                {stepData.badge}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDismiss}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Icône principale et Titre */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '15' }]}>
              <Ionicons name={stepData.icon} size={36} color={colors.coral} />
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>{stepData.title}</Text>
            <Text style={[styles.description, { color: themeColors.textSecondary }]}>
              {stepData.description}
            </Text>
          </View>

          {/* Points clés de l'étape */}
          <View style={styles.pointsList}>
            {stepData.points.map((pt, idx) => (
              <View key={idx} style={styles.pointRow}>
                <View style={[styles.bulletPoint, { backgroundColor: themeColors.primary }]} />
                <View style={styles.pointTextContainer}>
                  <Text style={[styles.pointSubtitle, { color: themeColors.text }]}>
                    {pt.subtitle}
                  </Text>
                  <Text style={[styles.pointText, { color: themeColors.textSecondary }]}>
                    {pt.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Indicateur de pagination */}
          <View style={styles.dotsContainer}>
            {DUEL_RULES_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentStep ? themeColors.primary : themeColors.border,
                    width: i === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Actions de navigation */}
          <View style={styles.footer}>
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={handlePrev}
                style={[
                  styles.prevIconButton,
                  {
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.overlayLight,
                  },
                ]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={themeColors.text} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.nextButton,
                {
                  backgroundColor: themeColors.primary,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={styles.nextButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {isLastStep ? 'Commencer le duel' : 'Suivant'}
              </Text>
              <Ionicons
                name={isLastStep ? 'flash' : 'arrow-forward'}
                size={18}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepBadge: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  stepBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.buttonPrimary,
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    ...typography.bodySmall,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  pointsList: {
    marginVertical: spacing.md,
    gap: spacing.sm + 2,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  pointTextContainer: {
    flex: 1,
  },
  pointSubtitle: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  pointText: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 17,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: spacing.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  prevIconButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs + 2,
  },
  nextButtonText: {
    fontFamily: 'Poppins_700Bold',
    color: colors.white,
    fontSize: 14.5,
    letterSpacing: 0.3,
  },
});
