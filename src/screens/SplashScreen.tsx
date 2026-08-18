//src/screens/SplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography, colors, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { themeColors } = useTheme();
  const { refreshAll } = useData();
  const [progress, setProgress] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      refreshAll();
    } catch (e) {}

    // Progression garantie et appel systématique de onFinish
    const timer = setTimeout(() => {
      setProgress(100);
      if (onFinish) {
        onFinish();
      }
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [fadeAnim, onFinish, refreshAll, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.centerBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="infinite" size={54} color={colors.coral} />
          </View>
          <Text style={styles.logoText}>2Mots</Text>
          <Text style={styles.signatureText}>@By_Kevy</Text>
        </View>

        <View style={styles.bottomBlock}>
          <View style={[styles.progressBarBackground, { backgroundColor: themeColors.overlayLight }]}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.coral }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 127, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logoText: {
    ...typography.titleHuge,
    color: colors.coral,
    fontSize: 50,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: spacing.xs,
  },
  signatureText: {
    fontFamily: 'Poppins_500Medium',
    color: colors.coral,
    fontSize: 13,
    letterSpacing: 2,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  progressBarBackground: {
    width: 100,
    height: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
});