import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { typography, colors, spacing, borderRadius } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface GameEmptyProps {
    message: string;
    onBack: () => void;
}

export default function GameEmpty({ message, onBack }: GameEmptyProps) {
    const { themeColors } = useTheme();
    const dropTear = useRef(new Animated.Value(0)).current;
    const fadeTear = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const playTearAnimation = () => {
            dropTear.setValue(0);
            fadeTear.setValue(1);
            Animated.sequence([
                Animated.delay(500),
                Animated.parallel([
                    Animated.timing(dropTear, { toValue: 20, duration: 1000, useNativeDriver: true }),
                    Animated.timing(fadeTear, { toValue: 0, duration: 1000, useNativeDriver: true })
                ])
            ]).start(() => playTearAnimation());
        };

        playTearAnimation();
        return () => dropTear.stopAnimation();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.iconContainer}>
                {/* Visage endormi/triste */}
                <Svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={themeColors.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="12" cy="12" r="10" />
                    <Path d="M8 15h8" /> 
                    <Path d="M9 9h.01" /> 
                    <Path d="M15 9h.01" /> 
                </Svg>
                
                {/* La larme animee */}
                <Animated.View style={[styles.tearDrop, { transform: [{ translateY: dropTear }], opacity: fadeTear }]}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill={colors.coral}>
                        <Path d="M12 21a6 6 0 0 0 6-6c0-4.5-6-11-6-11S6 10.5 6 15a6 6 0 0 0 6 6z" />
                    </Svg>
                </Animated.View>
            </View>

            <Text style={[styles.errorText, { color: themeColors.text }]}>{message}</Text>

            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
                <Text style={styles.buttonText}>RETOUR</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconContainer: {
        marginBottom: spacing.xl,
        alignItems: 'center',
        position: 'relative',
    },
    tearDrop: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    errorText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.xl * 2,
        opacity: 0.8,
    },
    backButton: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl * 2,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    buttonText: {
        ...typography.buttonPrimary,
        letterSpacing: 2,
    },
});