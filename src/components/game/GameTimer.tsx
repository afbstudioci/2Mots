//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; 
import { useFeedback } from '../../hooks/useFeedback';
import { useAudio } from '../../hooks/useAudio';
import { spacing, typography, colors } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface GameTimerProps {
    timeLeft: number;
    maxTime: number; 
    timeWon?: number; 
    onTimeGainAnimationEnd?: () => void;
}

export default function GameTimer({ 
    timeLeft, 
    maxTime, 
    timeWon = 0, 
    onTimeGainAnimationEnd 
}: GameTimerProps) {
    const { themeColors, isDark } = useTheme(); 
    const { triggerVibration } = useFeedback();
    const { playDanger } = useAudio();
    
    const progressAnim = useRef(new Animated.Value(1)).current;
    const bonusAnim = useRef(new Animated.Value(0)).current;
    const lastTimeLeft = useRef(timeLeft);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: timeLeft / maxTime,
            duration: 500,
            useNativeDriver: false,
        }).start();

        if (timeLeft <= 5 && timeLeft > 0 && timeLeft !== lastTimeLeft.current) {
            triggerVibration();
            playDanger();
            lastTimeLeft.current = timeLeft;
        }
    }, [timeLeft, maxTime]);

    useEffect(() => {
        if (timeWon > 0) {
            bonusAnim.setValue(0);
            Animated.sequence([
                Animated.spring(bonusAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.timing(bonusAnim, { toValue: 0, duration: 800, delay: 600, useNativeDriver: true })
            ]).start(() => {
                if (onTimeGainAnimationEnd) onTimeGainAnimationEnd();
            });
        }
    }, [timeWon]);

    const isLowTime = timeLeft <= 5;
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const bonusOpacity = bonusAnim.interpolate({
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 1, 1, 0],
    });
    const bonusTranslateY = bonusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [10, -40],
    });
    const bonusScale = bonusAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 1.2, 1],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.leftHeader}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>TEMPS</Text>
                    {timeWon > 0 && (
                        <Animated.View style={[
                            styles.bonusContainer,
                            { 
                                opacity: bonusOpacity, 
                                transform: [
                                    { translateY: bonusTranslateY },
                                    { scale: bonusScale }
                                ] 
                            }
                        ]}>
                            <Ionicons name="time" size={16} color={colors.mint} style={{ marginRight: 2 }} />
                            <Text style={styles.bonusText}>+{timeWon}s</Text>
                        </Animated.View>
                    )}
                </View>
                <Text style={[
                    styles.timeText, 
                    { color: isLowTime ? colors.error : themeColors.primary }
                ]}>
                    {timeLeft}s
                </Text>
            </View>
            
            {/* Utilisation de isDark corrigée */}
            <View style={[styles.barBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <Animated.View 
                    style={[
                        styles.progressBar, 
                        { 
                            width: progressWidth,
                            backgroundColor: isLowTime ? colors.error : colors.mint 
                        }
                    ]} 
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: spacing.xs,
    },
    leftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        ...typography.bodySmall,
        letterSpacing: 1,
        marginRight: spacing.sm,
    },
    bonusContainer: {
        position: 'absolute',
        left: 60, // Ajuster selon l'espacement
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 222, 128, 0.2)', // Fond vert très léger
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    bonusText: {
        color: colors.mint,
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 14,
    },
    timeText: {
        ...typography.titleLarge,
        fontSize: 20,
    },
    barBackground: {
        height: 8,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});