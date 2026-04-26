//src/screens/GameScreen.tsx
import React, { useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { spacing } from '../theme/theme';

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

    if (isLoading) return <GameLoading />;
    
    if (errorMessage || wordPairs.length === 0) {
        return <GameEmpty message={errorMessage} onBack={() => navigation.navigate('Home')} />;
    }

    return (
        <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
            <KeyboardAvoidingView 
                style={{ flex: 1, backgroundColor: themeColors.background }} 
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
});