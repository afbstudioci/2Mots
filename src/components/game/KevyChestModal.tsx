//src/components/game/KevyChestModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G, RadialGradient } from 'react-native-svg';
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
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<ChestReward[]>([]);
  const [activeReward, setActiveReward] = useState<ChestReward | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rewardPopAnim = useRef(new Animated.Value(0)).current;
  const chestBounceAnim = useRef(new Animated.Value(1)).current;

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

    Animated.sequence([
      Animated.timing(chestBounceAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
      Animated.spring(chestBounceAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();

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
              <Text style={[styles.badgeText, { color: colors.coral }]}>LE KEV-COFFRE</Text>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {currentStep === 0 ? 'Félicitations, vous avez obtenu les 3 clés !' : `Tirage ${currentStep} sur 3`}
              </Text>

              {/* Coffre Magnifique Haute Définition avec Sceau 'K' */}
              <Animated.View style={[styles.chestWrapper, { transform: [{ scale: chestBounceAnim }] }]}>
                <Svg width={140} height={120} viewBox="0 0 120 100">
                  <Defs>
                    <LinearGradient id="woodBase" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#B45309" />
                      <Stop offset="0.5" stopColor="#78350F" />
                      <Stop offset="1" stopColor="#451A03" />
                    </LinearGradient>
                    <LinearGradient id="goldPlate" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#FDE047" />
                      <Stop offset="0.5" stopColor="#EAB308" />
                      <Stop offset="1" stopColor="#A16207" />
                    </LinearGradient>
                    <LinearGradient id="glowGems" x1="0" y1="1" x2="0" y2="0">
                      <Stop offset="0" stopColor="#FBBF24" stopOpacity="0.9" />
                      <Stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>

                  {/* Lueur d'or lors de l'ouverture */}
                  {isOpen && (
                    <G>
                      <Circle cx="60" cy="35" r="35" fill="url(#glowGems)" />
                      <Circle cx="45" cy="30" r="4" fill="#38BDF8" />
                      <Circle cx="75" cy="28" r="4" fill="#34D399" />
                      <Circle cx="60" cy="22" r="5" fill="#F43F5E" />
                    </G>
                  )}

                  {/* Corps du Coffre en Bois Noble */}
                  <Rect x="15" y="42" width="90" height="48" rx="10" fill="url(#woodBase)" stroke="#291102" strokeWidth="2.5" />

                  {/* Armatures en Or Métallique (Gauche, Droite, Centre) */}
                  <Rect x="22" y="42" width="10" height="48" fill="url(#goldPlate)" />
                  <Rect x="88" y="42" width="10" height="48" fill="url(#goldPlate)" />
                  <Rect x="52" y="42" width="16" height="48" fill="url(#goldPlate)" />

                  {/* Rivets Métalliques Décoratifs */}
                  <Circle cx="27" cy="48" r="1.5" fill="#FEF08A" />
                  <Circle cx="27" cy="82" r="1.5" fill="#FEF08A" />
                  <Circle cx="93" cy="48" r="1.5" fill="#FEF08A" />
                  <Circle cx="93" cy="82" r="1.5" fill="#FEF08A" />

                  {/* Couvercle Incliné / Ouvert ou Fermé */}
                  {isOpen ? (
                    <G>
                      <Path d="M 8 36 C 8 10, 112 10, 112 36 L 102 24 C 102 4, 18 4, 18 24 Z" fill="url(#woodBase)" stroke="#291102" strokeWidth="2.5" />
                      <Path d="M 22 28 L 26 12 L 36 12 L 32 28 Z" fill="url(#goldPlate)" />
                      <Path d="M 88 28 L 84 12 L 94 12 L 98 28 Z" fill="url(#goldPlate)" />
                    </G>
                  ) : (
                    <G>
                      <Path d="M 12 42 C 12 16, 108 16, 108 42 Z" fill="url(#woodBase)" stroke="#291102" strokeWidth="2.5" />
                      <Path d="M 22 42 C 22 20, 32 20, 32 42 Z" fill="url(#goldPlate)" />
                      <Path d="M 88 42 C 88 20, 98 20, 98 42 Z" fill="url(#goldPlate)" />
                      <Path d="M 52 42 C 52 18, 68 18, 68 42 Z" fill="url(#goldPlate)" />
                    </G>
                  )}

                  {/* Médaillon Doré Central avec Symbole 'K' de KEVY */}
                  <Circle cx="60" cy="54" r="13" fill="url(#goldPlate)" stroke="#78350F" strokeWidth="2" />
                  <Circle cx="60" cy="54" r="10" fill="#78350F" />
                  {/* Lettre 'K' dorée gravée en vectoriel */}
                  <Path d="M 56 47 L 58.5 47 L 58.5 61 L 56 61 Z M 58.5 54 L 63.5 47 L 66 47 L 61 53.5 L 66.5 61 L 63.5 61 L 58.5 54.5 Z" fill="#FDE047" />
                </Svg>
              </Animated.View>

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
              <Text style={[styles.summarySub, { color: themeColors.textSecondary }]}>Voici les trésors récupérés dans votre Kev-Coffre :</Text>

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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  card: { width: width - 36, borderRadius: 28, borderWidth: 1.5, padding: spacing.lg, alignItems: 'center' },
  centerContainer: { width: '100%', alignItems: 'center' },
  badgeText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 13, letterSpacing: 2, marginBottom: spacing.xs },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 16, textAlign: 'center', marginBottom: spacing.xs },
  chestWrapper: { marginVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', height: 125 },
  rewardBox: { width: '100%', borderRadius: 16, padding: spacing.md, alignItems: 'center', marginVertical: spacing.xs },
  rewardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, textAlign: 'center', marginTop: spacing.xs },
  rewardSubtext: { fontFamily: 'Poppins_500Medium', fontSize: 12, textAlign: 'center', marginTop: 2 },
  mainButton: { width: '100%', height: 48, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  buttonIcon: { marginRight: spacing.sm },
  mainButtonText: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 13.5 },
  summaryTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 20, marginTop: spacing.xs, letterSpacing: 1 },
  summarySub: { fontFamily: 'Poppins_500Medium', fontSize: 12, textAlign: 'center', marginBottom: spacing.md },
  summaryList: { width: '100%', marginVertical: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: 12, marginVertical: 4 },
  summaryRowText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, marginLeft: spacing.sm, flex: 1 }
});
