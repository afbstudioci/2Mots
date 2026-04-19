import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, typography, borderRadius, shadows, spacing } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import FloatingTabBar from '../components/navigation/FloatingTabBar';
import FullScreenMenu from '../components/navigation/FullScreenMenu';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
    const { user, refreshProfile } = useAuth();
    const { themeColors } = useTheme();
    
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const scalePressAnim = useRef(new Animated.Value(1)).current;
    const breathAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useFocusEffect(
        useCallback(() => {
            if (!isLoggingOut) {
                refreshProfile();
            }
        }, [isLoggingOut, refreshProfile])
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true })
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(breathAnim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
                Animated.timing(breathAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
            ])
        ).start();
    }, [breathAnim, fadeAnim, slideAnim]);

    const handlePressIn = () => {
        Animated.spring(scalePressAnim, { toValue: 0.94, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scalePressAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
    };

    const handlePlayPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        navigation.navigate('Game');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
            
            <FullScreenMenu />

            <View style={styles.container}>
                
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.greetingText, { color: themeColors.text }]}>Bonjour, {user?.login}</Text>
                    
                    <View style={styles.badgesContainer}>
                        <View style={[styles.badge, { backgroundColor: themeColors.card }]}>
                            <Text style={[styles.badgeLabel, { color: themeColors.textSecondary }]}>Record </Text>
                            <Text style={[styles.badgeValue, { color: themeColors.text }]}>{user?.bestScore || 0}</Text>
                        </View>
                        
                        <View style={[styles.badge, styles.kevsBadge, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                            <Text style={[styles.badgeLabel, { color: '#FFD700' }]}>Kevs </Text>
                            <Text style={[styles.badgeValue, { color: '#FFD700' }]}>{user?.kevs || 0}</Text>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.centerContainer}>
                    <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
                        <Animated.View style={{ transform: [{ scale: scalePressAnim }] }}>
                            <Pressable
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                onPress={handlePlayPress}
                                style={styles.playButton}
                            >
                                <Text style={[styles.playButtonText, { color: themeColors.background }]}>JOUER</Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </View>

            </View>

            <FloatingTabBar />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingBottom: 100, 
        justifyContent: 'space-between',
    },
    header: {
        marginTop: spacing.xl,
        alignItems: 'flex-start',
    },
    greetingText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        marginBottom: spacing.xs,
        paddingLeft: spacing.xs,
    },
    badgesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.xl,
        ...shadows.soft(false),
    },
    kevsBadge: {
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    badgeLabel: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
    },
    badgeValue: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50, 
    },
    playButton: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.lg,
        paddingHorizontal: 80,
        borderRadius: borderRadius.xl,
        ...shadows.soft(true),
    },
    playButtonText: {
        fontFamily: 'Poppins_900Black',
        fontSize: 40,
        letterSpacing: 2,
    },
});

export default HomeScreen;