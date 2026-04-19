//src/components/game/GamePlayArea.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography, colors, spacing, borderRadius } from '../../theme/theme';

interface GamePlayAreaProps {
    timeLeft: number;
    currentPair: any;
    slideWordsAnim: Animated.Value | Animated.AnimatedInterpolation<number>;
}

export default function GamePlayArea({ timeLeft, currentPair, slideWordsAnim }: GamePlayAreaProps) {
    if (!currentPair) return null;

    return (
        <View style={styles.gameArea}>
            <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextDanger]}>
                {Math.max(0, timeLeft)}s
            </Text>
            
            <Animated.View style={[styles.wordsBox, { transform: [{ translateX: slideWordsAnim }] }]}>
                <View style={styles.singleWord}>
                    <Text style={styles.wordTitle}>{currentPair.word1}</Text>
                </View>
                <View style={styles.plusContainer}>
                    <Text style={styles.plusSign}>+</Text>
                </View>
                <View style={styles.singleWord}>
                    <Text style={styles.wordTitle}>{currentPair.word2}</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
    timerText: { ...typography.titleLarge, color: colors.sand, opacity: 0.6, marginBottom: spacing.xl },
    timerTextDanger: { color: colors.error, opacity: 1 },
    wordsBox: {
        width: '100%', alignItems: 'center', justifyContent: 'center',
    },
    singleWord: { 
        width: '100%', alignItems: 'center', paddingVertical: spacing.lg,
        backgroundColor: 'rgba(244, 238, 224, 0.03)', borderRadius: borderRadius.xl,
    },
    wordTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 28, color: colors.sand, textTransform: 'uppercase', letterSpacing: 1 },
    plusContainer: {
        backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.xl,
        marginTop: -spacing.md, marginBottom: -spacing.md, zIndex: 10
    },
    plusSign: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.coral },
});