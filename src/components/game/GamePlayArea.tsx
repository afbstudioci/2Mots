//src/components/game/GamePlayArea.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, typography, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface GamePlayAreaProps {
    currentPair: any;
}

export default function GamePlayArea({ currentPair }: GamePlayAreaProps) {
    const { themeColors } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();

        Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
        ).start();
    }, []);

    if (!currentPair) return null;

    const word1 = (currentPair.word1 || "").toUpperCase();
    const word2 = (currentPair.word2 || "").toUpperCase();

    return (
        <View style={styles.container}>
            {/* Carte du Haut (Mot 1) */}
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth, shadowColor: themeColors.text }]}>
                <Text 
                    style={[styles.wordText, { color: themeColors.text }]} 
                    numberOfLines={1} 
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.5}
                >
                    {word1}
                </Text>
            </View>

            {/* Le grand symbole + central avec animation d'anneau */}
            <View style={styles.linkContainer}>
                <Animated.View style={[
                    styles.ring, 
                    { 
                        borderColor: colors.coral,
                        transform: [
                            { scale: pulseAnim },
                            { rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
                        ]
                    }
                ]} />
                <Ionicons name="link" size={24} color={colors.coral} style={{ position: 'absolute' }} />
            </View>

            {/* Carte du Bas (Mot 2) */}
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth, shadowColor: themeColors.text }]}>
                <Text 
                    style={[styles.wordText, { color: themeColors.text }]} 
                    numberOfLines={1} 
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.5}
                >
                    {word2}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        width: '100%',
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        paddingVertical: spacing.sm, 
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 65, 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    wordText: {
        ...typography.titleLarge,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 2,
        fontSize: 28,
        fontWeight: '900',
    },
    linkContainer: {
        marginVertical: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 40,
    },
    ring: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderStyle: 'dashed',
        position: 'absolute',
    }
});