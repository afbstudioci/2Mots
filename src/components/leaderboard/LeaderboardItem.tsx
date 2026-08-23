//src/components/leaderboard/LeaderboardItem.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface LeaderboardItemProps {
  rank: number;
  user: {
    login: string;
    bestScore: number;
    xp?: number;
    level?: number;
    avatar?: string;
  };
  index: number;
  onPress?: (user: any, rank: number) => void;
}

export default function LeaderboardItem({ rank, user, index, onPress }: LeaderboardItemProps) {
  const { themeColors } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: Math.min(index * 40, 200),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: Math.min(index * 40, 200),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const isPodium = rank <= 3;

  const getCardStyle = () => {
    if (rank === 1) return { backgroundColor: '#FFD700', textColor: '#1A1A1A' };
    if (rank === 2) return { backgroundColor: '#CBD5E1', textColor: '#1E293B' };
    if (rank === 3) return { backgroundColor: '#F6A87C', textColor: '#4A200B' };
    return { backgroundColor: themeColors.card, textColor: themeColors.text };
  };

  const getTitle = (r: number) => {
    if (r === 1) return 'Champion 2Mots';
    if (r === 2) return 'Vice-Champion';
    if (r === 3) return 'Grand Maître';
    if (r <= 10) return 'Élite Mondiale';
    return 'Challenger';
  };

  const cardConfig = getCardStyle();

  const renderAvatar = (isPodiumStyle: boolean) => {
    const avatarStyles = isPodiumStyle ? [styles.avatar, styles.avatarPodium] : [styles.avatar, styles.avatarStandard];

    if (user.avatar) {
      return <Image source={{ uri: user.avatar }} style={avatarStyles} resizeMode="cover" />;
    }

    return (
      <View style={avatarStyles}>
        <Text style={styles.avatarInitial}>{user.login ? user.login.charAt(0).toUpperCase() : 'J'}</Text>
      </View>
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: cardConfig.backgroundColor },
          !isPodium && { borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth || 1 },
          isPodium ? styles.cardPodium : styles.cardStandard,
          rank === 1 && styles.glowEffect,
        ]}
        onPress={() => onPress && onPress(user, rank)}
        activeOpacity={0.85}
      >
        <View style={styles.mainContent}>
          {isPodium ? (
            <View style={styles.avatarContainerPodium}>
              {renderAvatar(true)}
              <View style={styles.rankBadgePodium}>
                <Text style={styles.rankTextPodium}>{rank}</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.rankTextStandard, { color: themeColors.textSecondary }]}>{rank}</Text>
          )}

          {!isPodium && renderAvatar(false)}

          <View style={styles.infoContainer}>
            <Text style={[styles.username, { color: cardConfig.textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {user.login}
            </Text>
            <Text style={[styles.titleText, { color: cardConfig.textColor, opacity: 0.6 }]}>
              {getTitle(rank)}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: isPodium ? cardConfig.textColor : colors.coral }]}>
              {user.level || 1}
            </Text>
            <Text style={[styles.pointsLabel, { color: cardConfig.textColor, opacity: 0.5 }]}>
              NIVEAU
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.xl, marginVertical: spacing.xs, overflow: 'hidden' },
  glowEffect: {
    shadowColor: '#FFB84D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPodium: { borderRadius: 40, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  cardStandard: { borderRadius: 24, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  mainContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainerPodium: { position: 'relative', marginRight: spacing.md },
  avatar: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', overflow: 'hidden' },
  avatarPodium: { width: 54, height: 54, borderRadius: 27 },
  avatarStandard: { width: 40, height: 40, borderRadius: 20, marginHorizontal: spacing.md },
  avatarInitial: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 20 },
  rankBadgePodium: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rankTextPodium: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 12 },
  rankTextStandard: { fontFamily: 'Poppins_800ExtraBold', fontSize: 20, width: 25, textAlign: 'center' },
  infoContainer: { flex: 1, flexShrink: 1, paddingRight: spacing.md },
  username: { fontFamily: 'Poppins_700Bold', fontSize: 18, marginBottom: -4, flexShrink: 1 },
  titleText: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  scoreContainer: { alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 },
  scoreText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 22 },
  pointsLabel: { fontFamily: 'Poppins_700Bold', fontSize: 9, marginTop: -4, letterSpacing: 1 },
});