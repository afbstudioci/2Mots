import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../theme/theme';

interface TimeGainIndicatorProps {
    timeWon: number;
    onAnimationEnd: () => void;
}

export default function TimeGainIndicator({ timeWon, onAnimationEnd }: TimeGainIndicatorProps) {
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (timeWon <= 0) return;

        // Reset
        opacityAnim.setValue(1);
        translateYAnim.setValue(0);
        scaleAnim.setValue(0.5);

        // Animation de gain jubilatoire
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1.2, friction: 3, tension: 50, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 1200, delay: 300, useNativeDriver: true }),
            Animated.timing(translateYAnim, { toValue: -30, duration: 1200, useNativeDriver: true })
        ]).start(() => {
            onAnimationEnd();
        });
    }, [timeWon]);

    if (timeWon <= 0) return null;

    return (
        <Animated.View style={[
            styles.container, 
            { 
                opacity: opacityAnim, 
                transform: [{ translateY: translateYAnim }, { scale: scaleAnim }] 
            }
        ]}>
            <Text style={styles.text}>+{timeWon}s</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: -10,
        backgroundColor: colors.mint,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    text: {
        ...typography.buttonPrimary,
        color: colors.nightBlue,
        fontSize: 14,
    }
});