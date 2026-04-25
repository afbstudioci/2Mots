//src/screens/FriendsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { spacing, borderRadius, typography, colors } from '../theme/theme';

const FRIENDS = [
    { id: '1', name: 'Moussa', level: 12, status: 'online' },
    { id: '2', name: 'Sarah_92', level: 8, status: 'offline' },
    { id: '3', name: 'LienMaster', level: 25, status: 'online' },
];

export default function FriendsScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation();

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>MES AMIS</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="person-add" size={22} color={colors.coral} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { backgroundColor: themeColors.card }]}>
                    <Ionicons name="search" size={18} color={themeColors.textSecondary} />
                    <TextInput 
                        placeholder="Rechercher un ami..." 
                        placeholderTextColor={themeColors.textSecondary}
                        style={[styles.searchInput, { color: themeColors.text }]}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {FRIENDS.map((friend) => (
                    <View key={friend.id} style={[styles.friendItem, { borderBottomColor: themeColors.border }]}>
                        <View style={[styles.avatar, { backgroundColor: themeColors.surface }]}>
                            <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                                {friend.name.charAt(0).toUpperCase()}
                            </Text>
                            <View style={[
                                styles.statusDot, 
                                { backgroundColor: friend.status === 'online' ? colors.mint : themeColors.textSecondary }
                            ]} />
                        </View>
                        <View style={styles.friendInfo}>
                            <Text style={[styles.friendName, { color: themeColors.text }]}>{friend.name}</Text>
                            <Text style={[styles.friendLevel, { color: themeColors.textSecondary }]}>Niveau {friend.level}</Text>
                        </View>
                        <TouchableOpacity style={[styles.challengeButton, { borderColor: themeColors.primary }]}>
                            <Text style={[styles.challengeText, { color: themeColors.primary }]}>DÉFIER</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: { padding: spacing.xs },
    addButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    searchSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 45, borderRadius: borderRadius.md },
    searchInput: { flex: 1, marginLeft: spacing.sm, ...typography.bodySmall },
    scrollContent: { paddingHorizontal: spacing.lg },
    friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1 },
    avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    avatarText: { ...typography.titleLarge, fontSize: 20 },
    statusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.nightBlue },
    friendInfo: { flex: 1, marginLeft: spacing.md },
    friendName: { ...typography.bodyMedium, fontWeight: 'bold' },
    friendLevel: { ...typography.bodySmall, fontSize: 12 },
    challengeButton: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.sm },
    challengeText: { ...typography.bodySmall, fontSize: 10, fontWeight: 'bold' },
});