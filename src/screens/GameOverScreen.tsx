//src/screens/GameOverScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { typography, colors, spacing } from '../theme/theme';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../hooks/useAudio';

type GameOverScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameOver'>;

export default function GameOverScreen({ route, navigation }: { route: any, navigation: GameOverScreenNavigationProp }) {
    const { score, details, corrections, hasScore } = route.params;
    const { themeColors } = useTheme();
    const { playGameOver, stopGameOver } = useAudio();

    // Animation du score
    const [displayScore, setDisplayScore] = useState(0);
    const scoreAnim = useRef(new Animated.Value(0)).current;

    // Animation des détails
    const listAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        console.log("[GAME OVER] hasScore:", hasScore);
        
        // Délai pour laisser la transition se terminer et le système audio se libérer
        const timer = setTimeout(() => {
            playGameOver(hasScore);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [hasScore]);

    useEffect(() => {
        // Animation de la liste
        Animated.timing(listAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Compteur de Score animé
        const scoreListener = scoreAnim.addListener(({ value }) => {
            setDisplayScore(Math.floor(value));
        });

        Animated.timing(scoreAnim, {
            toValue: score,
            duration: 1500,
            useNativeDriver: false,
        }).start();

        return () => {
            scoreAnim.removeListener(scoreListener);
            stopGameOver();
        };
    }, [score]);

    const correctionTitle = corrections && corrections.length > 1 ? "RÉPONSES ATTENDUES" : "RÉPONSE ATTENDUE";

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    <Text style={[styles.scoreLabel, { color: themeColors.textSecondary }]}>SCORE FINAL</Text>
                    <Text style={styles.scoreValue}>{displayScore}</Text>

                    {corrections && corrections.length > 0 && (
                        <View style={[styles.correctionsWrapper, { 
                            borderWidth: themeColors.cardBorderWidth,
                            borderColor: themeColors.cardBorder
                        }]}>
                            <Text style={styles.correctionsTitle}>{correctionTitle}</Text>
                            {corrections.map((item: any, index: number) => (
                                <View key={index} style={styles.correctionItem}>
                                    <Text style={[styles.correctionPair, { color: themeColors.text }]}>
                                        {item.word1.toUpperCase()} + {item.word2.toUpperCase()}
                                    </Text>
                                    <Text style={styles.correctionExpected}>
                                        = {item.expectedAnswer.toUpperCase()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={[styles.cardContainer, { 
                        backgroundColor: themeColors.overlayLight,
                        borderWidth: themeColors.cardBorderWidth,
                        borderColor: themeColors.cardBorder
                    }]}>
                        {details.map((item: any, index: number) => {
                            const isHighAccuracy = item.accuracy >= 80;
                            const accuracyColor = isHighAccuracy ? colors.success : colors.coral;

                            const itemTranslateY = listAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50 + index * 20, 0]
                            });
                            const itemOpacity = listAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1]
                            });

                            return (
                                <Animated.View 
                                    key={index} 
                                    style={[
                                        styles.detailRow, 
                                        index === details.length - 1 && styles.lastRow,
                                        { 
                                            borderBottomColor: themeColors.overlayLight,
                                            opacity: itemOpacity,
                                            transform: [{ translateY: itemTranslateY }]
                                        }
                                    ]}
                                >
                                    <View style={styles.wordContainer}>
                                        <Text style={[styles.word, { color: themeColors.text }]} numberOfLines={1}>{item.word}</Text>
                                    </View>
                                    <View style={styles.statsContainer}>
                                        <Text style={[styles.accuracy, { color: accuracyColor }]}>
                                            {item.accuracy}%
                                        </Text>
                                        <Text style={[styles.label, { color: themeColors.textSecondary }]}>{item.label}</Text>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.replayButton} 
                        activeOpacity={0.8}
                        onPress={() => navigation.replace('Game')}
                    >
                        <Text style={styles.replayText}>REJOUER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.homeButton} 
                        activeOpacity={0.6}
                        onPress={() => navigation.replace('Home')}
                    >
                        <Text style={[styles.homeText, { color: themeColors.text }]}>RETOUR À L'ACCUEIL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    scrollContent: {
        paddingTop: spacing.xl * 3,
        paddingBottom: spacing.xl * 2,
        alignItems: 'center',
    },
    scoreLabel: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
        letterSpacing: 4,
        opacity: 0.6,
        marginBottom: spacing.sm,
    },
    scoreValue: {
        fontFamily: 'Poppins_800ExtraBold',
        color: colors.coral,
        fontSize: 72,
        lineHeight: 80,
        marginBottom: spacing.xl * 2,
    },
    correctionsWrapper: {
        width: '100%',
        backgroundColor: 'rgba(255, 90, 95, 0.1)',
        borderRadius: 24,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    correctionsTitle: {
        fontFamily: 'Poppins_700Bold',
        color: colors.coral,
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    correctionItem: {
        alignItems: 'center',
        marginVertical: spacing.xs,
    },
    correctionPair: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        opacity: 0.8,
    },
    correctionExpected: {
        fontFamily: 'Poppins_700Bold',
        color: colors.success,
        fontSize: 16,
        marginTop: 2,
    },
    cardContainer: {
        width: '100%',
        borderRadius: 32, 
        padding: spacing.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    wordContainer: {
        flex: 1,
        paddingRight: spacing.md,
    },
    word: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
        textTransform: 'uppercase',
    },
    statsContainer: {
        alignItems: 'flex-end',
    },
    accuracy: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 20,
    },
    label: {
        fontFamily: 'Poppins_500Medium',
        opacity: 0.8,
        fontSize: 12,
        letterSpacing: 1,
        marginTop: 2,
    },
    footer: {
        paddingVertical: spacing.xl,
        paddingBottom: spacing.xl * 2,
        alignItems: 'center',
        gap: spacing.md,
    },
    replayButton: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl * 3,
        borderRadius: 50, 
        width: '100%',
        alignItems: 'center',
    },
    replayText: {
        ...typography.buttonPrimary,
        fontSize: 18,
        letterSpacing: 2,
    },
    homeButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        width: '100%',
        alignItems: 'center',
    },
    homeText: {
        ...typography.buttonPrimary,
        fontSize: 14,
        letterSpacing: 1,
        opacity: 0.7,
    }
});