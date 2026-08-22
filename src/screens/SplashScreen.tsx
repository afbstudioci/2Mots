//src/screens/SplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { themeColors } = useTheme();
  const [progress, setProgress] = useState(0);

  const containerFadeAnim = useRef(new Animated.Value(1)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const hasFinished = useRef(false);

  const completeSplash = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    Animated.timing(containerFadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
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

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 15);
      });
    }, 100);

    const animTimer = setTimeout(() => {
      setProgress(100);
      clearInterval(progressInterval);
      completeSplash();
    }, 1400);

    const failsafeTimer = setTimeout(() => {
      completeSplash();
    }, 2000);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(failsafeTimer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.overlayContainer,
        {
          backgroundColor: themeColors.background,
          opacity: containerFadeAnim,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentFadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={styles.centerBlock}>
          <Svg width={130} height={65} viewBox="0 0 100 50">
            <Path
              d="M 50 25 C 65 0, 95 0, 95 25 C 95 50, 65 50, 50 25 C 35 0, 5 0, 5 25 C 5 50, 35 50, 50 25 Z"
              fill="none"
              stroke={colors.coral}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </Svg>

          <Animated.Text style={styles.signatureText}>By_ KEVY</Animated.Text>
        </Animated.View>

        <Animated.View style={styles.bottomBlock}>
          <Animated.View
            style={[
              styles.progressBarBackground,
              { backgroundColor: themeColors.overlayLight },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: colors.coral },
              ]}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
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