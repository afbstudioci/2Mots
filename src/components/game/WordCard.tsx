//src/components/game/WordCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, colors } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface WordCardProps {
    word1: string;
    word2: string;
}

export default function WordCard({ word1, word2 }: WordCardProps) {
    const { themeColors } = useTheme();
    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                <Ionicons name="leaf-outline" size={40} color={themeColors.text} />
                <Text style={[styles.wordText, { color: themeColors.text }]} numberOfLines={1} adjustsFontSizeToFit>{word1}</Text>
            </View>

            <View style={styles.linkContainer}>
                <Text style={styles.linkSymbol}>+</Text>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                <Ionicons name="nutrition-outline" size={40} color={themeColors.text} />
                <Text style={[styles.wordText, { color: themeColors.text }]} numberOfLines={1} adjustsFontSizeToFit>{word2}</Text>
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
        borderRadius: 20,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    wordText: {
        ...typography.titleLarge,
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