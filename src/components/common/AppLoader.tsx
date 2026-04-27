//src/components/common/AppLoader.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AppLoaderProps {
  onRetry?: () => void;
  error?: boolean;
}

export default function AppLoader({ onRetry, error }: AppLoaderProps) {
  const { themeColors } = useTheme();
  
  const drawAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const errorFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fondu d'apparition
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Tracé de l'infini
    Animated.timing(drawAnim, {
      toValue: 0,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      // Pulse infini après le tracé
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    });
  }, []);

  useEffect(() => {
    if (error) {
      Animated.timing(errorFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      errorFadeAnim.setValue(0);
    }
  }, [error]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Animated.View style={{ opacity: errorFadeAnim, alignItems: 'center' }}>
          <View style={[styles.errorIconCircle, { borderColor: colors.coral }]}>
            <Ionicons name="cloud-offline-outline" size={50} color={colors.coral} />
          </View>
          <Text style={[styles.errorText, { color: themeColors.text }]}>Connexion interrompue</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.coral }]} 
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Svg width="120" height="60" viewBox="0 0 100 50">
          <AnimatedPath
            d="M 50 25 C 65 0, 95 0, 95 25 C 95 50, 65 50, 50 25 C 35 0, 5 0, 5 25 C 5 50, 35 50, 50 25 Z"
            fill="none"
            stroke={colors.coral}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="300"
            strokeDashoffset={drawAnim}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderStyle: 'dashed',
  },
  errorText: {
    ...typography.bodyMedium,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#FFF',
    fontFamily: 'Poppins_700Bold',
    marginLeft: spacing.sm,
    fontSize: 16,
  }
});
