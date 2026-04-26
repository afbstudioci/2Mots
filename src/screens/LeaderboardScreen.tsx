//src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing } from '../theme/theme';
import api from '../services/api';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import LeaderboardItem from '../components/leaderboard/LeaderboardItem';

export default function LeaderboardScreen() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigation = useNavigation();
    const { themeColors } = useTheme();

    // Animation de fondu uniquement (pas de slide)
    const screenFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setError(false);
            const response = await api.get('/leaderboard');
            setPlayers(response.data.data);
            
            // Apparition en fondu doux
            Animated.timing(screenFadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator color={colors.coral} size="large" />
                </View>
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
                    data={players}
                    keyExtractor={(item) => item._id}
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