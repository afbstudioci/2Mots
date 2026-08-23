//src/components/game/KevyChestModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export interface ChestReward {
  id: string;
  type: 'kevs' | 'freeze' | 'hint' | 'shield' | 'xp' | 'empty';
  title: string;
  amount?: number;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  subtext?: string;
}

const POSSIBLE_REWARDS: ChestReward[] = [
  { id: 'k30', type: 'kevs', title: '+30 Kevs', amount: 30, iconName: 'diamond', iconColor: colors.coral },
  { id: 'k50', type: 'kevs', title: '+50 Kevs', amount: 50, iconName: 'diamond', iconColor: '#F59E0B' },
  { id: 'k15', type: 'kevs', title: '+15 Kevs', amount: 15, iconName: 'diamond', iconColor: colors.coral },
  { id: 'frz', type: 'freeze', title: '+1 Gel Temporel', iconName: 'snow', iconColor: '#38BDF8' },
  { id: 'hnt', type: 'hint', title: '+1 Indice 50/50', iconName: 'bulb', iconColor: '#FBBF24' },
  { id: 'shd', type: 'shield', title: '+1 Seconde Chance', iconName: 'shield-checkmark', iconColor: colors.mint },
  { id: 'dxp', type: 'xp', title: 'Double XP (2 parties)', iconName: 'flash', iconColor: '#A855F7' },
  { id: 'emp', type: 'empty', title: 'Oups, vous avez un mauvais doigt !', subtext: 'Pas grave, réessayez encore !', iconName: 'help-circle-outline', iconColor: colors.coral }
];

interface KevyChestModalProps {
  visible: boolean;
  onClose: (gains: { kevs: number; freeze: number; hint: number; shield: number }) => void;
}

export default function KevyChestModal({ visible, onClose }: KevyChestModalProps) {
  const { themeColors } = useTheme();
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Start, 1..3: Draws, 4: Summary
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<ChestReward[]>([]);
  const [activeReward, setActiveReward] = useState<ChestReward | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rewardPopAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setIsOpen(false);
      setHistory([]);
      setActiveReward(null);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }
  }, [visible]);

  const handleOpenDraw = () => {
    if (currentStep >= 3) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setIsOpen(true);

    const randomPick = POSSIBLE_REWARDS[Math.floor(Math.random() * POSSIBLE_REWARDS.length)];
    setActiveReward(randomPick);
    setHistory(prev => [...prev, randomPick]);

    rewardPopAnim.setValue(0);
    Animated.spring(rewardPopAnim, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}

    if (nextStep < 3) {
      setTimeout(() => {
        setIsOpen(false);
        setActiveReward(null);
      }, 1500);
    } else {
      setTimeout(() => {
        setCurrentStep(4);
      }, 1800);
    }
  };

  const handleFinish = () => {
    let totalKevs = 0, totalFreeze = 0, totalHint = 0, totalShield = 0;
    history.forEach(r => {
      if (r.type === 'kevs' && r.amount) totalKevs += r.amount;
      if (r.type === 'freeze') totalFreeze += 1;
      if (r.type === 'hint') totalHint += 1;
      if (r.type === 'shield') totalShield += 1;
    });
    onClose({ kevs: totalKevs, freeze: totalFreeze, hint: totalHint, shield: totalShield });
  };

  const attemptsLeft = 3 - currentStep;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {currentStep < 4 ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.badgeText, { color: colors.coral }]}>KEVY-COFFRE</Text>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {currentStep === 0 ? 'Félicitations, vous avez obtenu les 3 clés !' : `Tirage ${currentStep} sur 3`}
              </Text>

              <View style={styles.chestWrapper}>
                <Svg width={110} height={95} viewBox="0 0 100 85">
                  <Defs>
                    <LinearGradient id="chestGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#F59E0B" />
                      <Stop offset="1" stopColor="#B45309" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="10" y="32" width="80" height="48" rx="8" fill="url(#chestGrad)" stroke="#78350F" strokeWidth="3" />
                  <Path d={isOpen ? "M 5 30 C 5 10, 95 10, 95 30 L 85 20 C 85 5, 15 5, 15 20 Z" : "M 10 32 C 10 12, 90 12, 90 32 Z"} fill="#FBBF24" stroke="#78350F" strokeWidth="3" />
                  <Rect x="44" y="44" width="12" height="16" rx="3" fill="#1E293B" />
                  <Path d="M 50 49 L 50 55" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </View>

              {activeReward && (
                <Animated.View style={[styles.rewardBox, { backgroundColor: themeColors.overlayLight, transform: [{ scale: rewardPopAnim }] }]}>
                  <Ionicons name={activeReward.iconName} size={28} color={activeReward.iconColor} />
                  <Text style={[styles.rewardTitle, { color: themeColors.text }]}>{activeReward.title}</Text>
                  {activeReward.subtext && <Text style={[styles.rewardSubtext, { color: themeColors.textSecondary }]}>{activeReward.subtext}</Text>}
                </Animated.View>
              )}

              <TouchableOpacity style={[styles.mainButton, { backgroundColor: colors.coral }]} onPress={handleOpenDraw} activeOpacity={0.85} disabled={isOpen && currentStep < 3}>
                <Ionicons name="gift-outline" size={20} color={colors.white} style={styles.buttonIcon} />
                <Text style={styles.mainButtonText}>{`Ouvrir (${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''})`}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Ionicons name="trophy" size={38} color={colors.coral} />
              <Text style={[styles.summaryTitle, { color: themeColors.text }]}>BILAN DES GAINS</Text>
              <Text style={[styles.summarySub, { color: themeColors.textSecondary }]}>Voici les trésors récupérés dans votre Kevy-Coffre :</Text>

              <View style={styles.summaryList}>
                {history.map((item, idx) => (
                  <View key={idx} style={[styles.summaryRow, { backgroundColor: themeColors.overlayLight }]}>
                    <Ionicons name={item.iconName} size={22} color={item.iconColor} />
                    <Text style={[styles.summaryRowText, { color: themeColors.text }]}>{item.title}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[styles.mainButton, { backgroundColor: colors.mint }]} onPress={handleFinish} activeOpacity={0.85}>
                <Text style={styles.mainButtonText}>Reprendre la partie</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  card: { width: width - 40, borderRadius: 28, borderWidth: 1.5, padding: spacing.xl, alignItems: 'center' },
  centerContainer: { width: '100%', alignItems: 'center' },
  badgeText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 13, letterSpacing: 2, marginBottom: spacing.xs },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 17, textAlign: 'center', marginBottom: spacing.md },
  chestWrapper: { marginVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
  rewardBox: { width: '100%', borderRadius: 16, padding: spacing.md, alignItems: 'center', marginVertical: spacing.sm },
  rewardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, textAlign: 'center', marginTop: spacing.xs },
  rewardSubtext: { fontFamily: 'Poppins_500Medium', fontSize: 12, textAlign: 'center', marginTop: 2 },
  mainButton: { width: '100%', height: 50, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  buttonIcon: { marginRight: spacing.sm },
  mainButtonText: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 14 },
  summaryTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 20, marginTop: spacing.xs, letterSpacing: 1 },
  summarySub: { fontFamily: 'Poppins_500Medium', fontSize: 12, textAlign: 'center', marginBottom: spacing.md },
  summaryList: { width: '100%', marginVertical: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: 12, marginVertical: 4 },
  summaryRowText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, marginLeft: spacing.sm, flex: 1 }
});
