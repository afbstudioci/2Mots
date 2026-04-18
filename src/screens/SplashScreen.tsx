import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography, colors, spacing, borderRadius } from '../theme/theme';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: { navigation: SplashScreenNavigationProp }) {
  const [progress, setProgress] = useState(0);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigation.replace('Login'), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        <Text style={styles.logo}>2Mots</Text>
        
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>initializing sanctuary {progress}%</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>END-TO-END ENCRYPTED</Text>
          <Text style={styles.footerText}>VERSION 2.0.4 - NOCTURNE EDITION</Text>
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
    width: '80%',
    alignItems: 'center',
  },
  logo: {
    ...typography.titleHuge,
    color: colors.coral,
    fontSize: 64,
    marginBottom: spacing.xl * 2,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#2D3748',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.coral,
  },
  progressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.sand,
    opacity: 0.6,
    letterSpacing: 1,
    marginBottom: spacing.xl * 3,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  footerText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: colors.sand,
    opacity: 0.4,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
});