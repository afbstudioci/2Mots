//src/screens/HomeScreen.tsx
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, borderRadius, shadows, spacing } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import FullScreenMenu from '../components/navigation/FullScreenMenu';
import ReferralCelebration from '../components/common/ReferralCelebration';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const REFERRAL_KEY = '@twomots_referral_seen';

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
    const { user, refreshProfile } = useAuth();
    const { themeColors } = useTheme();
    const [showCelebration, setShowCelebration] = useState(false);
    
    const scalePressAnim = useRef(new Animated.Value(1)).current;
    const breathAnim = useRef(new Animated.Value(1)).current;
    const halo1Anim = useRef(new Animated.Value(0)).current;
    const halo2Anim = useRef(new Animated.Value(0)).current;
    const halo3Anim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true })
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(breathAnim, { toValue: 1.07, duration: 1100, useNativeDriver: true }),
                Animated.timing(breathAnim, { toValue: 1, duration: 1100, useNativeDriver: true })
            ])
        ).start();

        const startHalo = (anim: Animated.Value, delay: number) => {
            anim.setValue(0);
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, { toValue: 1, duration: 2800, useNativeDriver: true })
                ])
            ).start();
        };

        startHalo(halo1Anim, 0);
        startHalo(halo2Anim, 900);
        startHalo(halo3Anim, 1800);
    }, [breathAnim, fadeAnim, halo1Anim, halo2Anim, halo3Anim, slideAnim]);

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

    const handlePlayPress = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
        navigation.navigate('Game');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
            {/* Menu Hamburger Plein Ecran */}
            <FullScreenMenu />

            <View style={styles.container}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.greetingText, { color: themeColors.textSecondary }]}>BONJOUR</Text>
                    <View style={styles.userRow}>
                        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarPressable}>
                            <View style={[styles.avatarContainer, { backgroundColor: themeColors.card, borderColor: colors.coral }]}>
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
                    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 184, 77, 0.15)' }]}>
                                <Ionicons name="trophy" size={20} color="#FFB84D" />
                            </View>
                            <View>
                                <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>RECORD</Text>
                                <Text style={[styles.statValueText, { color: themeColors.text }]}>{user?.bestScore || 0}</Text>
                            </View>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(129, 230, 217, 0.15)' }]}>
                                <Ionicons name="diamond" size={20} color="#81E6D9" />
                            </View>
                            <View>
                                <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>KEVS</Text>
                                <Text style={[styles.statValueText, { color: themeColors.text }]}>{user?.kevs || 0}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {[halo1Anim, halo2Anim, halo3Anim].map((anim, i) => (
                        <Animated.View key={i} style={[styles.halo, { 
                            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                            opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.35, 0] })
                        }]} />
                    ))}
                    
                    <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
                        <Animated.View style={{ transform: [{ scale: scalePressAnim }] }}>
                            <Pressable
                                onPressIn={() => Animated.spring(scalePressAnim, { toValue: 0.94, useNativeDriver: true }).start()}
                                onPressOut={() => Animated.spring(scalePressAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start()}
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

            <ReferralCelebration 
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: 100, justifyContent: 'space-between' },
    header: { marginTop: spacing.xl, width: '100%' },
    userRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    avatarPressable: { marginRight: spacing.sm },
    avatarContainer: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', ...shadows.soft(false) },
    avatarImage: { width: '100%', height: '100%' },
    avatarPlaceholder: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
    greetingText: { fontFamily: 'Poppins_500Medium', fontSize: 15, letterSpacing: 1 },
    userNameText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 28, letterSpacing: 0.5, flexShrink: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statsContainer: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl, width: '100%', justifyContent: 'center' },
    statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: borderRadius.xl, ...shadows.soft(false), maxWidth: 160 },
    statIconContainer: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
    statLabelText: { fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 1, marginBottom: -2 },
    statValueText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 17 },
    halo: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: colors.coral, zIndex: 0, marginTop: 60 },
    playButton: { paddingVertical: spacing.md, paddingHorizontal: 48, borderRadius: 30, zIndex: 10, shadowColor: colors.coral, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 12, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.4)', marginTop: 60 },
    playButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    playIcon: { marginRight: spacing.sm },
    playButtonText: { fontFamily: 'Poppins_900Black', fontSize: 32, letterSpacing: 2 },
});

export default HomeScreen;