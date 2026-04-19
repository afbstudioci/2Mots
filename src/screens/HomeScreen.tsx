//src/screens/HomeScreen.tsx
import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, StatusBar, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { colors, typography, borderRadius } from '../theme/theme';

const HomeScreen = ({ navigation }: any) => {
    const { user, refreshProfile, logout } = useAuth();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Actualise le profil a chaque fois que l'ecran devient actif (ex: retour d'une partie)
    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [])
    );

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePlayPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        navigation.navigate('GameScreen');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.nightBlue} translucent={false} />
            <View style={styles.container}>
                
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.greetingRow}>
                        <Text style={styles.greetingText}>Pret, {user?.login} ?</Text>
                        {user?.role === 'superadmin' && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Meilleur score</Text>
                        <Text style={styles.scoreValue}>{user?.bestScore || 0}</Text>
                    </View>
                </View>

                {/* Center Section: Main Action */}
                <View style={styles.centerContainer}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Pressable
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handlePlayPress}
                            style={styles.playButton}
                        >
                            <Text style={styles.playButtonText}>JOUER</Text>
                        </Pressable>
                    </Animated.View>
                </View>

                {/* Footer Section: Navigation Secondaire / Deconnexion */}
                <Pressable onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Se deconnecter</Text>
                </Pressable>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.nightBlue,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 40,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    greetingText: {
        ...typography.titleLarge,
        color: colors.sand,
        marginRight: 12,
    },
    adminBadge: {
        backgroundColor: colors.coral,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    adminBadgeText: {
        color: colors.nightBlue,
        fontFamily: 'Poppins_700Bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    scoreContainer: {
        marginTop: 4,
    },
    scoreLabel: {
        ...typography.bodyMedium,
        color: colors.sand,
        opacity: 0.6,
    },
    scoreValue: {
        ...typography.titleHuge,
        color: colors.coral,
        lineHeight: 50,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: colors.coral,
        paddingVertical: 24,
        paddingHorizontal: 72,
        borderRadius: borderRadius.xl,
        shadowColor: colors.coral,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
    },
    playButtonText: {
        fontFamily: 'Poppins_900Black',
        fontSize: 36,
        color: colors.nightBlue,
        letterSpacing: 2,
    },
    logoutButton: {
        alignSelf: 'center',
        padding: 16,
    },
    logoutText: {
        ...typography.bodyMedium,
        color: colors.sand,
        opacity: 0.4,
        textDecorationLine: 'underline',
    },
});

export default HomeScreen;