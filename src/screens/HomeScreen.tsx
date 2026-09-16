// src/screens/HomeScreen.tsx
// ECRAN D'ACCUEIL PRINCIPAL AVEC PRE-CHARGEMENT SILENCIEUX DES ENIGMES
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/theme';
import { RootStackParamList } from '../../App';
import ReferralCelebration from '../components/common/ReferralCelebration';
import { DuelButton } from '../components/duel/DuelButton';
import { HappyHourBanner } from '../components/home/HappyHourBanner';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeStatsCards } from '../components/home/HomeStatsCards';
import { HomePlaySection } from '../components/home/HomePlaySection';
import { getPendingInvites } from '../services/duelApi';
import { prefetchEnigmas } from '../services/enigmaCacheService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const REFERRAL_KEY = '@twomots_referral_reward_seen';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, refreshProfile } = useAuth();
  const { themeColors } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingDuelCount, setPendingDuelCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const scalePressAnim = useRef(new Animated.Value(1)).current;
  const recordSpinAnim = useRef(new Animated.Value(0)).current;
  const kevsBounceAnim = useRef(new Animated.Value(1)).current;

  const halo1Anim = useRef(new Animated.Value(0)).current;
  const halo2Anim = useRef(new Animated.Value(0)).current;
  const halo3Anim = useRef(new Animated.Value(0)).current;

  // Actualisation automatique en temps reel et pre-chargement silencieux des enigmes
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      prefetchEnigmas(user?.level || 1).catch(() => {});
      if (user?.level && user.level >= 5) {
        getPendingInvites()
          .then((res) => setPendingDuelCount(res.received.length))
          .catch(() => {});
      }
    }, [refreshProfile, user?.level])
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
      <HomeHeader
        user={user}
        insetsTop={insets.top}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        onOpenMenu={() => navigation.navigate('Menu')}
        onOpenProfile={() => navigation.navigate('Profile')}
      />

      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <HappyHourBanner />
          <HomeStatsCards
            bestScore={user?.bestScore || 0}
            kevs={user?.kevs || 0}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            spin={spin}
            kevsBounceAnim={kevsBounceAnim}
            onRefreshRecord={handleRefreshRecord}
            onRefreshKevs={handleRefreshKevs}
          />

          <HomePlaySection
            halo1Anim={halo1Anim}
            halo2Anim={halo2Anim}
            halo3Anim={halo3Anim}
            breathAnim={breathAnim}
            scalePressAnim={scalePressAnim}
            onPlayPress={handlePlayPress}
          />

          <DuelButton
            userLevel={user?.level || 1}
            pendingCount={pendingDuelCount}
            onPress={() => navigation.navigate('DuelLobby')}
          />
        </View>
      </View>

      <ReferralCelebration visible={showCelebration} onClose={() => setShowCelebration(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: 100, justifyContent: 'space-between' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
});

export default HomeScreen;