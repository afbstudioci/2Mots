//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Dimensions } from 'react-native';
import api from '../services/api';
import { useFeedback } from './useFeedback';
import { useAudio } from './useAudio';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export const useGameLogic = (navigation: any) => {
    const { user } = useAuth();
    const { triggerSuccessVibration, triggerErrorVibration, triggerWarningVibration, triggerVibration } = useFeedback();
    const { playSuccess, playLevelUp, playGameOver } = useAudio();

    const [wordPairs, setWordPairs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    // Stats de session (Initialisées avec les données locales de l'utilisateur)
    const [userLevel, setUserLevel] = useState(user?.level || 1);
    const [currentXp, setCurrentXp] = useState(user?.xp || 0);
    const [xpNeeded, setXpNeeded] = useState(3 + ((user?.level || 1) * 2));
    const [timeWon, setTimeWon] = useState(0);
    const [successTrigger, setSuccessTrigger] = useState(0);
    const [lastAccuracy, setLastAccuracy] = useState(0);

    const sessionAnswersRef = useRef<any[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const appState = useRef(AppState.currentState);
    const backgroundTimeRef = useRef<number | null>(null);
    const hasTriggeredGameOver = useRef(false);

    // Fetch des mots par lot (Batch)
    const fetchWords = async (isInitial = false) => {
        try {
            const response = await api.get('/game/batch');
            const fetchedWords = response.data.data;
            const stats = response.data.userStats;

            if (fetchedWords && fetchedWords.length > 0) {
                setWordPairs(prev => isInitial ? fetchedWords : [...prev, ...fetchedWords]);
                
                if (isInitial && stats) {
                    setUserLevel(stats.level);
                    setCurrentXp(stats.xp);
                    setXpNeeded(stats.xpNeeded);
                    setIsLoading(false);
                } else if (isInitial) {
                    setIsLoading(false);
                }
            }
        } catch (error) {
            if (isInitial) { setErrorMessage('Erreur de connexion.'); setIsLoading(false); }
        }
    };

    useEffect(() => { fetchWords(true); }, []);

    // Gestion de la fin de partie
    const triggerGameOver = useCallback(() => {
        if (hasTriggeredGameOver.current) return;
        hasTriggeredGameOver.current = true;
        
        setIsGameOver(true);
        triggerWarningVibration(); 
        playGameOver();
        
        const currentPair = wordPairs[currentIndex];
        if (currentPair) {
            sessionAnswersRef.current.push({
                wordPairId: currentPair._id,
                answer: answer.trim() || "Temps écoulé",
                timeSpent: 30,
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
    }, [navigation, wordPairs, currentIndex, answer]);

    // Timer et Anti-triche
    useEffect(() => {
        if (isLoading || hasTriggeredGameOver.current || timeLeft <= 0) {
            if (timeLeft <= 0 && !hasTriggeredGameOver.current && !isLoading) triggerGameOver();
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    triggerGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isLoading, currentIndex, triggerGameOver, timeLeft]);

    // Soumission de la réponse
    const submitAnswer = async (inputAreaRef: any) => {
        if (!answer.trim() || isChecking || hasTriggeredGameOver.current) return;
        setIsChecking(true);
        triggerVibration(); 

        const currentPair = wordPairs[currentIndex];
        try {
            const response = await api.post('/game/check', {
                wordPairId: currentPair._id,
                answer: answer.trim(),
                timeSpent: 30 - timeLeft
            });
            const result = response.data.data;

            if (result.isCorrect) {
                setLastAccuracy(result.accuracy);
                setSuccessTrigger(prev => prev + 1);
                triggerSuccessVibration();
                
                // Si on passe au niveau supérieur, on joue le son LevelUp, sinon le son Succès normal
                if (result.newLevel > userLevel) {
                    playLevelUp();
                } else {
                    playSuccess();
                }

                setTimeWon(result.timeWon);
                setTimeLeft(prev => Math.min(30, prev + result.timeWon));
                setUserLevel(result.newLevel);
                setCurrentXp(result.currentXp);
                setXpNeeded(result.xpNeeded);

                sessionAnswersRef.current.push({
                    wordPairId: currentPair._id, answer: answer.trim(), isCorrect: true, accuracy: result.accuracy
                });
                return true; // Indique au screen de lancer l'animation de slide
            } else {
                triggerErrorVibration();
                inputAreaRef.current?.triggerShake();
                setIsChecking(false);
                return false;
            }
        } catch (error) { 
            setIsChecking(false); 
            return false;
        }
    };

    return {
        wordPairs, currentIndex, setCurrentIndex, timeLeft, setTimeLeft,
        answer, setAnswer, isLoading, errorMessage, isChecking, setIsChecking,
        userLevel, currentXp, xpNeeded, timeWon, setTimeWon, successTrigger, lastAccuracy,
        submitAnswer, hasTriggeredGameOver
    };
};