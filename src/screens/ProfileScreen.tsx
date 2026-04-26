//src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EditProfileModal from '../components/profile/EditProfileModal';
import { spacing, borderRadius, typography } from '../theme/theme';

export default function ProfileScreen() {
    const { themeColors } = useTheme();
    const { user, refreshProfile } = useAuth();
    const navigation = useNavigation();
    
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        // Rafraichissement silencieux au montage pour s'assurer que les stats sont a jour
        refreshProfile();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshProfile();
        setRefreshing(false);
    };

    // CORRECTION : Remplacement de username par login
    const pseudo = user?.login || 'Joueur';
    const initial = pseudo.charAt(0).toUpperCase();

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>MON PROFIL</Text>
                
                {/* Remplacement du headerSpacer par le bouton d'édition */}
                <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editButton}>
                    <Ionicons name="settings-outline" size={24} color={themeColors.text} />
                </TouchableOpacity>
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
                    {/* Gestion de l'affichage de l'image de profil Cloudinary */}
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                    ) : (
                        <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                            {initial}
                        </Text>
                    )}
                </View>

                <Text style={[styles.username, { color: themeColors.text }]}>
                    {pseudo}
                </Text>
                <Text style={[styles.email, { color: themeColors.textSecondary }]}>
                    {user?.email || 'email@exemple.com'}
                </Text>

                {/* Bouton d'édition central */}
                <TouchableOpacity 
                    style={[styles.editProfileButton, { backgroundColor: themeColors.surface }]}
                    onPress={() => setEditModalVisible(true)}
                >
                    <Ionicons name="pencil" size={16} color={themeColors.primary} />
                    <Text style={[styles.editProfileText, { color: themeColors.primary }]}>Modifier le profil</Text>
                </TouchableOpacity>

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

            {/* Intégration de la modale */}
            <EditProfileModal 
                visible={isEditModalVisible} 
                onClose={() => setEditModalVisible(false)} 
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    backButton: { padding: spacing.xs },
    editButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    scrollContent: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
    avatarContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { ...typography.titleHuge, fontSize: 48 },
    username: { ...typography.titleLarge, fontSize: 24, marginBottom: 4 },
    email: { ...typography.bodyMedium, marginBottom: spacing.xl },
    editProfileButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 30, marginBottom: spacing.xl },
    editProfileText: { ...typography.buttonPrimary, fontSize: 14, marginLeft: spacing.sm },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: spacing.sm },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, borderRadius: borderRadius.lg },
    statValue: { ...typography.titleHuge, fontSize: 28, lineHeight: 34 },
    statLabel: { ...typography.bodySmall, letterSpacing: 1, marginTop: 4 },
});