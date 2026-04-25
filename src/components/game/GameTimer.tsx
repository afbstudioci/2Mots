//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';
import * as Haptics from 'expo-haptics';
import TimeGainIndicator from './TimeGainIndicator';

interface GameTimerProps {
    timeLeft: number;
    maxTime: number;
    timeWon: number;
    onTimeGainAnimationEnd: () => void;
}

export default function GameTimer({ timeLeft, maxTime, timeWon, onTimeGainAnimationEnd }: GameTimerProps) {
    const progress = timeLeft / maxTime;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const getTimerColor = () => {
        if (progress > 0.5) return colors.mint;
        if (progress > 0.16) return colors.coral;
        return colors.error;
    };

    useEffect(() => {
        if (timeLeft <= 5 && timeLeft > 0) {
            // L'impact lourd se déclenche à chaque seconde sous les 5s
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            // Animation de battement de coeur sur le texte
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [timeLeft, pulseAnim]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <View style={[styles.bar, { 
                    width: `${progress * 100}%`, 
                    backgroundColor: getTimerColor() 
                }]} />
                <TimeGainIndicator timeWon={timeWon} onAnimationEnd={onTimeGainAnimationEnd} />
            </View>
            <Animated.Text 
                style={[
                    styles.timeText, 
                    { 
                        color: getTimerColor(),
                        transform: [{ scale: pulseAnim }]
                    }
                ]}
            >
                {timeLeft}s
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    container: {
        flex: 1,
        height: 10,
        borderRadius: borderRadius.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'visible',
    },
    bar: {
        height: '100%',
        borderRadius: borderRadius.xl,
    },
    timeText: {
        ...typography.titleLarge,
        fontSize: 20,
        marginLeft: spacing.md,
        minWidth: 40,
    }
});