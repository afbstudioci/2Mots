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
            <View style={styles.card}>
                <Ionicons name="leaf-outline" size={40} color={colors.white} />
                <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>{word1}</Text>
            </View>

            <View style={styles.linkContainer}>
                <Text style={styles.linkSymbol}>+</Text>
            </View>

            <View style={styles.card}>
                <Ionicons name="nutrition-outline" size={40} color={colors.white} />
                <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>{word2}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    card: {
        flex: 1,
        backgroundColor: colors.nightBlue,
        borderRadius: 20,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    wordText: {
        ...typography.titleLarge,
        color: colors.white,
        textTransform: 'uppercase',
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    linkContainer: {
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkSymbol: {
        ...typography.titleHuge,
        color: colors.coral,
        fontSize: 40,
    }
});