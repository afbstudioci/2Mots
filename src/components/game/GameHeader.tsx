import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';

interface GameHeaderProps {
    level: number;
    currentXp: number;
    xpNeeded: number;
}

export default function GameHeader({ level, currentXp, xpNeeded }: GameHeaderProps) {
    const { themeColors } = useTheme();
    // Calcul du pourcentage de progression vers le prochain niveau
    const progress = xpNeeded > 0 ? (currentXp / xpNeeded) * 100 : 0;

    return (
        <View style={styles.container}>
            <Text style={[styles.levelText, { color: themeColors.text }]}>NIVEAU {level}</Text>
            <View style={[styles.xpTrack, { backgroundColor: themeColors.overlayMedium }]}>
                <View style={[styles.xpBar, { width: `${progress}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md, // Laisse de l'espace pour la status bar gérée par ScreenWrapper
        paddingBottom: spacing.sm,
    },
    levelText: {
        ...typography.titleLarge,
        fontSize: 20,
    },
    xpTrack: {
        width: 100,
        height: 6,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    xpBar: {
        height: '100%',
        backgroundColor: colors.mint,
        borderRadius: borderRadius.xl,
    }
});