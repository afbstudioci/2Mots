//src/components/game/GameHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/theme';

interface GameHeaderProps {
    currentIndex: number;
    totalWords: number;
}

export default function GameHeader({ currentIndex, totalWords }: GameHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>Étape</Text>
            <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{currentIndex + 1} / {totalWords}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md,
    },
    headerText: { fontFamily: 'Poppins_500Medium', color: colors.sand, fontSize: 16, opacity: 0.8 },
    badgeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs, borderRadius: borderRadius.xl
    },
    badgeText: { fontFamily: 'Poppins_700Bold', color: colors.sand, fontSize: 14 },
});