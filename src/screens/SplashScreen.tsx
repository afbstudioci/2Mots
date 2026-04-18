//src/screens/SplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { typography, colors, spacing } from '../theme/theme';
import Svg, { Path } from 'react-native-svg';

interface SplashScreenProps {
  onFinish?: () => void;
}

// On convertit le composant Path du SVG pour qu'il accepte les animations natives
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  
  // Valeurs d'animation
  const drawAnim = useRef(new Animated.Value(300)).current; // Longueur totale estimee du trace SVG
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const kevyFadeAnim = useRef(new Animated.Value(0)).current;
  const kevyMoveAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // 1. Fondu global du conteneur (très rapide)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // 2. L'Effet Serpentin : Tracage de l'icone SVG
    Animated.timing(drawAnim, {
      toValue: 0, // On reduit le decalage du trait jusqu'a 0 (dessin complet)
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      // react-native-svg necessite false pour animer les proprietes internes comme strokeDashoffset
      useNativeDriver: false, 
    }).start(() => {
      // 3. Une fois le dessin fini, on declenche le battement de coeur (Pulse)
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    });

    // 4. Apparition majestueuse de "@By Kevy" synchronisee avec la fin du tracage
    Animated.sequence([
      Animated.delay(1000), 
      Animated.parallel([
        Animated.timing(kevyFadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(kevyMoveAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ])
    ]).start();

    // 5. Gestion du progres de la barre (2.5s strictes)
    const duration = 2500;
    const intervalTime = 25;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextProgress = (currentStep / steps) * 100;
      
      if (nextProgress >= 100) {
        setProgress(100);
        clearInterval(interval);
        if (onFinish) {
          setTimeout(onFinish, 200); 
        }
      } else {
        setProgress(nextProgress);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        <View style={styles.centerBlock}>
          
          {/* L'icone SVG dessinee a la volee */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
            <Svg width="140" height="70" viewBox="0 0 100 50">
              <AnimatedPath
                // Le trace mathematique parfait de l'infini
                d="M 50 25 C 65 0, 95 0, 95 25 C 95 50, 65 50, 50 25 C 35 0, 5 0, 5 25 C 5 50, 35 50, 50 25 Z"
                fill="none"
                stroke={colors.coral}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="300" // Longueur du trait
                strokeDashoffset={drawAnim} // C'est cette valeur qui s'anime
              />
            </Svg>
          </Animated.View>

          <Text style={styles.logoText}>2Mots</Text>

          {/* Signature Animee */}
          <Animated.View style={{ 
            opacity: kevyFadeAnim,
            transform: [{ translateY: kevyMoveAnim }]
          }}>
            <Text style={styles.signatureText}>@By Kevy</Text>
          </Animated.View>
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
  logoText: {
    ...typography.titleHuge,
    color: colors.coral,
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -2,
    marginTop: spacing.sm,
  },
  signatureText: {
    fontFamily: 'Poppins_500Medium',
    color: colors.coral,
    fontSize: 14,
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
    backgroundColor: 'rgba(247, 245, 240, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.sand,
    borderRadius: 10,
  }
});