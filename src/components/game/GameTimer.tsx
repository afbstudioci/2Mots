//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext'; 
import { useFeedback } from '../../hooks/useFeedback';
import { useAudio } from '../../hooks/useAudio';
import { spacing, typography, colors } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GameTimerProps {
    timeLeft: number;
    maxTime: number; 
    timeWon?: number; 
    onTimeGainAnimationEnd?: () => void;
}

export default function GameTimer({ 
    timeLeft, 
    maxTime, 
    timeWon = 0, 
    onTimeGainAnimationEnd 
}: GameTimerProps) {
    const { themeColors } = useTheme(); 
    const { triggerVibration } = useFeedback();
    const { playDanger } = useAudio();
    
    const progressAnim = useRef(new Animated.Value(1)).current;
    const bonusAnim = useRef(new Animated.Value(0)).current;
    const lastTimeLeft = useRef(timeLeft);

    // Constantes pour le cercle SVG
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: timeLeft / maxTime,
            duration: 500,
            useNativeDriver: false,
        }).start();

        if (timeLeft <= 5 && timeLeft > 0 && timeLeft !== lastTimeLeft.current) {
            triggerVibration();
            playDanger();
            lastTimeLeft.current = timeLeft;
        }
    }, [timeLeft, maxTime]);

    useEffect(() => {
        if (timeWon > 0) {
            bonusAnim.setValue(0);
            Animated.sequence([
                Animated.spring(bonusAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.timing(bonusAnim, { toValue: 0, duration: 800, delay: 600, useNativeDriver: true })
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
        outputRange: [10, -50],
    });

    return (
        <View style={styles.container}>
            <View style={styles.timerWrapper}>
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
                    {/* Cercle de progression animé */}
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
                
                <View style={styles.textOverlay}>
                    <Text style={[
                        styles.timeText, 
                        { color: isLowTime ? colors.error : themeColors.text }
                    ]}>
                        {timeLeft}
                    </Text>
                    <Text style={[styles.unitText, { color: themeColors.textSecondary }]}>sec</Text>
                </View>

                {/* Bonus de temps flottant */}
                {timeWon > 0 && (
                    <Animated.View style={[
                        styles.bonusContainer,
                        { 
                            opacity: bonusOpacity, 
                            transform: [{ translateY: bonusTranslateY }] 
                        }
                    ]}>
                        <Text style={styles.bonusText}>+{timeWon}s</Text>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.md,
    },
    timerWrapper: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        ...typography.titleLarge,
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 36,
    },
    unitText: {
        ...typography.bodySmall,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: -4,
    },
    bonusContainer: {
        position: 'absolute',
        top: -20,
        backgroundColor: colors.mint + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.mint + '40',
    },
    bonusText: {
        color: colors.mint,
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 14,
    },
});