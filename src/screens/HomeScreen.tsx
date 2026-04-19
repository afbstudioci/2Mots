// src/screens/HomeScreen.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, typography, borderRadius, shadows, spacing } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
    const { user, refreshProfile, logout } = useAuth();
    const { themeColors } = useTheme();
    
    const scalePressAnim = useRef(new Animated.Value(1)).current;
    const breathAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
            <View style={styles.container}>
                
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.greetingText, { color: themeColors.text }]}>Bonjour, {user?.login}</Text>
                    <View style={[styles.recordBadge, { backgroundColor: themeColors.card }]}>
                        <Text style={[styles.recordLabel, { color: themeColors.textSecondary }]}>Record : </Text>
                        <Text style={[styles.recordValue, { color: themeColors.text }]}>{user?.bestScore || 0}</Text>
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

                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Pressable style={styles.secondaryButton}>
                            <Text style={styles.secondaryButtonText}>CLASSEMENT</Text>
                        </Pressable>
                    </Animated.View>
                </View>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <Pressable onPress={logout} style={styles.logoutButton}>
                        <Text style={[styles.logoutText, { color: themeColors.text }]}>Se déconnecter</Text>
                    </Pressable>
                </Animated.View>

            </View>
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
        paddingBottom: spacing.lg,
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
    recordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.xl,
        ...shadows.soft(false),
    },
    recordLabel: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
    },
    recordValue: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 18,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.lg,
        paddingHorizontal: 80,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
        ...shadows.soft(true),
    },
    playButtonText: {
        fontFamily: 'Poppins_900Black',
        fontSize: 40,
        letterSpacing: 2,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.coral,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
    },
    secondaryButtonText: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 18,
        color: colors.coral,
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: spacing.sm,
    },
    logoutButton: {
        padding: spacing.md,
    },
    logoutText: {
        ...typography.bodyMedium,
        opacity: 0.4,
        textDecorationLine: 'underline',
    },
});

export default HomeScreen;