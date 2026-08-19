//src/screens/SplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function SplashScreen({ navigation }: any) {
  const { themeColors } = useTheme();
  const { user, loading } = useAuth();
  const { refreshAll } = useData();
  const [progress, setProgress] = useState(0);
  const hasNavigated = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (user) {
      refreshAll().catch(() => {});
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(95, prev + 15));
    }, 100);

    const timer = setTimeout(() => {
      setProgress(100);
      clearInterval(progressInterval);
      if (!loading && !hasNavigated.current) {
        hasNavigated.current = true;
        navigation.replace(user ? 'Home' : 'Login');
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [fadeAnim, loading, navigation, refreshAll, scaleAnim, user]);

  useEffect(() => {
    if (!loading && progress >= 95 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigation.replace(user ? 'Home' : 'Login');
    }
  }, [loading, navigation, progress, user]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.centerBlock}>
          {/* Tracé SVG élégant du symbole Infini */}
          <Svg width={130} height={65} viewBox="0 0 100 50">
            <Path
              d="M 50 25 C 65 0, 95 0, 95 25 C 95 50, 65 50, 50 25 C 35 0, 5 0, 5 25 C 5 50, 35 50, 50 25 Z"
              fill="none"
              stroke={colors.coral}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </Svg>

          {/* Signature By_ KEVY agrandie et mise en valeur */}
          <Text style={styles.signatureText}>By_ KEVY</Text>
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
    paddingVertical: '22%',
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureText: {
    fontFamily: 'Poppins_700Bold',
    color: colors.coral,
    fontSize: 20,
    letterSpacing: 4,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  progressBarBackground: {
    width: 110,
    height: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
});