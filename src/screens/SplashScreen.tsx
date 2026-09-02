//src/screens/SplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../theme/theme';
import api from '../services/api';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  const [dotsCount, setDotsCount] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const containerFadeAnim = useRef(new Animated.Value(1)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const statusFadeAnim = useRef(new Animated.Value(0)).current;

  const hasFinished = useRef(false);
  const serverResponded = useRef(false);

  const completeSplash = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    Animated.timing(containerFadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  useEffect(() => {
    let progressInterval: any = null;
    let dotsInterval: any = null;

    // 1. Lancement immédiat de la requête de réveil au backend
    const pingBackend = async () => {
      try {
        await api.get('/health', { timeout: 60000 });
      } catch {
        // En cas d'erreur ou hors-ligne, on continue quand même
      } finally {
        serverResponded.current = true;
        setIsReady(true);
      }
    };

    pingBackend();

    // 2. Progression fluide initiale (jusqu'à 85% max si le serveur dort)
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (serverResponded.current) {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(completeSplash, 250);
            return 100;
          }
          return Math.min(100, prev + 12);
        }

        // Si le serveur dort encore, on plafonne doucement à 85%
        if (prev < 85) {
          return prev + 6;
        }
        return 85;
      });
    }, 80);

    // 3. Si après 1.4s le serveur n'a pas répondu, on affiche le message de démarrage
    const wakeUpTimer = setTimeout(() => {
      if (!serverResponded.current) {
        setShowStatus(true);
        Animated.timing(statusFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        dotsInterval = setInterval(() => {
          setDotsCount((d) => (d >= 3 ? 1 : d + 1));
        }, 450);
      }
    }, 1400);

    // 4. Failsafe absolu (au cas où le réseau met trop de temps)
    const failsafeTimer = setTimeout(() => {
      serverResponded.current = true;
      setIsReady(true);
      setProgress(100);
      setTimeout(completeSplash, 200);
    }, 45000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      clearTimeout(wakeUpTimer);
      clearTimeout(failsafeTimer);
    };
  }, []);

  const dotsString = '.'.repeat(dotsCount);

  return (
    <Animated.View
      style={[
        styles.overlayContainer,
        {
          backgroundColor: colors.coral,
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
          },
        ]}
      >
        <View style={styles.centerBlock}>
          <Text style={styles.signatureText}>BY_ KEVY</Text>
        </View>

        <View style={styles.bottomBlock}>
          {showStatus && (
            <Animated.View style={[styles.statusContainer, { opacity: statusFadeAnim }]}>
              <Text style={styles.statusText}>
                {isReady ? 'Prêt !' : `Démarrage${dotsString}`}
              </Text>
            </Animated.View>
          )}

          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: colors.white },
              ]}
            />
          </View>
        </View>
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
    color: colors.white,
    fontSize: 24,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  statusContainer: {
    marginBottom: spacing.sm,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  progressBarBackground: {
    width: 120,
    height: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
});