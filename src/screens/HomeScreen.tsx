//src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { RootStackParamList } from '../../App';
import KevIcon from '../components/common/KevIcon';
import ReferralCelebration from '../components/common/ReferralCelebration';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const REFERRAL_KEY = '@twomots_referral_reward_seen';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, refreshProfile } = useAuth();
  const { themeColors, isDark } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const scalePressAnim = useRef(new Animated.Value(1)).current;

  // Animations d'actualisation manuelle
  const recordSpinAnim = useRef(new Animated.Value(0)).current;
  const kevsBounceAnim = useRef(new Animated.Value(1)).current;

  const halo1Anim = useRef(new Animated.Value(0)).current;
  const halo2Anim = useRef(new Animated.Value(0)).current;
  const halo3Anim = useRef(new Animated.Value(0)).current;

  // Actualisation automatique en temps réel à chaque fois que la page Accueil devient active
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    const createHaloAnim = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    };

    const h1 = createHaloAnim(halo1Anim, 0);
    const h2 = createHaloAnim(halo2Anim, 800);
    const h3 = createHaloAnim(halo3Anim, 1600);

    h1.start();
    h2.start();
    h3.start();

    return () => {
      h1.stop();
      h2.stop();
      h3.stop();
    };
  }, []);

  useEffect(() => {
    const checkCelebration = async () => {
      if (user?.referredBy && user?.level === 1 && !user?.referralRewardClaimed) {
        const hasSeen = await AsyncStorage.getItem(REFERRAL_KEY);
        if (!hasSeen) {
          setShowCelebration(true);
          await AsyncStorage.setItem(REFERRAL_KEY, 'true');
        }
      }
    };
    checkCelebration();
  }, [user]);

  const handleRefreshRecord = async () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    recordSpinAnim.setValue(0);
    Animated.timing(recordSpinAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    await refreshProfile();
  };

  const handleRefreshKevs = async () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    Animated.sequence([
      Animated.timing(kevsBounceAnim, { toValue: 1.25, duration: 150, useNativeDriver: true }),
      Animated.spring(kevsBounceAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
    await refreshProfile();
  };

  const handlePlayPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    navigation.navigate('Game');
  };

  const spin = recordSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      {/* Hamburger Button vers Menu Screen natif */}
      <Pressable
        onPress={() => navigation.navigate('Menu')}
        style={[styles.hamburgerButton, { top: insets.top + spacing.xs }]}
      >
        <View style={styles.hamburgerContainer}>
          <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text, width: 16 }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
        </View>
      </Pressable>

      <View style={styles.container}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.greetingText, { color: themeColors.textSecondary }]}>BONJOUR</Text>
          <View style={styles.userRow}>
            <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarPressable}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: themeColors.card, borderColor: colors.coral },
                ]}
              >
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarPlaceholder, { color: colors.coral }]}>
                    {(user?.login || 'U')[0].toUpperCase()}
                  </Text>
                )}
              </View>
            </Pressable>
            <Text style={[styles.userNameText, { color: themeColors.text }]}>{user?.login}</Text>
          </View>
        </Animated.View>

        <View style={styles.centerContainer}>
          <Animated.View
            style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* CARTE RECORD ACTUALISABLE */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleRefreshRecord}
              style={[
                styles.statCard,
                { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 },
                shadows.soft(isDark),
              ]}
            >
              <Animated.View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: 'rgba(255, 184, 77, 0.15)', transform: [{ rotate: spin }] },
                ]}
              >
                <Ionicons name="trophy" size={20} color="#FFB84D" />
              </Animated.View>
              <View>
                <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>RECORD</Text>
                <Text style={[styles.statValueText, { color: themeColors.text }]}>
                  {user?.bestScore || 0}
                </Text>
              </View>
            </TouchableOpacity>

            {/* CARTE KEVS ACTUALISABLE */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleRefreshKevs}
              style={[
                styles.statCard,
                { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 },
                shadows.soft(isDark),
              ]}
            >
              <Animated.View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: 'rgba(129, 230, 217, 0.15)', transform: [{ scale: kevsBounceAnim }] },
                ]}
              >
                <KevIcon size={20} />
              </Animated.View>
              <View>
                <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>KEVS</Text>
                <Text style={[styles.statValueText, { color: themeColors.text }]}>{user?.kevs || 0}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {[halo1Anim, halo2Anim, halo3Anim].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.halo,
                {
                  transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                  opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.35, 0] }),
                },
              ]}
            />
          ))}

          <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
            <Animated.View style={{ transform: [{ scale: scalePressAnim }] }}>
              <Pressable
                onPressIn={() => Animated.spring(scalePressAnim, { toValue: 0.94, useNativeDriver: true }).start()}
                onPressOut={() =>
                  Animated.spring(scalePressAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start()
                }
                onPress={handlePlayPress}
              >
                <LinearGradient
                  colors={[colors.coral, '#FF8C66']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButton}
                >
                  <View style={styles.playButtonContent}>
                    <Ionicons name="play" size={30} color="#FFFFFF" style={styles.playIcon} />
                    <Text style={[styles.playButtonText, { color: '#FFFFFF' }]}>JOUER</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      <ReferralCelebration visible={showCelebration} onClose={() => setShowCelebration(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: 100, justifyContent: 'space-between' },
  hamburgerButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 24,
  },
  hamburgerContainer: { alignItems: 'flex-end', width: 24 },
  hamburgerLine: { width: 24, height: 2.5, borderRadius: 2, marginVertical: 3 },
  header: { marginTop: spacing.xl, width: '100%' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  avatarPressable: { marginRight: spacing.sm },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.soft(false),
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  greetingText: { fontFamily: 'Poppins_500Medium', fontSize: 15, letterSpacing: 1 },
  userNameText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 28, letterSpacing: 0.5, flexShrink: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    width: '100%',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    maxWidth: 160,
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statLabelText: { fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 1, marginBottom: -2 },
  statValueText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 17 },
  halo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.coral,
    zIndex: 0,
    marginTop: 60,
  },
  playButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: 48,
    borderRadius: 30,
    zIndex: 10,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 60,
  },
  playButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  playIcon: { marginRight: spacing.sm },
  playButtonText: { fontFamily: 'Poppins_900Black', fontSize: 32, letterSpacing: 2 },
});

export default HomeScreen;