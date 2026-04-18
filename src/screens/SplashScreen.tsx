//src/screens/SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography, colors, spacing } from '../theme/theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Apparition en fondu doux
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Duree totale 2500ms (2.5s) selon le cahier des charges
    // 100 etapes de 25ms = 2500ms
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onFinish) {
            // Un micro delai visuel une fois la barre remplie avant de basculer
            setTimeout(onFinish, 100);
          }
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        <View style={styles.centerBlock}>
          <Text style={styles.logoMark}>M</Text>
          <Text style={styles.logoText}>2Mots</Text>
        </View>
        
        <View style={styles.bottomBlock}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.nightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '20%',
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMark: {
    fontSize: 72,
    color: colors.coral,
    fontWeight: '300',
    marginBottom: spacing.xs,
  },
  logoText: {
    ...typography.titleHuge,
    color: colors.coral,
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -1,
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  progressBarBackground: {
    width: 80, // Toute petite barre de chargement
    height: 6,
    backgroundColor: 'rgba(244, 235, 216, 0.15)', // Beige sable transparent
    borderRadius: 10, // Pilule parfaite
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.sand,
    borderRadius: 10,
  }
});