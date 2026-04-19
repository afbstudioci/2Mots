// src/components/animations/ChainLoader.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/theme';

export default function ChainLoader() {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(scaleAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
                    Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                ])
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[
            styles.line, 
            { 
                backgroundColor: colors.coral,
                opacity: opacityAnim,
                transform: [{ scaleY: scaleAnim }]
            }
        ]} />
    );
}

const styles = StyleSheet.create({
    line: {
        width: 4,
        height: 60,
        borderRadius: 2,
        marginVertical: 10,
    },
});