//src/components/game/GamePlayArea.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface GamePlayAreaProps {
    timeLeft: number;
    currentPair: any;
    slideWordsAnim: Animated.Value;
}

export default function GamePlayArea({ currentPair, slideWordsAnim }: GamePlayAreaProps) {
    // Sécurisation des données si l'API renvoie des noms de champs légèrement différents
    const word1 = currentPair?.word1 || currentPair?.firstWord || "";
    const word2 = currentPair?.word2 || currentPair?.secondWord || "";

    return (
        <Animated.View style={[styles.container, { transform: [{ translateX: slideWordsAnim }] }]}>
            {/* Premier mot */}
            <View style={styles.wordRow}>
                <Ionicons name="leaf-outline" size={32} color={colors.nightBlue} style={styles.icon} />
                <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>
                    {word1}
                </Text>
            </View>

            {/* Symbole de liaison */}
            <View style={styles.linkContainer}>
                <Text style={styles.linkSymbol}>+</Text>
            </View>

            {/* Deuxième mot */}
            <View style={styles.wordRow}>
                <Ionicons name="nutrition-outline" size={32} color={colors.nightBlue} style={styles.icon} />
                <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>
                    {word2}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: spacing.sm,
        opacity: 0.8,
    },
    wordText: {
        ...typography.titleHuge,
        color: colors.nightBlue,
        textTransform: 'capitalize',
        lineHeight: 50, // Permet de bien tasser les mots l'un sur l'autre
    },
    linkContainer: {
        marginVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkSymbol: {
        ...typography.titleLarge,
        color: colors.coral,
        fontSize: 36,
    }
});