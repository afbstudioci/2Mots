//src/components/game/WordCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface WordCardProps {
    word1: string;
    word2: string;
}

export default function WordCard({ word1, word2 }: WordCardProps) {
    return (
        <View style={styles.container}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    icon: {
        marginRight: spacing.sm,
        opacity: 0.8,
    },
    wordText: {
        ...typography.titleHuge,
        color: colors.nightBlue,
        textTransform: 'capitalize',
        lineHeight: 50,
    },
    linkContainer: {
        marginVertical: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkSymbol: {
        ...typography.titleLarge,
        color: colors.coral,
        fontSize: 36,
    }
});