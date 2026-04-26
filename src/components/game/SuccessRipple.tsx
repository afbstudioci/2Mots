//src/components/game/SuccessRipple.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function SuccessRipple({ trigger, accuracy = 0 }: { trigger: number, accuracy?: number }) {
    const { themeColors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (trigger === 0) return;
        
        const isPerfect = accuracy >= 100;
        const targetScale = isPerfect ? 2.5 : 1.5;
        const startOpacity = isPerfect ? 0.9 : 0.6;
        const duration = isPerfect ? 1000 : 800;

        scaleAnim.setValue(0);
        opacityAnim.setValue(startOpacity);
        
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: targetScale, friction: 3, tension: isPerfect ? 30 : 40, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: duration, useNativeDriver: true })
        ]).start();
    }, [trigger, accuracy]);

    const rippleColor = accuracy >= 100 ? colors.mint : themeColors.primary;

    return (
        <Animated.View style={[
            styles.ripple, 
            { backgroundColor: rippleColor, transform: [{ scale: scaleAnim }], opacity: opacityAnim }
        ]} />
    );
}

const styles = StyleSheet.create({
    ripple: { position: 'absolute', width: width * 0.5, height: width * 0.5, borderRadius: (width * 0.5) / 2, zIndex: 0 }
});