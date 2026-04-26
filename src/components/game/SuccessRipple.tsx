//src/components/game/SuccessRipple.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SuccessRipple({ trigger }: { trigger: number }) {
    const { themeColors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (trigger === 0) return;
        scaleAnim.setValue(0);
        opacityAnim.setValue(0.6);
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1.5, friction: 3, tension: 40, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 800, useNativeDriver: true })
        ]).start();
    }, [trigger]);

    return (
        <Animated.View style={[
            styles.ripple, 
            { backgroundColor: themeColors.primary, transform: [{ scale: scaleAnim }], opacity: opacityAnim }
        ]} />
    );
}

const styles = StyleSheet.create({
    ripple: { position: 'absolute', width: width * 0.5, height: width * 0.5, borderRadius: (width * 0.5) / 2, zIndex: 0 }
});