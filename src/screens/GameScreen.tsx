//src/screens/GameScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions, ScrollView 
} from 'react-native';
import { colors, spacing } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useFocusEffect } from '@react-navigation/native';

import ScreenWrapper from '../components/layout/ScreenWrapper';
import GameLoading from '../components/game/GameLoading';
import GameEmpty from '../components/game/GameEmpty';
import GameHeader from '../components/game/GameHeader';
import GameTimer from '../components/game/GameTimer';
import GamePlayArea from '../components/game/GamePlayArea';
import GameInputArea from '../components/game/GameInputArea';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const { width } = Dimensions.get('window');

const SuccessRipple = ({ trigger }: { trigger: number }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (trigger === 0) return;
        scaleAnim.setValue(0);
        opacityAnim.setValue(0.6);
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 800, useNativeDriver: true })
        ]).start();
    }, [trigger]);

    return (
        <Animated.View style={[styles.rippleContainer, {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
        }]} />
    );
};

export default function GameScreen({ navigation }: { navigation: GameScreenNavigationProp }) {
    const [wordPairs, setWordPairs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const [userLevel, setUserLevel] = useState(1);
    const [currentXp, setCurrentXp] = useState(0);
    const [xpNeeded, setXpNeeded] = useState(5);
    const [timeWon, setTimeWon] = useState(0);

    const [successTrigger, setSuccessTrigger] = useState(0);
    const slideWordsAnim = useRef(new Animated.Value(0)).current;
    const successScaleAnim = useRef(new Animated.Value(1)).current;

    const sessionAnswersRef = useRef<any[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchWords = async (isInitial = false) => {
        try {
            const response = await api.get('/game/batch');
            const fetchedWords = response.data.data;
            if (fetchedWords && fetchedWords.length > 0) {
                setWordPairs(prev => isInitial ? fetchedWords : [...prev, ...fetchedWords]);
                if (isInitial) setIsLoading(false);
            } else if (isInitial) {
                setErrorMessage("Il n'y a pas d'énigmes disponibles pour le moment.");
                setIsLoading(false);
            }
        } catch (error) {
            if (isInitial) { setErrorMessage('Erreur de connexion au serveur.'); setIsLoading(false); }
        }
    };

    useEffect(() => { fetchWords(true); }, []);

    // GESTION DE LA FIN DE PARTIE (Mise à jour des dépendances pour éviter les closures vides)
    const triggerGameOver = useCallback(() => {
        if (isGameOver) return;
        setIsGameOver(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        // Capture du mot en cours sur lequel le temps s'est écoulé
        const currentPair = wordPairs[currentIndex];
        if (currentPair) {
            sessionAnswersRef.current.push({
                wordPairId: currentPair._id,
                answer: answer.trim() || "Temps écoulé",
                timeSpent: 30, // Temps maximum écoulé
                isCorrect: false,
                accuracy: 0
            });
        }

        api.post('/game/validate', { answers: sessionAnswersRef.current })
            .then(res => {
                const result = res.data.data;
                const formattedDetails = sessionAnswersRef.current.map(ans => ({
                    word: ans.answer || "Passé", 
                    accuracy: ans.accuracy || 0, 
                    label: ans.isCorrect ? "SUCCÈS" : "ÉCHEC"
                }));
                navigation.replace('GameOver', { 
                    score: result.totalScore, 
                    details: formattedDetails,
                    corrections: result.corrections || []
                });
            })
            .catch(() => navigation.replace('Home'));
    }, [isGameOver, navigation, wordPairs, currentIndex, answer]);

    useEffect(() => {
        if (isLoading || isGameOver || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    triggerGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isLoading, isGameOver, currentIndex, triggerGameOver]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsGameOver(true);
            };
        }, [])
    );

    useEffect(() => {
        if (wordPairs.length > 0 && currentIndex === wordPairs.length - 3) fetchWords();
    }, [currentIndex, wordPairs.length]);

    const submitAnswer = async () => {
        console.log("[DEBUG] Bouton cliqué. Réponse actuelle :", answer);
        
        if (!answer.trim()) {
            console.log("[DEBUG] Blocage : Le champ est vide.");
            return;
        }
        if (isChecking || isGameOver) {
            console.log("[DEBUG] Blocage : isChecking=", isChecking, " isGameOver=", isGameOver);
            return;
        }

        setIsChecking(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        const currentPair = wordPairs[currentIndex];
        const timeSpent = 30 - Math.max(0, timeLeft);

        try {
            console.log("[DEBUG] Envoi au backend...");
            const response = await api.post('/game/check', {
                wordPairId: currentPair._id,
                answer: answer.trim(),
                timeSpent: timeSpent
            });
            const result = response.data.data;

            if (result.isCorrect) {
                setSuccessTrigger(prev => prev + 1);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeWon(result.timeWon);

                setTimeLeft(prev => Math.min(30, prev + result.timeWon));
                setUserLevel(result.newLevel);
                setCurrentXp(result.currentXp);
                setXpNeeded(result.xpNeeded);

                sessionAnswersRef.current.push({
                    wordPairId: currentPair._id, answer: answer.trim(), timeSpent, isCorrect: true, accuracy: result.accuracy
                });
                goToNextWord();
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setIsChecking(false);
            }
        } catch (error) { 
            console.error('[DEBUG] Erreur vérification API :', error);
            setIsChecking(false); 
        }
    };

    const goToNextWord = () => {
        setAnswer('');
        Animated.timing(slideWordsAnim, { toValue: -width, duration: 200, useNativeDriver: true }).start(() => {
            setCurrentIndex(prev => prev + 1);
            slideWordsAnim.setValue(width);
            Animated.spring(slideWordsAnim, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }).start(() => {
                setIsChecking(false);
            });
        });
    };

    const handleTimeGainEnd = () => setTimeWon(0);

    if (isLoading) return <GameLoading />;
    if (errorMessage || wordPairs.length === 0) return <GameEmpty message={errorMessage} onBack={() => navigation.navigate('Home')} />;

    const currentPair = wordPairs[currentIndex];

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <GameHeader level={userLevel} currentXp={currentXp} xpNeeded={xpNeeded} />
                
                <View style={styles.timerWrapper}>
                    <GameTimer 
                        timeLeft={timeLeft} 
                        maxTime={30} 
                        timeWon={timeWon} 
                        onTimeGainAnimationEnd={handleTimeGainEnd} 
                    />
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.playAreaWrapper}>
                        <SuccessRipple trigger={successTrigger} />
                        <Animated.View style={{ transform: [{ scale: successScaleAnim }] }}>
                            <Animated.View style={{ transform: [{ translateX: slideWordsAnim }] }}>
                                <GamePlayArea currentPair={currentPair} />
                            </Animated.View>
                        </Animated.View>
                    </View>
                </ScrollView>

                <GameInputArea 
                    answer={answer} 
                    setAnswer={setAnswer} 
                    submitAnswer={submitAnswer} 
                    expectedType={currentPair?.expectedType}
                    clue={currentPair?.clue}
                    onHintPress={() => {}}
                    isAnimating={isChecking}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: colors.nightBlue,
    },
    timerWrapper: {
        paddingHorizontal: spacing.xl,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    playAreaWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    rippleContainer: {
        position: 'absolute',
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        backgroundColor: colors.mint,
        zIndex: 0,
    }
});