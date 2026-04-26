//src/components/game/GamePlayArea.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, typography, spacing } from '../../theme/theme';

interface GamePlayAreaProps {
    currentPair: any;
}

export default function GamePlayArea({ currentPair }: GamePlayAreaProps) {
    const { themeColors } = useTheme();
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

            {/* Le grand symbole + central, mais optimisé */}
            <View style={styles.linkContainer}>
                <Text style={styles.linkSymbol}>+</Text>
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
        borderRadius: 24,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110, // Assure une belle prestance sans forcer sur le padding
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
    },
    wordText: {
        ...typography.titleHuge,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 6,
        fontSize: 40,
        fontWeight: '900',
    },
    linkContainer: {
        marginVertical: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    linkSymbol: {
        color: colors.coral,
        fontSize: 56,
        fontWeight: '200',
        includeFontPadding: false,
    }
});