//src/components/duel/DuelRulesModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/theme';

export const DUEL_RULES_SEEN_KEY = '@twomots_has_seen_duel_rules';

interface DuelRulesModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  {
    stepNumber: 1,
    badge: 'ÉTAPE 1 / 3',
    icon: 'trophy' as const,
    title: 'La Mise & Le Défi',
    description:
      'Défiez qui vous voulez en face-à-face et décidez de la mise en Kevs.',
    points: [
      {
        subtitle: 'Mise équitable',
        text: 'Les deux joueurs engagent la même somme de Kevs (ex: 30 Kevs chacun).',
      },
      {
        subtitle: 'Le vainqueur rafle tout',
        text: 'Le gagnant remporte la totalité des mises en jeu (60 Kevs) ainsi que +50 XP !',
      },
      {
        subtitle: 'Partage direct',
        text: 'Partagez le lien du duel sur WhatsApp, Telegram, SMS ou Facebook. S\'il a l\'application, il arrive droit dans l\'arène !',
      },
    ],
  },
  {
    stepNumber: 2,
    badge: 'ÉTAPE 2 / 3',
    icon: 'timer' as const,
    title: 'L\'Arène & Le Buzzer',
    description:
      'La partie se dispute en direct sur une série de 5 énigmes en 60 secondes chrono.',
    points: [
      {
        subtitle: 'Prenez la main au Buzzer',
        text: 'Dès que l\'énigme s\'affiche, appuyez sur le buzzer avant votre adversaire pour tenter votre chance.',
      },
      {
        subtitle: '3 secondes pour répondre',
        text: 'Une fois le buzzer verrouillé, vous avez exactement 3 secondes pour choisir la bonne réponse.',
      },
      {
        subtitle: '10 points par énigme',
        text: 'Chaque mot trouvé rapporte +10 points. Si le temps expire ou si vous ratez, la main redevient libre.',
      },
    ],
  },
  {
    stepNumber: 3,
    badge: 'ÉTAPE 3 / 3',
    icon: 'shield-checkmark' as const,
    title: 'Fair-Play & Pénalités',
    description:
      'Chaque duel doit se jouer dans le respect des règles et jusqu\'au terme du chrono.',
    points: [
      {
        subtitle: 'Pause de 15 secondes',
        text: 'En cas de déconnexion ou d\'appel imprévu, le duel est mis en pause avec 15 secondes de grâce.',
      },
      {
        subtitle: 'Sanction pour abandon',
        text: 'Si le joueur déconnecté ne revient pas dans les 15s, il est automatiquement déclaré forfait.',
      },
      {
        subtitle: 'Dédommagement du loyal',
        text: 'Le joueur resté fidèle conserve sa mise et empoche une pénalité de 15% prise sur la mise adverse (+20 XP) !',
      },
    ],
  },
];

export const DuelRulesModal: React.FC<DuelRulesModalProps> = ({ visible, onClose, onComplete }) => {
  const { themeColors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const stepData = STEPS[currentStep];

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (currentStep < STEPS.length - 1) {
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

  const isLastStep = currentStep === STEPS.length - 1;

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
            <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
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
            {STEPS.map((_, i) => (
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
            {currentStep > 0 ? (
              <TouchableOpacity
                onPress={handlePrev}
                style={[styles.prevButton, { borderColor: themeColors.border }]}
              >
                <Ionicons name="arrow-back" size={20} color={themeColors.text} />
                <Text style={[styles.prevButtonText, { color: themeColors.text }]}>Précédent</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySpacer} />
            )}

            <Pressable
              onPress={handleNext}
              style={[
                styles.nextButton,
                {
                  backgroundColor: isLastStep ? colors.mint : themeColors.primary,
                  flex: currentStep > 0 ? 1.4 : 2,
                },
              ]}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'COMMENCER LE DUEL' : 'Suivant'}
              </Text>
              <Ionicons
                name={isLastStep ? 'flash' : 'arrow-forward'}
                size={18}
                color={colors.white}
                style={{ marginLeft: 6 }}
              />
            </Pressable>
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
    width: 68,
    height: 68,
    borderRadius: 34,
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
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  prevButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  prevButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  emptySpacer: {
    flex: 0,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  nextButtonText: {
    ...typography.buttonPrimary,
    color: colors.white,
    fontSize: 14,
  },
});
