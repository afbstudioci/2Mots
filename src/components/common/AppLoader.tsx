//src/components/common/AppLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function AppLoader() {
  const { themeColors } = useTheme();
  
  const drawAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
  }
});
