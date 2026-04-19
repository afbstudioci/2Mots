//src/screens/GameOverScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { typography, colors, spacing, borderRadius } from '../theme/theme';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '../components/layout/ScreenWrapper';

type GameOverScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameOver'>;

export default function GameOverScreen({ route, navigation }: { route: any, navigation: GameOverScreenNavigationProp }) {
    const { score, details } = route.params;

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    <Text style={styles.scoreLabel}>SCORE FINAL</Text>
                    <Text style={styles.scoreValue}>{score}</Text>

                    <View style={styles.cardContainer}>
                        {details.map((item: any, index: number) => {
                            const isHighAccuracy = item.accuracy >= 80;
                            const accuracyColor = isHighAccuracy ? colors.success : colors.sand;

                            return (
                                <View 
                                    key={index} 
                                    style={[
                                        styles.detailRow, 
                                        index === details.length - 1 && styles.lastRow
                                    ]}
                                >
                                    <View style={styles.wordContainer}>
                                        <Text style={styles.word} numberOfLines={1}>{item.word}</Text>
                                    </View>
                                    <View style={styles.statsContainer}>
                                        <Text style={[styles.accuracy, { color: accuracyColor }]}>
                                            {item.accuracy}%
                                        </Text>
                                        <Text style={styles.label}>{item.label}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.replayButton} 
                        activeOpacity={0.8}
                        onPress={() => navigation.replace('Home')}
                    >
                        <Text style={styles.replayText}>REJOUER</Text>
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
        color: colors.sand,
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
    cardContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 32, 
        padding: spacing.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
        color: colors.sand,
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
        color: colors.sand,
        opacity: 0.5,
        fontSize: 12,
        letterSpacing: 1,
        marginTop: 2,
    },
    footer: {
        paddingVertical: spacing.xl,
        paddingBottom: spacing.xl * 2,
        alignItems: 'center',
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
});