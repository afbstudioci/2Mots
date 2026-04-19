//src/components/auth/ServerWakeUpLoader.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { Infinity } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme/theme';

const WAITING_PHRASES = [
  "Authentification en cours...",
  "Reveil des serveurs (Cold Start)...",
  "Synchronisation de la base de donnees...",
  "Preparation de votre espace de jeu...",
  "Derniers reglages, merci de patienter..."
];

const ServerWakeUpLoader = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    const interval = setInterval(() => {
      setPhraseIndex((prev) => {
        if (prev < WAITING_PHRASES.length - 1) return prev + 1;
        return prev; 
      });
    }, 6000); 

    return () => clearInterval(interval);
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      style={styles.overlay}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <Infinity color={colors.coral} size={64} strokeWidth={1.5} />
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>2MOTS</Text>
          <Animated.Text 
            key={phraseIndex} 
            entering={FadeIn.duration(500)} 
            exiting={FadeOut.duration(500)}
            style={styles.subText}
          >
            {WAITING_PHRASES[phraseIndex]}
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.95)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  textContainer: {
    alignItems: 'center',
    height: 80, 
  },
  mainText: {
    ...typography.headlineMedium,
    color: colors.sand,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  subText: {
    ...typography.bodyMedium,
    color: colors.coral,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  }
});

export default ServerWakeUpLoader;