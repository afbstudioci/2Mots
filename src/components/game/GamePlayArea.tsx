//src/components/game/GamePlayArea.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/theme';

interface GamePlayAreaProps {
    currentPair: any;
}

export default function GamePlayArea({ currentPair }: GamePlayAreaProps) {
    if (!currentPair) return null;

    const word1 = (currentPair.word1 || "").toUpperCase();
    const word2 = (currentPair.word2 || "").toUpperCase();

    return (
        <View style={styles.container}>
            {/* Carte du Haut (Mot 1) */}
            <View style={styles.card}>
                <Text 
                    style={styles.wordText} 
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
            <View style={styles.card}>
                <Text 
                    style={styles.wordText} 
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
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        minHeight: 110, // Assure une belle prestance sans forcer sur le padding
        shadowColor: colors.white,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
    },
    wordText: {
        ...typography.titleHuge,
        color: colors.white,
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