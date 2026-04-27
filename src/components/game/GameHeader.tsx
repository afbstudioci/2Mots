//src/components/game/GameHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface GameHeaderProps {
    level: number;
    currentXp: number;
    xpNeeded: number;
}

export default function GameHeader({ level, currentXp, xpNeeded }: GameHeaderProps) {
    const { themeColors } = useTheme();
    const navigation = useNavigation();
    
    // Calcul du pourcentage de progression vers le prochain niveau
    const progress = xpNeeded > 0 ? (currentXp / xpNeeded) * 100 : 0;

    return (
        <View style={styles.container}>
            {/* Bouton Retour dissimulé dans le design */}
            <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={[styles.backBtn, { backgroundColor: themeColors.overlayLight }]}
            >
                <Ionicons name="chevron-back" size={24} color={themeColors.text} />
            </TouchableOpacity>

            <View style={[
                styles.statCard, 
                { 
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.cardBorder,
                    borderWidth: themeColors.cardBorderWidth,
                    shadowColor: themeColors.text
                }
            ]}>
                <View style={styles.levelRow}>
                    <Text style={[styles.levelLabel, { color: themeColors.textSecondary }]}>NIVEAU</Text>
                    <Text style={[styles.levelValue, { color: themeColors.text }]}>{level}</Text>
                </View>
                
                <View style={styles.xpWrapper}>
                    <View style={styles.xpInfo}>
                        <Text style={[styles.xpText, { color: themeColors.textSecondary }]}>Progression</Text>
                        <Text style={[styles.xpText, { color: themeColors.text }]}>{currentXp}/{xpNeeded}</Text>
                    </View>
                    <View style={[styles.xpTrack, { backgroundColor: themeColors.overlayLight }]}>
                        <View style={[styles.xpBar, { width: `${progress}%` }]} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        gap: spacing.md,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    levelRow: {
        alignItems: 'center',
        marginRight: spacing.lg,
        paddingRight: spacing.lg,
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.05)',
    },
    levelLabel: {
        ...typography.bodySmall,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    levelValue: {
        ...typography.titleLarge,
        fontSize: 24,
        lineHeight: 28,
        fontWeight: '900',
    },
    xpWrapper: {
        flex: 1,
    },
    xpInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    xpText: {
        ...typography.bodySmall,
        fontSize: 10,
        fontWeight: '600',
    },
    xpTrack: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    xpBar: {
        height: '100%',
        backgroundColor: colors.mint,
        borderRadius: 3,
    }
});