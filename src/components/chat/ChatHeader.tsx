//src/components/chat/ChatHeader.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, colors, typography } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface ChatHeaderProps {
    friendName: string;
    friendAvatar?: string;
    isOnline?: boolean;
    onBack: () => void;
    onSettings: () => void;
    onCall?: () => void;
    onVideo?: () => void;
}

export default function ChatHeader({ 
    friendName, 
    friendAvatar, 
    isOnline = true, 
    onBack, 
    onSettings,
    onCall,
    onVideo
}: ChatHeaderProps) {
    const { themeColors } = useTheme();

    return (
        <View style={[styles.header, { borderBottomColor: themeColors.overlayLight }]}>
            <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={28} color={themeColors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileArea} activeOpacity={0.7}>
                {friendAvatar ? (
                    <Image source={{ uri: friendAvatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.coral + '20' }]}>
                        <Text style={styles.avatarInitial}>{friendName.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.infoArea}>
                    <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
                        {friendName}
                    </Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.mint : themeColors.textSecondary }]} />
                        <Text style={[styles.statusText, { color: isOnline ? colors.mint : themeColors.textSecondary }]}>
                            {isOnline ? 'En ligne' : 'Hors ligne'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onCall} style={styles.iconBtn}>
                    <Ionicons name="call-outline" size={22} color={themeColors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onVideo} style={styles.iconBtn}>
                    <Ionicons name="videocam-outline" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onSettings} style={styles.iconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={themeColors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        height: 70,
    },
    iconBtn: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: colors.coral,
    },
    infoArea: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'Poppins_600SemiBold',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
