//src/components/game/GamePlayArea.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/theme';
import DynamicIcon from '../common/DynamicIcon';

interface GamePlayAreaProps {
    currentPair: any;
}

export default function GamePlayArea({ currentPair }: GamePlayAreaProps) {
    if (!currentPair) return null;

    const word1 = (currentPair.word1 || "").toUpperCase();
    const word2 = (currentPair.word2 || "").toUpperCase();
    const icon1 = currentPair.icon1 || "Ionicons:help-circle-outline";
    const icon2 = currentPair.icon2 || "Ionicons:help-circle-outline";

    return (
        <View style={styles.container}>
            {/* Carte Mot 1 */}
            <View style={styles.card}>
                <DynamicIcon iconString={icon1} size={48} color={colors.white} />
                <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>{word1}</Text>
            </View>

            {/* Symbole + */}
            <View style={styles.linkContainer}>
                <Text style={styles.linkSymbol}>+</Text>
            </View>

            {/* Carte Mot 2 */}
            <View style={styles.card}>
                <DynamicIcon iconString={icon2} size={48} color={colors.white} />
                <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>{word2}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        width: '100%',
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
    },
    wordText: {
        ...typography.titleLarge,
        color: colors.white,
        textTransform: 'uppercase',
        marginTop: spacing.md,
        textAlign: 'center',
    },
    linkContainer: {
        marginHorizontal: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkSymbol: {
        ...typography.titleHuge,
        color: colors.coral,
        fontSize: 48,
    }
});