import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme/theme';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    iconColor?: string;
}

export default function EmptyState({ 
    icon, 
    title, 
    message, 
    actionLabel, 
    onAction,
    iconColor = colors.coral 
}: EmptyStateProps) {
    const { themeColors, isDark } = useTheme();

    const floatAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animation de lévitation (haut/bas)
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
            ])
        ).start();

        // Animation de pulsation du halo lumineux
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                {/* Halo lumineux qui pulse */}
                <Animated.View style={[
                    styles.glowBase,
                    { 
                        backgroundColor: iconColor, 
                        opacity: isDark ? 0.2 : 0.1,
                        transform: [{ scale: pulseAnim }]
                    }
                ]} />
                
                {/* Icône qui lévite */}
                <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                    <Ionicons name={icon} size={80} color={iconColor} />
                </Animated.View>
            </View>

            <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: themeColors.textSecondary }]}>{message}</Text>

            {actionLabel && onAction && (
                <Pressable 
                    onPress={onAction}
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <Text style={[styles.buttonText, { color: themeColors.text }]}>{actionLabel}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl * 1.5,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 150,
        marginBottom: spacing.xl,
    },
    glowBase: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    title: {
        ...typography.h2,
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.bodyMedium,
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 24,
        marginBottom: spacing.xl * 1.5,
    },
    button: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    buttonText: {
        ...typography.button,
        fontFamily: 'Poppins_600SemiBold',
    }
});
