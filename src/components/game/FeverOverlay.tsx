//src/components/game/FeverOverlay.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface FeverOverlayProps {
  active: boolean;
}

export default function FeverOverlay({ active }: FeverOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loopAnimation: Animated.CompositeAnimation | null = null;

    if (active) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loopAnimation.start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      pulseAnim.setValue(1);
    }

    return () => {
      if (loopAnimation) loopAnimation.stop();
    };
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Bordure Périphérique Électrique */}
      <View style={styles.borderGlow} />

      {/* Badge Flottant Mode FEVER */}
      <Animated.View
        style={[
          styles.feverBadge,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Ionicons name="flame" size={18} color="#FFFFFF" style={styles.badgeIcon} />
        <Text style={styles.badgeText}>MODE FEVER • GAINS x3</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 900,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    borderRadius: 24,
    margin: 4,
  },
  feverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 11,
    color: colors.white,
    letterSpacing: 1.2,
  },
});
