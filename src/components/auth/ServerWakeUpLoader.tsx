//src/components/auth/ServerWakeUpLoader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing } from '../../theme/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const WAITING_PHRASES = [
  "Authentification en cours...",
  "Reveil des serveurs (Cold Start)...",
  "Synchronisation de la base de donnees...",
  "Preparation de votre espace de jeu...",
  "Derniers reglages, merci de patienter..."
];

const ServerWakeUpLoader = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  const drawAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Apparition de l'overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // L'effet serpentin infini (Tracé SVG)
    Animated.loop(
      Animated.sequence([
        Animated.timing(drawAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, 
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(drawAnim, {
          toValue: 300,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Changement de texte
    const interval = setInterval(() => {
      Animated.timing(textOpacity, { 
        toValue: 0, 
        duration: 500, 
        useNativeDriver: true 
      }).start(() => {
        setPhraseIndex((prev) => (prev < WAITING_PHRASES.length - 1 ? prev + 1 : prev));
        Animated.timing(textOpacity, { 
          toValue: 1, 
          duration: 500, 
          useNativeDriver: true 
        }).start();
      });
    }, 6000);

    return () => {
      clearInterval(interval);
      drawAnim.stopAnimation();
      opacityAnim.stopAnimation();
      textOpacity.stopAnimation();
    };
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <View style={styles.content}>
        
        <Animated.View style={[styles.iconContainer, { opacity: opacityAnim }]}>
          <Svg width="100" height="50" viewBox="0 0 100 50">
            <AnimatedPath
              d="M 50 25 C 65 0, 95 0, 95 25 C 95 50, 65 50, 50 25 C 35 0, 5 0, 5 25 C 5 50, 35 50, 50 25 Z"
              fill="none"
              stroke={colors.coral}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="300"
              strokeDashoffset={drawAnim}
            />
          </Svg>
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>2MOTS</Text>
          <Animated.Text style={[styles.subText, { opacity: textOpacity }]}>
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
    alignItems: 'center',
    justifyContent: 'center',
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