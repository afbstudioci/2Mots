//src/components/auth/ServerWakeUpLoader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

const MESSAGES = [
  'Connexion en cours...',
  'Synchronisation de vos données...',
  'Préparation de vos défis...',
  'Sécurisation de la session...',
  'Presque prêt...',
];

const ServerWakeUpLoader = () => {
  const { themeColors } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Modal transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.pulseCircle,
                { transform: [{ scale: pulseAnim }], borderColor: colors.coral },
              ]}
            />
            <View style={[styles.dot, { backgroundColor: colors.coral }]} />
          </View>

          <Animated.Text
            style={[
              styles.title,
              { color: themeColors.text, opacity: fadeAnim },
            ]}
          >
            {MESSAGES[messageIndex]}
          </Animated.Text>

          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Veuillez patienter quelques instants
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 19, 43, 0.85)',
  },
  container: {
    width: '85%',
    maxWidth: 340,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  animationContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pulseCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    position: 'absolute',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    textAlign: 'center',
    minHeight: 28,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 13,
    opacity: 0.75,
  },
});

export default ServerWakeUpLoader;