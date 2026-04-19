//src/screens/GameScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions 
} from 'react-native';
import { colors } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenWrapper from '../components/layout/ScreenWrapper';
import GameLoading from '../components/game/GameLoading';
import GameEmpty from '../components/game/GameEmpty';
import GameHeader from '../components/game/GameHeader';
import GamePlayArea from '../components/game/GamePlayArea';
import GameInputArea from '../components/game/GameInputArea';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }: { navigation: GameScreenNavigationProp }) {
    const [wordPairs, setWordPairs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [sessionAnswers, setSessionAnswers] = useState<any[]>([]);

    const progressAnim = useRef(new Animated.Value(1)).current;
    const slideWordsAnim = useRef(new Animated.Value(0)).current;
    const morphInputAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchWords();
    }, []);

    useEffect(() => {
        if (isLoading || wordPairs.length === 0 || isAnimating) return;

        progressAnim.setValue(1);
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: timeLeft * 1000,
            useNativeDriver: false,
        }).start();

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            progressAnim.stopAnimation();
        };
    }, [currentIndex, isLoading, wordPairs.length, isAnimating]);

    useEffect(() => {
        if (timeLeft <= 0 && wordPairs.length > 0 && currentIndex < wordPairs.length && !isAnimating) {
            handleTimeUp();
        }
    }, [timeLeft, wordPairs.length, currentIndex, isAnimating]);

    const fetchWords = async () => {
        try {
            const response = await api.get('/game/batch');
            const fetchedWords = response.data.data;

            setTimeout(() => {
                if (fetchedWords && fetchedWords.length > 0) {
                    setWordPairs(fetchedWords);
                } else {
                    setErrorMessage("Il n'y a pas d'énigmes disponibles pour le moment.");
                }
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            setErrorMessage('Erreur de connexion au serveur.');
            setIsLoading(false);
        }
    };

    const handleTimeUp = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        triggerNextWord(''); 
    };

    const submitAnswer = () => {
        if (!answer.trim() || isSubmitting || isAnimating) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
        triggerNextWord(answer);
    };

    const triggerNextWord = (userText: string) => {
        setIsAnimating(true);
        const timeSpent = 30 - Math.max(0, timeLeft);
        const currentPair = wordPairs[currentIndex];

        const newAnswer = {
            wordPairId: currentPair._id,
            answer: userText,
            timeSpent: timeSpent
        };
        const updatedAnswers = [...sessionAnswers, newAnswer];
        setSessionAnswers(updatedAnswers);

        Animated.sequence([
            Animated.timing(morphInputAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.spring(morphInputAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
            Animated.timing(slideWordsAnim, { toValue: -width, duration: 200, useNativeDriver: true })
        ]).start(() => {
            if (currentIndex < wordPairs.length - 1) {
                setAnswer('');
                setCurrentIndex((prev) => prev + 1);
                setTimeLeft(30);
                slideWordsAnim.setValue(width);
                
                Animated.spring(slideWordsAnim, { 
                    toValue: 0, friction: 7, tension: 50, useNativeDriver: true 
                }).start(() => {
                    setIsAnimating(false);
                });
            } else {
                finishSession(updatedAnswers);
            }
        });
    };

    const finishSession = async (finalAnswers: any[]) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/game/validate', { answers: finalAnswers });
            const result = response.data.data;
            
            const formattedDetails = finalAnswers.map(ans => {
                const isCorrect = !result.corrections.some((c: any) => c.userAnswer === ans.answer);
                return {
                    word: ans.answer || "Passé",
                    accuracy: isCorrect ? 100 : 0,
                    label: isCorrect ? "+XP" : "ÉCHEC"
                };
            });

            navigation.navigate('GameOver', { 
                score: result.totalScore, 
                details: formattedDetails 
            });
            
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            navigation.navigate('Home');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <GameLoading />;
    if (errorMessage || wordPairs.length === 0) return <GameEmpty message={errorMessage} onBack={() => navigation.navigate('Home')} />;

    const currentPair = wordPairs[currentIndex];

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <GameHeader currentIndex={currentIndex} totalWords={wordPairs.length} />

                <View style={styles.timerContainer}>
                    <View style={styles.timerTrack} />
                    <Animated.View style={[styles.timerBar, {
                        width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                        }) as any,
                        backgroundColor: timeLeft > 10 ? colors.coral : colors.error
                    }]} />
                </View>

                <GamePlayArea 
                    timeLeft={timeLeft} 
                    currentPair={currentPair} 
                    slideWordsAnim={slideWordsAnim} 
                />

                <GameInputArea 
                    answer={answer} 
                    setAnswer={setAnswer} 
                    submitAnswer={submitAnswer} 
                    isSubmitting={isSubmitting} 
                    isAnimating={isAnimating} 
                    morphInputAnim={morphInputAnim} 
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    timerContainer: { height: 4, width: '100%', position: 'relative' },
    timerTrack: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.sand, opacity: 0.1 },
    timerBar: { height: '100%', position: 'absolute', top: 0, left: 0 },
});