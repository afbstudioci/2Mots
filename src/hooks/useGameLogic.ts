//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import { RootStackParamList } from '../../App';
import { useAudioContext } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { getLocalGameBatch, shuffleArray } from '../services/offlineVault';
import { queueOfflineSession } from '../services/syncService';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';
import * as Haptics from 'expo-haptics';

const normalizeStr = (s: string) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const useGameLogic = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { playSuccess, playError, playDanger, playLevelUp, stopBgm, playBgm, playHint } = useAudioContext();
  const { user } = useAuth();

  const [wordPairs, setWordPairs] = useState<EnrichedWordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [eliminatedChoice, setEliminatedChoice] = useState<string | null>(null);
  const [isHintUsed, setIsHintUsed] = useState<boolean>(false);
  const [showNoKevsModal, setShowNoKevsModal] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<number>(user?.level || 1);
  const [currentXp, setCurrentXp] = useState<number>(user?.xp || 0);
  const [xpNeeded, setXpNeeded] = useState<number>(5);
  const [userKevs, setUserKevs] = useState<number>(user?.kevs || 0);
  const [timeWon, setTimeWon] = useState<number>(0);
  const [successTrigger, setSuccessTrigger] = useState<number>(0);
  const [lastAccuracy, setLastAccuracy] = useState<number>(100);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const sessionAnswersRef = useRef<GameAnswer[]>([]);
  const hasTriggeredGameOver = useRef<boolean>(false);
  const backgroundTimeRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const fetchBatch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/game/batch', { timeout: 3500 });
      const d = res.data.data;
      const s = res.data.userStats;
      if (d?.length > 0) {
        setWordPairs(d.map((p: any) => ({ ...p, options: shuffleArray(p.options || []) })));
        setCurrentIndex(0);
        if (s) {
          setUserLevel(s.level);
          setCurrentXp(s.xp);
          setXpNeeded(s.xpNeeded);
          setUserKevs(s.kevs || 0);
        }
      } else {
        throw new Error('Batch vide');
      }
    } catch {
      setWordPairs(getLocalGameBatch(10) as any);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  const triggerGameOver = useCallback(() => {
    if (hasTriggeredGameOver.current) return;
    hasTriggeredGameOver.current = true;
    stopBgm();
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}

    const pair = wordPairs[currentIndex];
    if (pair) {
      sessionAnswersRef.current.push({
        wordPairId: pair._id,
        answer: selectedChoice || 'Temps ecoule',
        timeSpent: 30,
        isCorrect: false,
        accuracy: 0,
      });
    }

    const answers = sessionAnswersRef.current;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const localScore = correctCount * 100;

    queueOfflineSession({
      score: localScore,
      durationMs: answers.reduce((acc: number, a: GameAnswer) => acc + (a.timeSpent || 0) * 1000, 0),
      rounds: answers.map((a: GameAnswer) => ({
        wordPairId: a.wordPairId,
        word1: '',
        word2: '',
        answer: a.answer,
        isCorrect: Boolean(a.isCorrect),
        timeSpentMs: (a.timeSpent || 0) * 1000,
      })),
    }).catch(() => {});

    api.post('/game/validate', { answers }, { timeout: 3000 })
      .then((res) => {
        const r = res.data.data;
        navigation.replace('GameOver', {
          score: r.totalScore,
          details: answers.map((a: GameAnswer) => ({ word: a.answer || 'Passe', accuracy: a.accuracy || 0, label: a.isCorrect ? 'SUCCES' : 'ECHEC' })),
          corrections: r.corrections || [],
          hasScore: answers.some((a: GameAnswer) => a.isCorrect),
        });
      })
      .catch(() => {
        navigation.replace('GameOver', {
          score: localScore,
          details: answers.map((a: GameAnswer) => ({ word: a.answer || 'Passe', accuracy: a.accuracy || 0, label: a.isCorrect ? 'SUCCES' : 'ECHEC' })),
          corrections: [],
          hasScore: correctCount > 0,
        });
      });
  }, [navigation, wordPairs, currentIndex, selectedChoice, stopBgm]);

  useEffect(() => {
    if (isLoading || hasTriggeredGameOver.current || showLevelUpModal) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev: number) => {
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
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active' && backgroundTimeRef.current) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        backgroundTimeRef.current = null;
        setTimeLeft((prev: number) => {
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

  const handleUseHint = () => {
    if (isHintUsed || isChecking || hasTriggeredGameOver.current) return;
    if (userKevs < 5) {
      setShowNoKevsModal(true);
      return;
    }
    const pair = wordPairs[currentIndex];
    if (!pair?.options || pair.options.length < 3) return;

    setUserKevs((prev: number) => Math.max(0, prev - 5));
    api.post('/game/use-hint', {}, { timeout: 2000 }).catch(() => {});
    const exact = pair.exactMatch ? pair.exactMatch[0] : pair.options[0];
    const wrong = pair.options.filter((o: string) => normalizeStr(o) !== normalizeStr(exact));
    setEliminatedChoice(wrong[Math.floor(Math.random() * wrong.length)]);
    setIsHintUsed(true);
    playHint();
  };

  const selectChoice = (choice: string, onSuccessTransition: () => void) => {
    if (isChecking || selectedChoice !== null || hasTriggeredGameOver.current) return;
    const pair = wordPairs[currentIndex];
    if (!pair) return;

    setSelectedChoice(choice);
    setIsChecking(true);
    const timeSpent = Math.max(1, 30 - timeLeft);

    const officialSolution = pair.exactMatch?.[0] || pair.options[0];
    const isCorrect = pair.exactMatch?.some((m: string) => normalizeStr(m) === normalizeStr(choice)) ?? (normalizeStr(officialSolution) === normalizeStr(choice));

    setIsCorrectState(isCorrect);
    setCorrectChoice(officialSolution);

    sessionAnswersRef.current.push({ wordPairId: pair._id, answer: choice, isCorrect, timeSpent, accuracy: isCorrect ? 100 : 0 });

    if (isCorrect) {
      setLastAccuracy(100);
      setSuccessTrigger((prev: number) => prev + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      playSuccess();
      setUserKevs((prev: number) => prev + 1);
      if (user) user.kevs = (user.kevs || 0) + 1;
      setTimeWon(8);
      setTimeLeft((prev: number) => Math.min(30, prev + 8));

      setCurrentXp((prev: number) => {
        const next = prev + 1;
        if (next >= xpNeeded) {
          setUserLevel((lvl: number) => lvl + 1);
          setXpNeeded((req: number) => req + 2);
          playLevelUp();
          setShowLevelUpModal(true);
          return 0;
        }
        return next;
      });
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      playError();
    }

    if (!pair._id.startsWith('off_')) {
      api.post('/game/check', { wordPairId: pair._id, answer: choice, timeSpent }, { timeout: 3000 }).catch(() => {});
    }

    setTimeout(() => {
      setSelectedChoice(null);
      setCorrectChoice(null);
      setIsCorrectState(null);
      setEliminatedChoice(null);
      setIsHintUsed(false);
      setIsChecking(false);
      if (!showLevelUpModal) onSuccessTransition();
    }, isCorrect ? 350 : 600);
  };

  useEffect(() => {
    return () => {
      stopBgm();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopBgm]);

  return {
    wordPairs, currentIndex, setCurrentIndex, timeLeft, setTimeLeft,
    selectedChoice, correctChoice, isCorrectState, isLoading, errorMessage: null, isChecking,
    eliminatedChoice, isHintUsed, handleUseHint, showNoKevsModal, setShowNoKevsModal,
    userLevel, currentXp, xpNeeded, userKevs, timeWon, setTimeWon, successTrigger,
    lastAccuracy, selectChoice, showLevelUpModal, setShowLevelUpModal,
  };
};