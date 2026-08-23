//src/components/leaderboard/LeaderboardUserDetailModal.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme/theme';

interface LeaderboardUserDetailModalProps {
  visible: boolean;
  data: {
    rank: number;
    user: {
      login: string;
      bestScore: number;
      xp?: number;
      level?: number;
      avatar?: string;
    };
  } | null;
  onClose: () => void;
}

export default function LeaderboardUserDetailModal({
  visible,
  data,
  onClose,
}: LeaderboardUserDetailModalProps) {
  const { themeColors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && data) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 65, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.75);
      opacityAnim.setValue(0);
    }
  }, [visible, data]);

  if (!visible || !data) return null;

  const { rank, user } = data;
  const isPodium = rank <= 3;

  const getRankColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#CBD5E1';
    if (rank === 3) return '#F6A87C';
    return colors.coral;
  };

  const getTitle = () => {
    if (rank === 1) return 'Champion 2Mots';
    if (rank === 2) return 'Vice-Champion';
    if (rank === 3) return 'Grand Maître';
    if (rank <= 10) return 'Élite Mondiale';
    return 'Challenger';
  };

  const accentColor = getRankColor();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: themeColors.card,
              borderColor: accentColor,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color={themeColors.textSecondary} />
          </TouchableOpacity>

          {/* Badge de Rang Mondial */}
          <View style={[styles.rankTag, { backgroundColor: accentColor }]}>
            <Text style={styles.rankTagText}>
              {rank === 1 ? 'TOP 1 MONDIAL' : `RANG #${rank}`}
            </Text>
          </View>

          {/* Avatar / Initiale */}
          <View style={[styles.avatarBox, { borderColor: accentColor }]}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor + '30' }]}>
                <Text style={[styles.avatarInitial, { color: accentColor }]}>
                  {user.login ? user.login.charAt(0).toUpperCase() : 'J'}
                </Text>
              </View>
            )}
          </View>

          {/* Pseudo Complet (sans coupure) */}
          <Text style={[styles.username, { color: themeColors.text }]}>
            {user.login}
          </Text>

          <Text style={[styles.playerTitle, { color: accentColor }]}>
            {getTitle()}
          </Text>

          {/* Grille des Performances */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themeColors.overlayLight }]}>
              <Ionicons name="trophy-outline" size={20} color={colors.coral} />
              <Text style={[styles.statVal, { color: themeColors.text }]}>
                {user.level || 1}
              </Text>
              <Text style={[styles.statLbl, { color: themeColors.textSecondary }]}>Niveau</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: themeColors.overlayLight }]}>
              <Ionicons name="ribbon-outline" size={20} color="#F59E0B" />
              <Text style={[styles.statVal, { color: themeColors.text }]}>
                {user.bestScore || 0}
              </Text>
              <Text style={[styles.statLbl, { color: themeColors.textSecondary }]}>Record Mots</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: themeColors.overlayLight }]}>
              <Ionicons name="flash-outline" size={20} color="#A855F7" />
              <Text style={[styles.statVal, { color: themeColors.text }]}>
                {user.xp || 0}
              </Text>
              <Text style={[styles.statLbl, { color: themeColors.textSecondary }]}>XP Palier</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.closeModalBtn, { backgroundColor: accentColor }]}
            onPress={onClose}
            activeOpacity={0.88}
          >
            <Text style={styles.closeModalBtnText}>Fermer</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 330,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
  },
  rankTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  rankTagText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 11,
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 28,
  },
  username: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 2,
  },
  playerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: borderRadius.lg,
  },
  statVal: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    marginTop: 2,
  },
  statLbl: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    marginTop: 1,
  },
  closeModalBtn: {
    width: '100%',
    height: 46,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13.5,
    color: '#1A1A1A',
  },
});
