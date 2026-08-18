//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import { RootStackParamList } from '../../App';
import { useAudioContext } from '../context/AudioContext';

const vib = (type: 'light' | 'success' | 'warn' | 'error') => {
  try {
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === 'warn') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (e) {}
};

export interface EnrichedWordPair {
  _id: string;
  word1: string;
  word2: string;
  clue?: string;
  expectedType?: string;
  difficulty?: number;
  options: string[];
}

export const useGameLogic = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { playSuccess, playError, playDanger, playLevelUp, stopBgm, playBgm, playHint } = useAudioContext();

  const [wordPairs, setWordPairs] = useState<EnrichedWordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [eliminatedChoice, setEliminatedChoice] = useState<string | null>(null);
  const [isHintUsed, setIsHintUsed] = useState(false);
  const [showNoKevsModal, setShowNoKevsModal] = useState(false);

  const [userLevel, setUserLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [xpNeeded, setXpNeeded] = useState(5);
  const [userKevs, setUserKevs] = useState(0);
  const [timeWon, setTimeWon] = useState(0);
  const [successTrigger, setSuccessTrigger] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(100);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const timerRef = useRef<any>(null);
  const sessionAnswersRef = useRef<any[]>([]);
  const hasTriggeredGameOver = useRef(false);
  const backgroundTimeRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const fetchBatch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/game/batch');
      const d = res.data.data;
      const s = res.data.userStats;
      if (d?.length > 0) {
        setWordPairs(d);
        setCurrentIndex(0);
        if (s) {
          setUserLevel(s.level);
          setCurrentXp(s.xp);
          setXpNeeded(s.xpNeeded);
          setUserKevs(s.kevs || 0);
        }
      } else {
        setErrorMessage('Aucune énigme disponible.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur chargement.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatch(); }, [fetchBatch]);

  const triggerGameOver = useCallback(() => {
    if (hasTriggeredGameOver.current) return;
    hasTriggeredGameOver.current = true;
    stopBgm();
    vib('warn');

    const pair = wordPairs[currentIndex];
    if (pair) {
      sessionAnswersRef.current.push({
        wordPairId: pair._id,
        answer: selectedChoice || 'Temps écoulé',
        timeSpent: 30,
        isCorrect: false,
        accuracy: 0,
      });
    }

    api.post('/game/validate', { answers: sessionAnswersRef.current }).then((res) => {
      const r = res.data.data;
      navigation.replace('GameOver', {
        score: r.totalScore,
        details: sessionAnswersRef.current.map((a) => ({ word: a.answer || 'Passé', accuracy: a.accuracy || 0, label: a.isCorrect ? 'SUCCÈS' : 'ÉCHEC' })),
        corrections: r.corrections || [],
        hasScore: sessionAnswersRef.current.some((a) => a.isCorrect),
      });
    }).catch(() => navigation.replace('Home'));
  }, [navigation, wordPairs, currentIndex, selectedChoice, stopBgm]);

  useEffect(() => {
    if (isLoading || hasTriggeredGameOver.current || showLevelUpModal) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerGameOver();
          return 0;
        }
        if (prev === 6) playDanger();
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLoading, triggerGameOver, playDanger, showLevelUpModal]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active' && backgroundTimeRef.current) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        backgroundTimeRef.current = null;
        setTimeLeft((prev) => {
          const updated = prev - elapsed;
          if (updated <= 0 && !hasTriggeredGameOver.current) {
            setTimeout(() => triggerGameOver(), 50);
            return 0;
          }
          return Math.max(0, updated);
        });
      }
      if (next.match(/inactive|background/)) backgroundTimeRef.current = Date.now();
      appState.current = next;
    });
    return () => sub.remove();
  }, [triggerGameOver]);

  useEffect(() => {
    const uF = navigation.addListener('focus', () => { if (!hasTriggeredGameOver.current && !isLoading) playBgm(); });
    const uB = navigation.addListener('blur', () => { if (!hasTriggeredGameOver.current) { stopBgm(); backgroundTimeRef.current = Date.now(); } });
    return () => { uF(); uB(); };
  }, [navigation, isLoading, playBgm, stopBgm]);

  const handleUseHint = () => {
    if (isHintUsed || isChecking || hasTriggeredGameOver.current) return;
    if (userKevs < 5) {
      vib('warn');
      setShowNoKevsModal(true);
      return;
    }
    const pair = wordPairs[currentIndex];
    if (!pair?.options || pair.options.length < 3) return;

    setUserKevs((prev) => Math.max(0, prev - 5));
    api.post('/game/use-hint').catch(() => {});
    const falseOpts = pair.options.slice(1);
    setEliminatedChoice(falseOpts[Math.floor(Math.random() * falseOpts.length)]);
    setIsHintUsed(true);
    playHint();
    vib('light');
  };

  const selectChoice = async (choice: string, onSuccessTransition: () => void) => {
    if (isChecking || selectedChoice !== null || hasTriggeredGameOver.current) return;
    setSelectedChoice(choice);
    setIsChecking(true);
    vib('light');

    const pair = wordPairs[currentIndex];
    if (!pair) return;

    try {
      const res = await api.post('/game/check', { wordPairId: pair._id, answer: choice, timeSpent: Math.max(1, 30 - timeLeft) });
      const r = res.data.data;
      const isCorrect = Boolean(r.isCorrect);
      setIsCorrectState(isCorrect);
      setCorrectChoice(r.correctAnswer || choice);

      sessionAnswersRef.current.push({ wordPairId: pair._id, answer: choice, isCorrect, accuracy: isCorrect ? (r.accuracy || 100) : 0 });

      if (isCorrect) {
        setLastAccuracy(r.accuracy || 100);
        setSuccessTrigger((prev) => prev + 1);
        vib('success');
        if (r.newLevel > userLevel) { 
          playLevelUp(); 
          setShowLevelUpModal(true); 
        } else { 
          playSuccess(); 
        }
        const gained = r.timeWon || 8;
        setTimeWon(gained);
        setTimeLeft((prev) => Math.min(30, prev + gained));
        setUserLevel(r.newLevel);
        setCurrentXp(r.currentXp);
        setXpNeeded(r.xpNeeded);
        if (r.totalKevs !== undefined) setUserKevs(r.totalKevs);
      } else {
        vib('error');
        playError();
      }

      setTimeout(() => {
        setSelectedChoice(null); setCorrectChoice(null); setIsCorrectState(null);
        setEliminatedChoice(null); setIsHintUsed(false); setIsChecking(false);
        if (!showLevelUpModal) {
          onSuccessTransition();
        }
      }, isCorrect ? 450 : 750);
    } catch {
      setSelectedChoice(null); setCorrectChoice(null); setIsCorrectState(null);
      setEliminatedChoice(null); setIsHintUsed(false); setIsChecking(false);
    }
  };

  useEffect(() => {
    return () => { stopBgm(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [stopBgm]);

  return {
    wordPairs, currentIndex, setCurrentIndex, timeLeft, setTimeLeft, selectedChoice, correctChoice,
    isCorrectState, isLoading, errorMessage, isChecking, eliminatedChoice, isHintUsed, handleUseHint,
    showNoKevsModal, setShowNoKevsModal, userLevel, currentXp, xpNeeded, userKevs, timeWon, setTimeWon,
    successTrigger, lastAccuracy, selectChoice, showLevelUpModal, setShowLevelUpModal,
  };
};