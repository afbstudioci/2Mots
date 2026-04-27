//src/components/friends/FriendCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/theme';

interface FriendCardProps {
    friend: {
        id: string;
        name: string;
        avatar?: string;
        level: number;
        status?: 'online' | 'offline';
    };
    onPress?: () => void;
    onChallenge?: () => void;
    rightElement?: React.ReactNode;
}

export default function FriendCard({ friend, onPress, onChallenge, rightElement }: FriendCardProps) {
    const { themeColors, isDark } = useTheme();

    return (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.card, 
                { 
                    backgroundColor: themeColors.card,
                    borderColor: !isDark ? colors.coral : themeColors.border,
                    borderWidth: !isDark ? 1.5 : 1,
                }
            ]}
        >
            <View style={styles.avatarContainer}>
                {friend.avatar ? (
                    <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.surface }]}>
                        <Text style={[styles.avatarText, { color: colors.coral }]}>
                            {friend.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                {friend.status === 'online' && (
                    <View style={[styles.onlineDot, { borderColor: themeColors.card }]} />
                )}
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
                    {friend.name}
                </Text>
                <View style={styles.levelBadge}>
                    <Ionicons name="star" size={10} color="#FFB84D" />
                    <Text style={[styles.levelText, { color: themeColors.textSecondary }]}>
                        NIVEAU {friend.level}
                    </Text>
                </View>
            </View>

            {rightElement ? (
                <View style={styles.rightSection}>{rightElement}</View>
            ) : (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        onPress={onChallenge}
                        style={[styles.challengeBtn, { backgroundColor: colors.coral }]}
                    >
                        <Text style={styles.challengeBtnText}>DÉFI</Text>
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        ...shadows.soft(false),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
    },
    avatarPlaceholder: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.mint,
        borderWidth: 2,
    },
    info: {
        flex: 1,
        marginLeft: spacing.md,
    },
    name: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 2,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelText: {
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    rightSection: {
        marginLeft: spacing.sm,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    challengeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.lg,
        marginRight: spacing.sm,
    },
    challengeBtnText: {
        color: colors.white,
        fontSize: 10,
        fontFamily: 'Poppins_800ExtraBold',
    },
});
