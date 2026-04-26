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
        <View style={[
            styles.container, 
            { 
                backgroundColor: themeColors.card,
                borderColor: themeColors.cardBorder,
                borderWidth: themeColors.cardBorderWidth,
                shadowColor: themeColors.text
            }
        ]}>
            <Text style={[styles.levelText, { color: themeColors.text }]}>NIVEAU {level}</Text>
            <View style={[styles.xpTrack, { backgroundColor: themeColors.overlayLight }]}>
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
        marginHorizontal: spacing.xl,
        marginTop: spacing.md, 
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
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