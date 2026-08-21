//src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../services/api';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EditProfileModal from '../components/profile/EditProfileModal';
import { spacing, borderRadius, typography, colors } from '../theme/theme';

export default function ProfileScreen() {
  const { themeColors } = useTheme();
  const { user, refreshProfile } = useAuth();
  const { leaderboard, updateLeaderboard } = useData();
  const navigation = useNavigation();

  const [currentUser, setCurrentUser] = useState<any>(user);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const fetchFreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data?.user) {
        setCurrentUser(res.data.data.user);
      }
    } catch {}
  };

  useEffect(() => {
    fetchFreshProfile();
    refreshProfile();
    updateLeaderboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), fetchFreshProfile(), updateLeaderboard()]);
    setRefreshing(false);
  };

  const displayUser = currentUser || user;
  const pseudo = displayUser?.login || 'Joueur';
  const initial = pseudo.charAt(0).toUpperCase();

    // Calcul du rang réel synchronisé avec le classement officiel (ou '-' si nouveau compte sans partie)
  const computeExactRank = () => {
    const hasPlayed = (displayUser?.bestScore || 0) > 0 || (displayUser?.xp || 0) > 0 || (displayUser?.level || 1) > 1;
    if (!hasPlayed) {
      return '-';
    }

    if (Array.isArray(leaderboard) && leaderboard.length > 0 && displayUser) {
      const sorted = [...leaderboard].sort((a, b) => {
        const lvlA = a.level || 1;
        const lvlB = b.level || 1;
        if (lvlB !== lvlA) return lvlB - lvlA;
        const xpA = a.xp || 0;
        const xpB = b.xp || 0;
        if (xpB !== xpA) return xpB - xpA;
        return (b.bestScore || 0) - (a.bestScore || 0);
      });

      const idx = sorted.findIndex(
        (u: any) => u._id === displayUser._id || (u.login && u.login.toLowerCase() === pseudo.toLowerCase())
      );
      if (idx !== -1) return '#' + (idx + 1);
    }

    if (displayUser?.rank && typeof displayUser.rank === 'number') {
      return '#' + displayUser.rank;
    }
    return '-';
  };

  const userRank = computeExactRank();
  const isVip = Boolean(displayUser?.isVip);
  const hasGoldenCrown = displayUser?.equippedFrame === 'frame_golden_crown' || isVip;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>MON PROFIL</Text>

        <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editButton}>
          <Ionicons name="settings-outline" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />
        }
      >
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: themeColors.surface,
              borderColor: hasGoldenCrown ? '#FBBF24' : themeColors.overlayMedium,
              borderWidth: hasGoldenCrown ? 3 : 2,
            },
          ]}
        >
          {displayUser?.avatar ? (
            <Image source={{ uri: displayUser.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: hasGoldenCrown ? '#FBBF24' : colors.coral }]}>
              {initial}
            </Text>
          )}

          {hasGoldenCrown && (
            <View style={styles.crownBadge}>
              <Ionicons name="trophy" size={13} color="#FFF" />
            </View>
          )}
        </View>

        <View style={styles.nameRow}>
          <Text style={[styles.username, { color: themeColors.text }]}>{pseudo}</Text>
          {isVip && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>VIP</Text>
            </View>
          )}
        </View>

        <Text style={[styles.email, { color: themeColors.textSecondary }]}>
          {displayUser?.email || 'email@exemple.com'}
        </Text>

        <TouchableOpacity
          style={[styles.editProfileButton, { backgroundColor: themeColors.surface }]}
          onPress={() => setEditModalVisible(true)}
        >
          <Ionicons name="pencil" size={16} color={colors.coral} />
          <Text style={[styles.editProfileText, { color: colors.coral }]}>Modifier le profil</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.statValue, { color: colors.coral }]}>{userRank}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>RANG</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.statValue, { color: colors.coral }]}>{displayUser?.level || 1}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>NIVEAU</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.statValue, { color: colors.coral }]}>{displayUser?.bestScore || 0}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>RECORD</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.statValue, { color: colors.coral }]}>{displayUser?.kevs || 0}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>KEVS</Text>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          fetchFreshProfile();
        }}
      />
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
  editButton: { padding: spacing.xs },
  headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'visible',
    position: 'relative',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 60 },
  avatarText: { ...typography.titleHuge, fontSize: 48 },
  crownBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#F59E0B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: { ...typography.titleLarge, fontSize: 24 },
  vipBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  vipBadgeText: {
    fontFamily: 'Poppins_900Black',
    fontSize: 10,
    color: '#FFF',
  },
  email: { ...typography.bodyMedium, marginBottom: spacing.xl },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 30,
    marginBottom: spacing.xl,
  },
  editProfileText: { ...typography.buttonPrimary, fontSize: 14, marginLeft: spacing.sm },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  statValue: { ...typography.titleHuge, fontSize: 28, lineHeight: 34 },
  statLabel: { ...typography.bodySmall, letterSpacing: 1, marginTop: 4 },
});