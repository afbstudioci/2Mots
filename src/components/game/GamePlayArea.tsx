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
            {/* Mot 1 : En haut à gauche, icône à droite */}
            <View style={styles.wordRowLeft}>
                <Text style={styles.wordText}>{word1}</Text>
                <DynamicIcon iconString={icon1} size={38} color={colors.white} />
            </View>

            {/* Symbole + */}
            <View style={styles.linkContainer}>
                <Text style={styles.linkSymbol}>+</Text>
            </View>

            {/* Mot 2 : En bas à droite, icône à gauche */}
            <View style={styles.wordRowRight}>
                <DynamicIcon iconString={icon2} size={38} color={colors.white} />
                <Text style={styles.wordText}>{word2}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    wordRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    wordRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    wordText: {
        ...typography.titleHuge,
        color: colors.white,
        textTransform: 'uppercase',
        marginHorizontal: spacing.sm,
    },
    linkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.xs,
    },
    linkSymbol: {
        ...typography.titleLarge,
        color: colors.coral,
        fontSize: 40,
    }
});