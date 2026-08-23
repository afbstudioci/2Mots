//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext'; 
import { useFeedback } from '../../hooks/useFeedback';
import { useAudio } from '../../hooks/useAudio';
import { spacing, typography, colors } from '../../theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GameTimerProps {
  timeLeft: number;
  maxTime: number; 
  timeWon?: number; 
  isFastCombo?: boolean;
  onTimeGainAnimationEnd?: () => void;
}

export default function GameTimer({ 
  timeLeft, 
  maxTime, 
  timeWon = 0, 
  isFastCombo = false,
  onTimeGainAnimationEnd 
}: GameTimerProps) {
  const { themeColors } = useTheme(); 
  const { triggerVibration } = useFeedback();
  const { playDanger } = useAudio();
  
  const progressAnim = useRef(new Animated.Value(1)).current;
  const bonusAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastTimeLeft = useRef(timeLeft);

  // Dimensions compactes ultra-calibrées pour zéro encombrement
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const safeMaxTime = maxTime > 0 ? maxTime : 30;
  const ratio = Math.max(0, Math.min(1, timeLeft / safeMaxTime));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 350,
      useNativeDriver: false,
    }).start();

    if (timeLeft <= 5 && timeLeft > 0) {
      if (timeLeft !== lastTimeLeft.current) {
        triggerVibration();
        playDanger();
        lastTimeLeft.current = timeLeft;
      }
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft, safeMaxTime]);

  useEffect(() => {
    if (timeWon > 0) {
      bonusAnim.setValue(0);
      Animated.sequence([
        Animated.spring(bonusAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
        Animated.timing(bonusAnim, { toValue: 0, duration: 700, delay: 500, useNativeDriver: true })
      ]).start(() => {
        if (onTimeGainAnimationEnd) onTimeGainAnimationEnd();
      });
    }
  }, [timeWon]);

  const isLowTime = timeLeft <= 5;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const timerColor = timeLeft <= 5 ? colors.error : (timeLeft <= 10 ? colors.coral : colors.mint);

  const bonusOpacity = bonusAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });
  const bonusTranslateY = bonusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, -24],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.timerWrapper,
          { transform: [{ scale: isLowTime ? pulseAnim : 1 }] }
        ]}
      >
        <Svg width={size} height={size}>
          {/* Cercle de fond */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={themeColors.overlayLight}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Cercle de progression dynamique */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={timerColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {/* Texte central des secondes */}
        <View style={styles.textOverlay}>
          <Text 
            style={[
              styles.timeText, 
              { color: isLowTime ? colors.error : themeColors.text }
            ]}
          >
            {timeLeft}
          </Text>
          <Text 
            style={[
              styles.unitText, 
              { color: isLowTime ? colors.error : themeColors.textSecondary }
            ]}
          >
            SEC
          </Text>
        </View>

        {/* Bonus de temps flottant */}
        {timeWon > 0 && (
          <Animated.View 
            style={[
              styles.bonusBadge, 
              { 
                opacity: bonusOpacity, 
                transform: [{ translateY: bonusTranslateY }] 
              }
            ]}
          >
            <Text style={styles.bonusText}>
              {isFastCombo ? '+RAPIDE (+2K)' : `+${timeWon}s`}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  timerWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: 'Poppins_900Black',
  },
  unitText: {
    fontSize: 8,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  bonusBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.mint + '25',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.mint + '50',
    zIndex: 10,
  },
  bonusText: {
    color: colors.mint,
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 10,
  },
});