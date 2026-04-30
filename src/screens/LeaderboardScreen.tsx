//src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/theme';
import api from '../services/api';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import LeaderboardItem from '../components/leaderboard/LeaderboardItem';
import AppLoader from '../components/common/AppLoader';

export default function LeaderboardScreen() {
    const { leaderboard, isLoading, updateLeaderboard } = useData();
    const navigation = useNavigation();
    const { themeColors } = useTheme();

    const [error, setError] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const screenFadeAnim = useRef(new Animated.Value(1)).current; // Directement à 1 car data déjà là

    const onRefresh = async () => {
        try {
            await updateLeaderboard();
        } catch (err) {
            console.log('Error refreshing leaderboard');
        }
    };

    // Si on arrive et qu'il n'y a rien (cas rare), on lance un chargement
    useEffect(() => {
        if (leaderboard.length === 0 && !isLoading) {
            onRefresh();
        }
    }, []);

    if (isLoading && leaderboard.length === 0) {
        return (
            <ScreenWrapper>
                <AppLoader error={error || timedOut} onRetry={onRefresh} />
            </ScreenWrapper>
        );
    }

    const renderRisingStarsHeader = () => (
        <View style={styles.risingStarsContainer}>
            <Text style={[styles.risingStarsText, { color: themeColors.textSecondary }]}>ÉTOILES MONTANTES</Text>
            <Ionicons name="trending-up" size={18} color={themeColors.textSecondary} />
        </View>
    );

    return (
        <ScreenWrapper>
            <Animated.View style={[styles.container, { opacity: screenFadeAnim }]}>
                
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.coral} />
                    </TouchableOpacity>
                    
                    <View style={styles.titleContainer}>
                        <Ionicons name="stats-chart" size={32} color={colors.coral} style={styles.headerIcon} />
                        <View>
                            <Text style={styles.titleTop}>TOP 10</Text>
                            <Text style={styles.titleBottom}>MONDIAL</Text>
                        </View>
                    </View>
                </View>

                <FlatList
                    data={[...leaderboard].sort((a, b) => {
                        if ((b.level || 1) !== (a.level || 1)) return (b.level || 1) - (a.level || 1);
                        return (b.xp || 0) - (a.xp || 0);
                    })}
                    keyExtractor={(item) => item._id}
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    renderItem={({ item, index }) => {
                        const rank = index + 1;
                        return (
                            <View>
                                {rank === 4 && renderRisingStarsHeader()}
                                <LeaderboardItem 
                                    rank={rank} 
                                    user={item} 
                                    index={index} 
                                />
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.xl * 2,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    backButton: { marginRight: spacing.md },
    titleContainer: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { marginRight: spacing.sm, marginTop: 4 },
    titleTop: {
        fontFamily: 'Poppins_800ExtraBold', color: colors.coral, fontSize: 28, lineHeight: 30, letterSpacing: 1
    },
    titleBottom: {
        fontFamily: 'Poppins_800ExtraBold', color: colors.coral, fontSize: 28, lineHeight: 30, letterSpacing: 1, marginTop: -4
    },
    risingStarsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    risingStarsText: {
        fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 2
    },
    listContent: { paddingBottom: spacing.xl * 3 },
});