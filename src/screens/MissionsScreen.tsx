//src/screens/MissionsScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, DeviceEventEmitter, Animated, Alert, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EmptyState from '../components/common/EmptyState';
import AppLoader from '../components/common/AppLoader';
import { useData } from '../context/DataContext';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '../components/common/CustomAlert';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type MissionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Missions'>;

export default function MissionsScreen() {
    const navigation = useNavigation<MissionsScreenNavigationProp>();
    const { themeColors } = useTheme();
    const { user, refreshProfile } = useAuth();
    const { missions, isLoading, updateMissions } = useData();
    const [error, setError] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [referralCode, setReferralCode] = useState('');
    const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' });
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
            await Promise.all([updateMissions(), refreshProfile()]);
        } catch (err) {
            setError(true);
        }
    };

    const handleClaim = async (missionId: string) => {
        setClaimingId(missionId);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            await api.post(`/missions/claim/${missionId}`);
            await Promise.all([updateMissions(), refreshProfile()]);
            setAlertConfig({ visible: true, title: 'Succès !', message: 'Récompense récupérée avec succès.', type: 'success' });
        } catch (e) {
            setAlertConfig({ visible: true, title: 'Oups', message: 'Erreur lors de la récupération.', type: 'error' });
        } finally {
            setClaimingId(null);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Rejoins-moi sur 2MOTS ! Utilise mon code ${user?.referralCode} pour gagner 100 Kevs dès ton inscription. Télécharge l'app ici : https://2mots.app`,
            });
        } catch (error) {
            console.log("Share error", error);
        }
    };

    const submitReferral = async () => {
        if (!referralCode.trim()) return;
        setIsSubmittingReferral(true);
        try {
            const response = await api.post('/friends/referral', { code: referralCode.trim() });
            setAlertConfig({ visible: true, title: 'Félicitations', message: response.data.message, type: 'success' });
            setReferralCode('');
            await refreshProfile();
        } catch (e: any) {
            setAlertConfig({ visible: true, title: 'Invalide', message: e.response?.data?.message || "Ce code n'existe pas.", type: 'error' });
        } finally {
            setIsSubmittingReferral(false);
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
                {/* Parrainage Section */}
                <View style={[styles.referralCard, { backgroundColor: themeColors.card }]}>
                    <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.referralHeader}>
                        <Ionicons name="people" size={24} color={colors.white} />
                        <Text style={styles.referralTitle}>PARRAINAGE</Text>
                    </LinearGradient>
                    
                    <View style={styles.referralBody}>
                        <Text style={[styles.referralDesc, { color: themeColors.textSecondary }]}>
                            Invite tes amis et gagne <Text style={{ color: colors.coral, fontWeight: 'bold' }}>500 Kevs</Text> par ami parrainé !
                        </Text>
                        
                        <View style={[styles.codeBox, { backgroundColor: themeColors.surface }]}>
                            <Text style={[styles.codeLabel, { color: themeColors.textSecondary }]}>TON CODE :</Text>
                            <Text style={[styles.codeText, { color: themeColors.text }]}>{user?.referralCode || '...'}</Text>
                            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                                <Ionicons name="share-social" size={20} color={colors.coral} />
                            </TouchableOpacity>
                        </View>

                        {!user?.referredBy && (
                            <View style={styles.inputRow}>
                                <TextInput 
                                    style={[styles.referralInput, { color: themeColors.text, backgroundColor: themeColors.surface }]}
                                    placeholder="Code d'un ami ?"
                                    placeholderTextColor={themeColors.textSecondary}
                                    value={referralCode}
                                    onChangeText={setReferralCode}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity 
                                    onPress={submitReferral} 
                                    disabled={isSubmittingReferral}
                                    style={[styles.submitBtn, { backgroundColor: colors.coral }]}
                                >
                                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

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
                                        onPress={() => mission.targetAction && navigation.navigate(mission.targetAction as any)}
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

            <CustomAlert 
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </ScreenWrapper>
    );
}

const MissionCard = ({ mission, onClaim, isClaiming, themeColors, onPress }: any) => {
    const isReady = mission.completed && !mission.claimed;
    
    return (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.missionCard, 
                { 
                    backgroundColor: themeColors.card, 
                    borderColor: isReady ? colors.coral : themeColors.cardBorder,
                    borderWidth: isReady ? 2 : themeColors.cardBorderWidth 
                },
                mission.claimed && { opacity: 0.6 }
            ]}
        >
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignItems: 'center' },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 3 },
    scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },
    
    // Referral Styles
    referralCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.xl, borderWidth: 2, borderColor: colors.coral },
    referralHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
    referralTitle: { ...typography.buttonPrimary, color: colors.white, fontSize: 14, marginLeft: 10, letterSpacing: 2 },
    referralBody: { padding: spacing.lg },
    referralDesc: { ...typography.bodySmall, fontSize: 13, marginBottom: spacing.md, textAlign: 'center' },
    codeBox: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
    codeLabel: { fontSize: 10, fontWeight: 'bold', marginRight: 10 },
    codeText: { flex: 1, fontSize: 20, fontFamily: 'Poppins_700Bold', letterSpacing: 2 },
    shareBtn: { padding: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    referralInput: { flex: 1, height: 45, borderRadius: borderRadius.md, paddingHorizontal: 15, fontFamily: 'Poppins_600SemiBold' },
    submitBtn: { width: 45, height: 45, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

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