//src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { spacing, borderRadius, typography } from '../theme/theme';

export default function ProfileScreen() {
    const { themeColors } = useTheme();
    const { user, refreshProfile } = useAuth();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        // Rafraichissement silencieux au montage pour s'assurer que les stats sont a jour
        refreshProfile();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshProfile();
        setRefreshing(false);
    };

    const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'J';

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>MON PROFIL</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor={themeColors.primary} 
                    />
                }
            >
                <View style={[styles.avatarContainer, { backgroundColor: themeColors.surface }]}>
                    <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                        {initial}
                    </Text>
                </View>

                <Text style={[styles.username, { color: themeColors.text }]}>
                    {user?.username || 'Joueur'}
                </Text>
                <Text style={[styles.email, { color: themeColors.textSecondary }]}>
                    {user?.email || 'email@exemple.com'}
                </Text>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
                        <Text style={[styles.statValue, { color: themeColors.primary }]}>{user?.level || 1}</Text>
                        <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>NIVEAU</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
                        <Text style={[styles.statValue, { color: themeColors.primary }]}>{user?.bestScore || 0}</Text>
                        <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>RECORD</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
                        <Text style={[styles.statValue, { color: themeColors.primary }]}>{user?.kevs || 0}</Text>
                        <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>KEVS</Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    backButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    headerSpacer: { width: 32 },
    scrollContent: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
    avatarContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)' },
    avatarText: { ...typography.titleHuge, fontSize: 48 },
    username: { ...typography.titleLarge, fontSize: 24, marginBottom: 4 },
    email: { ...typography.bodyMedium, marginBottom: spacing.xl * 2 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: spacing.sm },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, borderRadius: borderRadius.lg },
    statValue: { ...typography.titleHuge, fontSize: 28, lineHeight: 34 },
    statLabel: { ...typography.bodySmall, letterSpacing: 1, marginTop: 4 },
});