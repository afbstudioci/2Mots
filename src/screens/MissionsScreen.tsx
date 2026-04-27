//src/screens/MissionsScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, DeviceEventEmitter, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EmptyState from '../components/common/EmptyState';
import AppLoader from '../components/common/AppLoader';
import { useData } from '../context/DataContext';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

export default function MissionsScreen() {
    const { themeColors } = useTheme();
    const { missions, isLoading, updateMissions } = useData();
    const [error, setError] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('SCROLL_TO_TOP_Missions', () => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        });
        return () => sub.remove();
    }, []);

    const onRefresh = async () => {
        try {
            setError(false);
            await updateMissions();
        } catch (err) {
            setError(true);
        }
    };

    const handleClaim = async (missionId: string) => {
        setClaimingId(missionId);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            await api.post(`/missions/claim/${missionId}`);
            await updateMissions(); // Rafraîchir pour voir l'état 'claimed'
        } catch (e) {
            Alert.alert("Erreur", "Erreur lors de la réclamation");
        } finally {
            setClaimingId(null);
        }
    };

    if (isLoading && missions.length === 0) {
        return (
            <ScreenWrapper>
                <AppLoader error={error} onRetry={onRefresh} />
            </ScreenWrapper>
        );
    }

    const dailyMissions = missions.filter(m => m.type === 'daily');
    const achievements = missions.filter(m => m.type === 'achievement');

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>OBJECTIFS</Text>
            </View>

            <ScrollView 
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.coral} />
                }
            >
                {missions.length === 0 ? (
                    <EmptyState 
                        icon="rocket"
                        iconColor={colors.coral}
                        title="Zone Calme"
                        message="Toutes les missions ont été accomplies. Revenez demain pour de nouveaux défis !"
                    />
                ) : (
                    <>
                        {dailyMissions.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>MISSIONS QUOTIDIENNES</Text>
                                {dailyMissions.map((mission) => (
                                    <MissionCard 
                                        key={mission.id} 
                                        mission={mission} 
                                        onClaim={() => handleClaim(mission.id)}
                                        isClaiming={claimingId === mission.id}
                                        themeColors={themeColors}
                                    />
                                ))}
                            </View>
                        )}

                        {achievements.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>HAUTS FAITS</Text>
                                {achievements.map((mission) => (
                                    <MissionCard 
                                        key={mission.id} 
                                        mission={mission} 
                                        onClaim={() => handleClaim(mission.id)}
                                        isClaiming={claimingId === mission.id}
                                        themeColors={themeColors}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const MissionCard = ({ mission, onClaim, isClaiming, themeColors }: any) => {
    const isReady = mission.completed && !mission.claimed;
    
    return (
        <View style={[
            styles.missionCard, 
            { backgroundColor: themeColors.card, borderColor: isReady ? colors.coral : themeColors.border },
            mission.claimed && { opacity: 0.6 }
        ]}>
            <View style={styles.missionHeader}>
                <View style={styles.missionInfo}>
                    <Text style={[
                        styles.missionTitle, 
                        { color: mission.claimed ? colors.mint : themeColors.text }
                    ]}>
                        {mission.title.toUpperCase()}
                    </Text>
                    <Text style={[styles.missionDesc, { color: themeColors.textSecondary }]}>{mission.desc}</Text>
                </View>
                {mission.claimed ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.mint} />
                ) : (
                    <View style={[styles.rewardBadge, { backgroundColor: themeColors.surface }]}>
                        <Ionicons name="diamond" size={12} color={colors.mint} />
                        <Text style={[styles.rewardText, { color: colors.mint }]}>+{mission.reward}</Text>
                    </View>
                )}
            </View>
            
            {!mission.claimed && (
                <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                        <View style={[styles.progressBarBg, { backgroundColor: themeColors.surface }]}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        backgroundColor: mission.completed ? colors.mint : colors.coral,
                                        width: `${Math.min(100, (mission.progress / mission.targetValue) * 100)}%` 
                                    }
                                ]} 
                            />
                        </View>
                        <Text style={[styles.progressText, { color: themeColors.text }]}>
                            {mission.progress}/{mission.targetValue}
                        </Text>
                    </View>

                    {isReady && (
                        <TouchableOpacity 
                            onPress={onClaim}
                            disabled={isClaiming}
                            style={[styles.claimButton, { backgroundColor: colors.coral }]}
                        >
                            <Text style={styles.claimButtonText}>RÉCUPÉRER</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignItems: 'center' },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 3 },
    scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },
    section: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.bodySmall, fontSize: 10, letterSpacing: 2, marginBottom: spacing.md, marginLeft: spacing.xs },
    missionCard: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1 },
    missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    missionInfo: { flex: 1, marginRight: spacing.md },
    missionTitle: { ...typography.buttonPrimary, fontSize: 15, marginBottom: 4 },
    missionDesc: { ...typography.bodySmall, fontSize: 12, lineHeight: 16 },
    rewardBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    rewardText: { ...typography.buttonPrimary, fontSize: 11, marginLeft: 4 },
    progressSection: { marginTop: spacing.xs },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    progressBarBg: { flex: 1, height: 6, borderRadius: 3, marginRight: spacing.md, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { ...typography.bodySmall, fontSize: 11, fontWeight: 'bold', minWidth: 35 },
    claimButton: { marginTop: spacing.md, paddingVertical: 10, borderRadius: borderRadius.md, alignItems: 'center', shadowColor: colors.coral, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
    claimButtonText: { ...typography.buttonPrimary, color: colors.white, fontSize: 12, letterSpacing: 1 },
});