//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // Import crucial
import { useFeedback } from '../../hooks/useFeedback';
import { spacing, typography, colors } from '../../theme/theme';

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
    // FIX ICI : On extrait bien isDark pour pouvoir l'utiliser plus bas
    const { themeColors, isDark } = useTheme(); 
    const { triggerVibration } = useFeedback();
    
    const progressAnim = useRef(new Animated.Value(1)).current;
    const bonusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: timeLeft / maxTime,
            duration: 500,
            useNativeDriver: false,
        }).start();

        if (timeLeft <= 5 && timeLeft > 0) {
            triggerVibration();
        }
    }, [timeLeft, maxTime]);

    useEffect(() => {
        if (timeWon > 0) {
            bonusAnim.setValue(0);
            Animated.sequence([
                Animated.spring(bonusAnim, { toValue: 1, useNativeDriver: true }),
                Animated.timing(bonusAnim, { toValue: 0, duration: 1000, delay: 500, useNativeDriver: true })
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

    const bonusOpacity = bonusAnim;
    const bonusTranslateY = bonusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.leftHeader}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>TEMPS</Text>
                    {timeWon > 0 && (
                        <Animated.Text style={[
                            styles.bonusText, 
                            { opacity: bonusOpacity, transform: [{ translateY: bonusTranslateY }] }
                        ]}>
                            +{timeWon}s
                        </Animated.Text>
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
    bonusText: {
        color: colors.mint,
        fontWeight: 'bold',
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