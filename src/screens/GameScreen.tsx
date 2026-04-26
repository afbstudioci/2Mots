//src/screens/GameScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { spacing, colors } from '../theme/theme';

import ScreenWrapper from '../components/layout/ScreenWrapper';
import GameLoading from '../components/game/GameLoading';
import GameEmpty from '../components/game/GameEmpty';
import GameHeader from '../components/game/GameHeader';
import GameTimer from '../components/game/GameTimer';
import GamePlayArea from '../components/game/GamePlayArea';
import GameInputArea, { GameInputAreaRef } from '../components/game/GameInputArea';
import SuccessRipple from '../components/game/SuccessRipple';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }: any) {
    const { themeColors } = useTheme();
    
    // Extraction de la logique métier via notre hook personnalisé
    const {
        wordPairs, currentIndex, setCurrentIndex, timeLeft, answer, setAnswer,
        isLoading, errorMessage, isChecking, setIsChecking, userLevel, 
        currentXp, xpNeeded, timeWon, setTimeWon, successTrigger, submitAnswer
    } = useGameLogic(navigation);

    const slideWordsAnim = useRef(new Animated.Value(0)).current;
    const inputAreaRef = useRef<GameInputAreaRef>(null);

    const handleAction = async () => {
        // submitAnswer gère maintenant les vibrations via useFeedback
        const isCorrect = await submitAnswer(inputAreaRef);
        
        if (isCorrect) {
            // Animation de transition : on chasse le mot actuel vers la gauche
            Animated.timing(slideWordsAnim, { 
                toValue: -width, 
                duration: 200, 
                useNativeDriver: true 
            }).start(() => {
                setCurrentIndex((prev: number) => prev + 1);
                setAnswer('');
                
                // On place le nouveau mot à droite (hors écran) et on le fait entrer
                slideWordsAnim.setValue(width);
                Animated.spring(slideWordsAnim, { 
                    toValue: 0, 
                    friction: 7, 
                    tension: 50, 
                    useNativeDriver: true 
                }).start(() => {
                    setIsChecking(false);
                });
            });
        }
    };

    // Animations pour les orbes de fond
    const orb1Anim = useRef(new Animated.Value(0)).current;
    const orb2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(orb1Anim, { toValue: 1, duration: 15000, useNativeDriver: true })
        ).start();
        Animated.loop(
            Animated.timing(orb2Anim, { toValue: 1, duration: 20000, useNativeDriver: true })
        ).start();
    }, []);

    if (isLoading) return <GameLoading />;
    
    if (errorMessage || wordPairs.length === 0) {
        return <GameEmpty message={errorMessage} onBack={() => navigation.navigate('Home')} />;
    }

    return (
        <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
            {/* Arrière-plan Immersif : Orbes flottants */}
            <View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[
                    styles.orb, 
                    { 
                        backgroundColor: colors.coral, 
                        top: -100, 
                        left: -50,
                        transform: [
                            { translateY: orb1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 100, 0] }) },
                            { scale: orb1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] }) }
                        ]
                    }
                ]} />
                <Animated.View style={[
                    styles.orb, 
                    { 
                        backgroundColor: colors.mint, 
                        bottom: -150, 
                        right: -100,
                        transform: [
                            { translateY: orb2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -120, 0] }) },
                            { scale: orb2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] }) }
                        ]
                    }
                ]} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                {/* En-tête avec progression XP */}
                <GameHeader level={userLevel} currentXp={currentXp} xpNeeded={xpNeeded} />
                
                {/* Timer avec gestion des gains de temps */}
                <View style={styles.timerWrapper}>
                    <GameTimer 
                        timeLeft={timeLeft} 
                        maxTime={30} 
                        timeWon={timeWon} 
                        onTimeGainAnimationEnd={() => setTimeWon(0)} 
                    />
                </View>
                
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.playAreaWrapper}>
                        {/* Effet d'onde en cas de succès */}
                        <SuccessRipple trigger={successTrigger} />
                        
                        <Animated.View style={{ transform: [{ translateX: slideWordsAnim }] }}>
                            <GamePlayArea currentPair={wordPairs[currentIndex]} />
                        </Animated.View>
                    </View>
                </ScrollView>

                {/* Zone de saisie fixée au bas */}
                <GameInputArea 
                    actionRef={inputAreaRef}
                    answer={answer} 
                    setAnswer={setAnswer} 
                    submitAnswer={handleAction} 
                    isAnimating={isChecking}
                    expectedType={wordPairs[currentIndex]?.expectedType}
                    clue={wordPairs[currentIndex]?.clue}
                    onHintPress={() => {
                        // Logique des indices (Kevs) à implémenter ici
                        console.log("Demande d'indice pour :", wordPairs[currentIndex]?._id);
                    }}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    timerWrapper: { 
        paddingHorizontal: spacing.xl 
    },
    scrollContent: { 
        flexGrow: 1, 
        justifyContent: 'center' 
    },
    playAreaWrapper: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingVertical: spacing.xl 
    },
    orb: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        opacity: 0.05, // Effet subtil
    }
});