//src/components/game/LiveRivalBanner.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { RivalAlertData } from '../../hooks/useLiveRivals';

interface LiveRivalBannerProps {
  alert: RivalAlertData | null;
}

export default function LiveRivalBanner({ alert }: LiveRivalBannerProps) {
  const { themeColors } = useTheme();
  const slideAnim = useRef(new Animated.Value(140)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (alert) {
      slideAnim.setValue(140);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 65, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 140, duration: 220, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [alert]);

  if (!alert) return null;

  let accentColor = colors.coral;
  let iconName: keyof typeof Ionicons.glyphMap = 'trending-up';
  let iconBg = 'rgba(255, 127, 80, 0.18)';
  let tagText = '';
  let mainText = '';
  let subText = '';

  if (alert.type === 'overtake') {
    accentColor = colors.mint;
    iconName = 'trophy';
    iconBg = 'rgba(74, 222, 128, 0.2)';
    tagText = 'DÉPASSÉ !';
    mainText = `@${alert.rivalPseudo}`;
    subText = alert.rivalRank ? `Tu es #${alert.rivalRank} Mondial` : 'Tu le doubles !';
  } else if (alert.type === 'threat_overtake') {
    accentColor = colors.error;
    iconName = 'trending-down';
    iconBg = 'rgba(239, 68, 68, 0.2)';
    tagText = 'RANG PERDU';
    mainText = `@${alert.rivalPseudo}`;
    subText = alert.myRank ? `Te dépasse (#${alert.myRank})` : 'T\'a dépassé !';
  } else if (alert.type === 'danger') {
    accentColor = '#F59E0B';
    iconName = 'warning-outline';
    iconBg = 'rgba(245, 158, 11, 0.2)';
    tagText = 'EN DANGER';
    mainText = `@${alert.rivalPseudo}`;
    subText = alert.rivalRank ? `Te talonne (#${alert.rivalRank})` : 'Te talonne !';
  } else {
    accentColor = colors.coral;
    iconName = 'locate';
    iconBg = 'rgba(255, 127, 80, 0.2)';
    tagText = 'CIBLE EN VUE';
    mainText = `@${alert.rivalPseudo}`;
    subText = alert.rivalScore ? `${alert.rivalScore} mot${alert.rivalScore > 1 ? 's' : ''} restant${alert.rivalScore > 1 ? 's' : ''}` : (alert.rivalRank ? `Rang #${alert.rivalRank}` : 'À portée !');
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.portraitCard,
          {
            backgroundColor: themeColors.card,
            borderColor: accentColor,
          },
        ]}
      >
        {/* En-tête avec Icône */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={16} color={accentColor} />
        </View>

        {/* Badge d'action */}
        <View style={[styles.tagBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.tagText}>{tagText}</Text>
        </View>

        {/* Pseudo du Rival */}
        <Text style={[styles.mainPseudo, { color: themeColors.text }]} numberOfLines={1}>
          {mainText}
        </Text>

        {/* Détail du Rang */}
        <Text style={[styles.subRank, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {subText}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 78,
    right: spacing.md,
    zIndex: 999,
  },
  portraitCard: {
    width: 104,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 8.5,
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  mainPseudo: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  subRank: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
    width: '100%',
  },
});
