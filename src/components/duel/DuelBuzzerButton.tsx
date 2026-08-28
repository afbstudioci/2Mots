//src/components/duel/DuelBuzzerButton.tsx
import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/theme';

interface DuelBuzzerButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const DuelBuzzerButton: React.FC<DuelBuzzerButtonProps> = ({ onPress, disabled = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    // 1. Animation d'onde de choc (Ripple)
    rippleScale.setValue(1);
    rippleOpacity.setValue(0.75);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 2.2,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPress();
  }, [onPress, rippleScale, rippleOpacity, glowAnim]);

  return (
    <View style={styles.container}>
      {/* Onde de choc animée (Ripple) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rippleCircle,
          {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          },
        ]}
      />

      {/* Halo de lueur pulsant */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowHalo,
          {
            opacity: glowAnim,
          },
        ]}
      />

      {/* Bouton principal interactif */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          disabled={disabled}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.buzzerButton}
        >
          <View style={styles.buzzerInner}>
            <Ionicons name="flash" size={38} color="#FFFFFF" />
            <Text style={styles.buzzerText}>BUZZER</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.coral,
  },
  glowHalo: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 3,
    borderColor: colors.coral,
  },
  buzzerButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    elevation: 14,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  buzzerInner: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buzzerText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_900Black',
    fontSize: 16,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
