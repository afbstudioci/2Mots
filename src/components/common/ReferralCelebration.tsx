//src/components/common/ReferralCelebration.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ReferralCelebrationProps {
    visible: boolean;
    onClose: () => void;
}

export default function ReferralCelebration({ visible, onClose }: ReferralCelebrationProps) {
    const { themeColors } = useTheme();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 20,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[
            styles.container, 
            { 
                backgroundColor: themeColors.card, 
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }]
            }
        ]}>
            <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.iconContainer}>
                <Ionicons name="gift" size={24} color={colors.white} />
            </LinearGradient>
            
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: themeColors.text }]}>BONUS ACTIVÉ !</Text>
                <Text style={[styles.message, { color: themeColors.textSecondary }]}>
                    Joue jusqu'au <Text style={{ color: colors.coral, fontWeight: 'bold' }}>Niveau 2</Text> pour débloquer tes <Text style={{ color: colors.coral, fontWeight: 'bold' }}>100 Kevs</Text> de parrainage.
                </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: spacing.lg,
        right: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1000,
        ...shadows.soft(false),
        borderWidth: 1,
        borderColor: 'rgba(255, 90, 95, 0.3)',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    message: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 11,
        lineHeight: 14,
    },
    closeBtn: {
        padding: spacing.xs,
    }
});
