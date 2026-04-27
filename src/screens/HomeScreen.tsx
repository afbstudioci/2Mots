import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, typography, borderRadius, shadows, spacing } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import FullScreenMenu from '../components/navigation/FullScreenMenu';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
    const { user, refreshProfile } = useAuth();
    const { themeColors } = useTheme();
    
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const scalePressAnim = useRef(new Animated.Value(1)).current;
    const breathAnim = useRef(new Animated.Value(1)).current;
    const halo1Anim = useRef(new Animated.Value(0)).current;
    const halo2Anim = useRef(new Animated.Value(0)).current;
    const halo3Anim = useRef(new Animated.Value(0)).current;
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

        // Pulsation du bouton JOUER (Plus marquée)
        Animated.loop(
            Animated.sequence([
                Animated.timing(breathAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
                Animated.timing(breathAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();

        // Animation des Halos (Effet de propagation/Ripple)
        const createHaloAnim = (anim: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.parallel([
                        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
                        Animated.timing(anim, { toValue: 1.5, duration: 2500, useNativeDriver: true }) // Not useful but parallel needs same type often or sequence
                    ])
                ])
            );
        };
        
        // On va plutôt faire un timing simple pour l'opacité et l'échelle
        const startHalo = (anim: Animated.Value, delay: number) => {
            anim.setValue(0);
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true })
                ])
            ).start();
        };

        startHalo(halo1Anim, 0);
        startHalo(halo2Anim, 1000);
        startHalo(halo3Anim, 2000);
    }, [breathAnim, fadeAnim, slideAnim, halo1Anim, halo2Anim, halo3Anim]);

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
                    <Text style={[styles.greetingText, { color: themeColors.textSecondary }]}>Bienvenue,</Text>
                    
                    <View style={styles.userRow}>
                        <Pressable 
                            onPress={() => navigation.navigate('Profile')}
                            style={({ pressed }) => [
                                styles.avatarPressable,
                                { transform: [{ scale: pressed ? 0.92 : 1 }] }
                            ]}
                        >
                            <View style={[styles.avatarContainer, { borderColor: themeColors.primary, backgroundColor: themeColors.card }]}>
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={[styles.avatarPlaceholder, { color: themeColors.primary }]}>
                                        {user?.login?.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                        
                        <Text style={[styles.userNameText, { color: themeColors.text }]}>{user?.login}</Text>
                    </View>
                </Animated.View>

                <View style={styles.centerContainer}>
                    {/* STATS CARDS - Juste au-dessus du bouton PLAY */}
                    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 184, 77, 0.15)' }]}>
                                <Ionicons name="trophy" size={20} color="#FFB84D" />
                            </View>
                            <View>
                                <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>RECORD</Text>
                                <Text style={[styles.statValueText, { color: themeColors.text }]}>{user?.bestScore || 0}</Text>
                            </View>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(129, 230, 217, 0.15)' }]}>
                                <Ionicons name="diamond" size={20} color="#81E6D9" />
                            </View>
                            <View>
                                <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>KEVS</Text>
                                <Text style={[styles.statValueText, { color: themeColors.text }]}>{user?.kevs || 0}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* HALOS MULTIPLES (Design superbe) */}
                    <Animated.View style={[styles.halo, { 
                        transform: [{ scale: halo1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                        opacity: halo1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.4, 0] })
                    }]} />
                    <Animated.View style={[styles.halo, { 
                        transform: [{ scale: halo2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                        opacity: halo2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.4, 0] })
                    }]} />
                    <Animated.View style={[styles.halo, { 
                        transform: [{ scale: halo3Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                        opacity: halo3Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.4, 0] })
                    }]} />
                    
                    <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
                        <Animated.View style={{ transform: [{ scale: scalePressAnim }] }}>
                            <Pressable
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                onPress={handlePlayPress}
                            >
                                <LinearGradient
                                    colors={[colors.coral, '#FF8C66']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.playButton}
                                >
                                    <View style={styles.playButtonContent}>
                                        <Ionicons name="play" size={32} color={themeColors.background} style={styles.playIcon} />
                                        <Text style={[styles.playButtonText, { color: themeColors.background }]}>JOUER</Text>
                                    </View>
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </View>

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
        paddingBottom: 100, 
        justifyContent: 'space-between',
    },
    header: {
        marginTop: spacing.xl,
        width: '100%',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    avatarPressable: {
        marginRight: spacing.sm,
    },
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
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 20,
    },
    greetingText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        letterSpacing: 1,
    },
    userNameText: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 30,
        letterSpacing: 0.5,
        flexShrink: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        ...shadows.soft(false),
        maxWidth: 160,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    statLabelText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: -2,
    },
    statValueText: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 18,
    },
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
        paddingHorizontal: 50,
        borderRadius: 30,
        zIndex: 10,
        shadowColor: colors.coral,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        marginTop: 60,
    },
    playButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        marginRight: spacing.sm,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    playButtonText: {
        fontFamily: 'Poppins_900Black',
        fontSize: 34,
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});

export default HomeScreen;