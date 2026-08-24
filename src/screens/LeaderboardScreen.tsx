//src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/theme';
import api from '../services/api';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import LeaderboardItem from '../components/leaderboard/LeaderboardItem';
import LeaderboardUserDetailModal from '../components/leaderboard/LeaderboardUserDetailModal';

export default function LeaderboardScreen() {
  const { leaderboard: cachedLeaderboard, updateLeaderboard } = useData();
  const navigation = useNavigation();
  const { themeColors } = useTheme();

  const [leaderboardData, setLeaderboardData] = useState<any[]>(cachedLeaderboard || []);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<{ user: any; rank: number } | null>(null);

  const screenFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [screenFadeAnim]);

  const fetchLiveLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/leaderboard', { params: { t: Date.now() }, timeout: 5000 });
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        setLeaderboardData(data);
      }
      await updateLeaderboard();
    } catch {}
  }, [updateLeaderboard]);

  useEffect(() => {
    fetchLiveLeaderboard();
  }, [fetchLiveLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveLeaderboard();
    setRefreshing(false);
  };

  const sortedList = [...leaderboardData].sort((a, b) => {
    const lvlA = a.level || 1;
    const lvlB = b.level || 1;
    if (lvlB !== lvlA) return lvlB - lvlA;

    const xpA = a.xp || 0;
    const xpB = b.xp || 0;
    if (xpB !== xpA) return xpB - xpA;

    const scoreA = a.bestScore || 0;
    const scoreB = b.bestScore || 0;
    return scoreB - scoreA;
  });

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
          data={sortedList}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />
          }
          renderItem={({ item, index }) => {
            const rank = index + 1;
            return (
              <View>
                {rank === 4 && renderRisingStarsHeader()}
                <LeaderboardItem
                  rank={rank}
                  user={item}
                  index={index}
                  onPress={(user, r) => setSelectedUserDetail({ user, rank: r })}
                />
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />

        {/* Modale d'inspection de profil joueur sans coupure de texte */}
        <LeaderboardUserDetailModal
          visible={Boolean(selectedUserDetail)}
          data={selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
        />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    fontFamily: 'Poppins_800ExtraBold',
    color: colors.coral,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: 1,
  },
  titleBottom: {
    fontFamily: 'Poppins_800ExtraBold',
    color: colors.coral,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: 1,
    marginTop: -4,
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
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  listContent: { paddingBottom: spacing.xl * 3 },
});