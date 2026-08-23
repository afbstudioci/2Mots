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
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (alert) {
      slideAnim.setValue(-50);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 65, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -50, duration: 180, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [alert]);

  if (!alert) return null;

  const isOvertake = alert.type === 'overtake';
  const accentColor = isOvertake ? colors.mint : colors.coral;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: accentColor,
            borderWidth: 1.5,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: isOvertake ? 'rgba(78, 205, 196, 0.18)' : 'rgba(255, 107, 107, 0.18)' }]}>
          <Ionicons
            name={isOvertake ? 'flash' : 'trending-up'}
            size={18}
            color={accentColor}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
            {isOvertake
              ? `Tu viens de dépasser @${alert.rivalPseudo} !`
              : `Cible en vue : @${alert.rivalPseudo}`}
          </Text>

          <Text style={[styles.subtext, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {isOvertake
              ? alert.nextRivalPseudo
                ? `Prochaine cible : @${alert.nextRivalPseudo} (${alert.nextRivalScore} mots)`
                : 'Tu pulvérises tes précédents records !'
              : `Plus qu'un mot pour égaler son score (${alert.rivalScore} mots) !`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  subtext: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 1,
  },
});
