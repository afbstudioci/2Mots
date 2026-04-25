import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
    const hasVibratedDanger = useRef(false);

    useEffect(() => {
        if (timeLeft > 5) {
            hasVibratedDanger.current = false;
        }
    }, [timeLeft]);

    const getTimerColor = () => {
        if (progress > 0.5) return colors.mint;
        if (progress > 0.16) return colors.coral;
        return colors.error;
    };

    useEffect(() => {
        if (timeLeft <= 5 && timeLeft > 0 && !hasVibratedDanger.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            hasVibratedDanger.current = true;
        }
    }, [timeLeft]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <View style={[styles.bar, { 
                    width: `${progress * 100}%`, 
                    backgroundColor: getTimerColor() 
                }]} />
                <TimeGainIndicator timeWon={timeWon} onAnimationEnd={onTimeGainAnimationEnd} />
            </View>
            <Text style={[styles.timeText, { color: getTimerColor() }]}>
                {timeLeft}s
            </Text>
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
        overflow: 'visible', // Pour voir l'animation sortir de la barre
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