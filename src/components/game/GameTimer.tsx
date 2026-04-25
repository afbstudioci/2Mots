//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/theme';

interface GameTimerProps {
    duration: number; // En secondes (ex: 30)
    onTimeUp: () => void;
    isActive: boolean;
}

export default function GameTimer({ duration, onTimeUp, isActive }: GameTimerProps) {
    const animatedWidth = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        animatedWidth.setValue(100);

        if (isActive) {
            Animated.timing(animatedWidth, {
                toValue: 0,
                duration: duration * 1000,
                useNativeDriver: false, // Obligatoire pour animer la width/backgroundColor
            }).start(({ finished }) => {
                if (finished) {
                    onTimeUp();
                }
            });
        } else {
            animatedWidth.stopAnimation();
        }
    }, [isActive, duration, animatedWidth]);

    const interpolatedColor = animatedWidth.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [colors.coral, colors.coral, colors.success], // Devient Corail sur la seconde moitié
    });

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.bar, 
                    { 
                        width: animatedWidth.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%']
                        }),
                        backgroundColor: interpolatedColor
                    }
                ]} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(26, 32, 44, 0.1)', // Bleu nuit très transparent
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
    },
    bar: {
        height: '100%',
        borderBottomRightRadius: 4,
        borderTopRightRadius: 4,
    }
});