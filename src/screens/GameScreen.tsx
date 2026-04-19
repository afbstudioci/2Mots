import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    KeyboardAvoidingView, Platform, Animated 
} from 'react-native';
import { typography, colors, spacing, borderRadius } from '../theme/theme';
import CustomInput from '../components/common/CustomInput';
import api from '../services/api';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Importation de nos composants modulaires
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GameLoading from '../components/game/GameLoading';
import GameEmpty from '../components/game/GameEmpty';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export default function GameScreen({ navigation }: { navigation: GameScreenNavigationProp }) {
    const [wordPairs, setWordPairs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const progressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchWords();
    }, []);

    useEffect(() => {
        if (isLoading || wordPairs.length === 0) return;

        progressAnim.setValue(1);
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 30000,
            useNativeDriver: false,
        }).start();

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            progressAnim.stopAnimation();
        };
    }, [currentIndex, isLoading, wordPairs.length]);

    const fetchWords = async () => {
        try {
            const response = await api.get('/game/batch');
            const fetchedWords = response.data.data;
            
            // Delai artificiel de 2.5s pour admirer ton animation de chargement premium
            setTimeout(() => {
                if (fetchedWords && fetchedWords.length > 0) {
                    setWordPairs(fetchedWords);
                } else {
                    setErrorMessage("Il n'y a pas d'enigmes disponibles pour le moment.");
                }
                setIsLoading(false);
            }, 2500);

        } catch (error) {
            console.error('Erreur de chargement des mots');
            setTimeout(() => {
                setErrorMessage('Erreur de connexion au serveur.');
                setIsLoading(false);
            }, 2500);
        }
    };

    const handleTimeUp = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        moveToNextWord();
    };

    const submitAnswer = async () => {
        if (!answer.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const currentPair = wordPairs[currentIndex];
            const response = await api.post('/game/submit', {
                wordPairId: currentPair._id,
                userAnswer: answer,
                timeRemaining: timeLeft
            });

            const result = response.data.data;

            if (result.isCorrect) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setScore((prev) => prev + result.points);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            moveToNextWord();
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const moveToNextWord = () => {
        setAnswer('');
        if (currentIndex < wordPairs.length - 1) {
            setTimeLeft(30);
            setCurrentIndex((prev) => prev + 1);
        } else {
            api.post('/game/score', { score }).catch(e => console.error(e));
            navigation.navigate('Home');
        }
    };

    if (isLoading) {
        return <GameLoading />;
    }

    if (errorMessage || wordPairs.length === 0) {
        return <GameEmpty message={errorMessage} onBack={() => navigation.navigate('Home')} />;
    }

    const currentPair = wordPairs[currentIndex];

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>SCORE: {score}</Text>
                    <Text style={styles.headerText}>{currentIndex + 1} / {wordPairs.length}</Text>
                </View>

                <View style={styles.timerContainer}>
                    <Animated.View style={[styles.timerBar, {
                        width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                        }),
                        backgroundColor: timeLeft > 10 ? colors.coral : colors.error
                    }]} />
                </View>

                <View style={styles.gameArea}>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                    
                    <View style={styles.wordsBox}>
                        <View style={styles.singleWord}>
                            <Text style={styles.wordTitle}>{currentPair.word1}</Text>
                        </View>
                        <Text style={styles.plusSign}>+</Text>
                        <View style={styles.singleWord}>
                            <Text style={styles.wordTitle}>{currentPair.word2}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.inputArea}>
                    <CustomInput
                        value={answer}
                        onChangeText={setAnswer}
                        placeholder="Trouvez le lien..."
                        autoCapitalize="none"
                        autoFocus={true}
                        returnKeyType="send"
                        onSubmitEditing={submitAnswer}
                    />
                    
                    <TouchableOpacity 
                        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                        onPress={submitAnswer}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {isSubmitting ? 'VALIDATION...' : 'VALIDER'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
    },
    headerText: {
        fontFamily: 'Poppins_500Medium',
        color: colors.sand,
        fontSize: 16,
    },
    timerContainer: {
        height: 4,
        backgroundColor: 'rgba(244, 238, 224, 0.1)',
        width: '100%',
    },
    timerBar: {
        height: '100%',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    timerText: {
        ...typography.titleLarge,
        color: colors.sand,
        opacity: 0.8,
        marginBottom: spacing.xl,
    },
    wordsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        width: '100%',
    },
    singleWord: {
        flex: 1,
        alignItems: 'center',
    },
    wordTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        color: colors.sand,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    plusSign: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 24,
        color: colors.coral,
        marginHorizontal: spacing.md,
    },
    inputArea: {
        padding: spacing.xl,
        paddingBottom: spacing.xl * 2,
    },
    button: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.buttonPrimary,
        letterSpacing: 1,
    },
});