import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EmptyState from '../components/common/EmptyState';
import AppLoader from '../components/common/AppLoader';
import { useMissions } from '../hooks/useMissions';
import { spacing, borderRadius, typography, colors } from '../theme/theme';

export default function MissionsScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation();
    const { missions, isLoading, fetchMissions } = useMissions();
    const [timedOut, setTimedOut] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) setTimedOut(true);
        }, 10000);

        loadMissions();

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    const loadMissions = async () => {
        try {
            setError(false);
            setTimedOut(false);
            await fetchMissions();
        } catch (err) {
            setError(true);
        }
    };

    if ((isLoading || error || timedOut) && missions.length === 0) {
        return (
            <ScreenWrapper>
                <AppLoader 
                    error={error || timedOut} 
                    onRetry={() => {
                        loadMissions();
                    }} 
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>MISSIONS</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                contentContainerStyle={missions.length === 0 ? styles.emptyScrollContent : styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchMissions} tintColor={colors.coral} />
                }
            >
                {missions.length === 0 ? (
                    <EmptyState 
                        icon="rocket"
                        iconColor={colors.coral}
                        title="Pas de Mission"
                        message="L'ordre des mots est en paix. Reposez-vous, aucune nouvelle mission n'a été détectée."
                        actionLabel="Scanner à nouveau"
                        onAction={fetchMissions}
                    />
                ) : (
                    missions.map((mission) => (
                        <View key={mission.id} style={[styles.missionCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                            <View style={styles.missionInfo}>
                                <Text style={[styles.missionTitle, { color: mission.completed ? colors.mint : themeColors.text }]}>
                                    {mission.title.toUpperCase()}
                                </Text>
                                <Text style={[styles.missionDesc, { color: themeColors.textSecondary }]}>{mission.desc}</Text>
                            </View>
                            
                            <View style={styles.progressRow}>
                                <View style={[styles.progressBarBg, { backgroundColor: themeColors.surface }]}>
                                    <View 
                                        style={[
                                            styles.progressBarFill, 
                                            { 
                                                backgroundColor: mission.completed ? colors.mint : colors.coral,
                                                width: `${(mission.progress / mission.total) * 100}%` 
                                            }
                                        ]} 
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: themeColors.text }]}>
                                    {mission.progress}/{mission.total}
                                </Text>
                            </View>

                            <View style={styles.rewardRow}>
                                <View style={styles.reward}>
                                    <Ionicons name="diamond" size={14} color={colors.mint} />
                                    <Text style={[styles.rewardText, { color: colors.mint }]}>+{mission.reward} Kevs</Text>
                                </View>
                                {mission.completed && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.mint} />
                                )}
                            </View>
                        </View>
                    ))
                )}
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
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    headerSpacer: { width: 32 },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
    emptyScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    missionCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    missionInfo: { marginBottom: spacing.md },
    missionTitle: { ...typography.buttonPrimary, fontSize: 16, marginBottom: 4 },
    missionDesc: { ...typography.bodySmall, fontSize: 13 },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    progressBarBg: { flex: 1, height: 8, borderRadius: 4, marginRight: spacing.md, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressText: { ...typography.bodySmall, fontSize: 12, fontWeight: 'bold', minWidth: 40 },
    rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    reward: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    rewardText: { ...typography.bodySmall, fontWeight: 'bold', marginLeft: 4 },
});