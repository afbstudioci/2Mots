//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Dimensions } from 'react-native';
import api from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import { useFeedback } from './useFeedback';
import { useAudio } from './useAudio';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export const useGameLogic = (navigation: any) => {
    const { user } = useAuth();
    const isFocused = useIsFocused();
    const { triggerSuccessVibration, triggerErrorVibration, triggerWarningVibration, triggerVibration } = useFeedback();
    const { playSuccess, playLevelUp, playGameOver, stopGameOver, playBgm, stopBgm, playHint, playError, playDanger } = useAudio();

    const [wordPairs, setWordPairs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);

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
                    playBgm(); // Lancer la musique dès que c'est prêt
                } else if (isInitial) {
                    setIsLoading(false);
                    playBgm();
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
        stopBgm(); // Arrêter la musique de fond
        triggerWarningVibration(); 
        
        // On vérifie s'il y a eu au moins une bonne réponse dans la session
        const hasScore = sessionAnswersRef.current.some(a => a.isCorrect);
        // On ne joue pas le son ici pour éviter les coupures lors de la transition
        // playGameOver(hasScore); 
        
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
                    corrections: result.corrections || [],
                    hasScore: hasScore
                });
            })
            .catch(() => navigation.replace('Home'));
    }, [navigation, wordPairs, currentIndex, answer]);

    // Gestion du focus pour la musique et synchronisation du temps
    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            if (!hasTriggeredGameOver.current && !isLoading) {
                playBgm();
                
                // Si on revient d'un écran (ex: Shop) et que le temps s'est écoulé
                if (backgroundTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
                    setTimeLeft(prev => {
                        const newTime = Math.max(0, prev - elapsed);
                        if (newTime <= 0 && !hasTriggeredGameOver.current) {
                            // On laisse l'UI se mettre à jour puis on trigger
                            setTimeout(() => triggerGameOver(), 100);
                        }
                        return newTime;
                    });
                    backgroundTimeRef.current = null;
                }
            }
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            if (!hasTriggeredGameOver.current) {
                stopBgm();
                // On marque le temps de départ pour la synchro au retour
                backgroundTimeRef.current = Date.now();
            }
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation, isLoading, triggerGameOver]);

    // Gestion de l'AppState (Background/Foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (backgroundTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
                    setTimeLeft(prev => {
                        const newTime = Math.max(0, prev - elapsed);
                        if (newTime <= 0 && !hasTriggeredGameOver.current) {
                            setTimeout(() => triggerGameOver(), 100);
                        }
                        return newTime;
                    });
                    backgroundTimeRef.current = null;
                }
            }
            if (nextAppState.match(/inactive|background/)) {
                backgroundTimeRef.current = Date.now();
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [triggerGameOver]);


    // Timer et Anti-triche
    useEffect(() => {
        // Le temps ne s'arrête jamais, même si !isFocused
        if (isLoading || hasTriggeredGameOver.current || timeLeft <= 0) {
            if (timeLeft <= 0 && !hasTriggeredGameOver.current && !isLoading) triggerGameOver();
            return;
        }

        // Alerte sonore pour le Panic Mode (5 dernières secondes)
        if (timeLeft <= 5 && timeLeft > 0) {
            playDanger();
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
    }, [isLoading, currentIndex, triggerGameOver, timeLeft, isFocused]);

    // Soumission de la réponse
    const submitAnswer = async (inputAreaRef: any): Promise<{ isCorrect: boolean, isLevelUp: boolean }> => {
        if (!answer.trim() || isChecking || hasTriggeredGameOver.current) return { isCorrect: false, isLevelUp: false };
        setIsChecking(true);
        triggerVibration(); 
        
        let isLevelUp = false;
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
                
                // Si on passe au niveau supérieur, on joue le son LevelUp et on affiche la modale, sinon le son Succès normal
                if (result.newLevel > userLevel) {
                    playLevelUp();
                    setShowLevelUpModal(true);
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
                return { isCorrect: true, isLevelUp: result.newLevel > userLevel }; 
            } else {
                triggerErrorVibration();
                playError(); // Son d'erreur
                inputAreaRef.current?.triggerShake();
                setIsChecking(false);
                return { isCorrect: false, isLevelUp: false };
            }
        } catch (error) { 
            setIsChecking(false); 
            return { isCorrect: false, isLevelUp: false };
        }
    };

    // Nettoyage à la destruction du hook (quand on quitte le GameScreen)
    useEffect(() => {
        return () => {
            stopBgm();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        wordPairs, currentIndex, setCurrentIndex, timeLeft, setTimeLeft,
        answer, setAnswer, isLoading, errorMessage, isChecking, setIsChecking,
        userLevel, currentXp, xpNeeded, timeWon, setTimeWon, successTrigger, lastAccuracy,
        submitAnswer, hasTriggeredGameOver, playHint, stopGameOver,
        showLevelUpModal, setShowLevelUpModal
    };
};