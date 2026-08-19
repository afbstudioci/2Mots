//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import { RootStackParamList } from '../../App';
import { useAudioContext } from '../context/AudioContext';
import { getLocalGameBatch } from '../services/offlineVault';
import { queueOfflineSession } from '../services/syncService';
import * as Haptics from 'expo-haptics';

const vib = (t: 'light' | 'success' | 'warn' | 'error') => {
  try {
    if (t === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (t === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (t === 'warn') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (t === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
};

const normalizeStr = (s: string) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export interface EnrichedWordPair {
  _id: string;
  word1: string;
  word2: string;
  clue: string;
  expectedType?: string;
  difficulty?: number;
  exactMatch?: string[];
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
      const res = await api.get('/game/batch', { timeout: 3500 });
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
        throw new Error('Batch vide');
      }
    } catch {
      const localBatch = getLocalGameBatch(10);
      setWordPairs(localBatch as any);
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

    const answers = sessionAnswersRef.current;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const localScore = correctCount * 100;

    queueOfflineSession({
      score: localScore,
      durationMs: answers.reduce((acc, a) => acc + (a.timeSpent || 0) * 1000, 0),
      rounds: answers.map((a) => ({
        wordPairId: a.wordPairId,
        word1: '',
        word2: '',
        answer: a.answer,
        isCorrect: Boolean(a.isCorrect),
        timeSpentMs: (a.timeSpent || 0) * 1000,
      })),
    }).catch(() => {});

    api
      .post('/game/validate', { answers }, { timeout: 3000 })
      .then((res) => {
        const r = res.data.data;
        navigation.replace('GameOver', {
          score: r.totalScore,
          details: answers.map((a) => ({
            word: a.answer || 'Passé',
            accuracy: a.accuracy || 0,
            label: a.isCorrect ? 'SUCCÈS' : 'ÉCHEC',
          })),
          corrections: r.corrections || [],
          hasScore: answers.some((a) => a.isCorrect),
        });
      })
      .catch(() => {
        navigation.replace('GameOver', {
          score: localScore,
          details: answers.map((a) => ({
            word: a.answer || 'Passé',
            accuracy: a.accuracy || 0,
            label: a.isCorrect ? 'SUCCÈS' : 'ÉCHEC',
          })),
          corrections: [],
          hasScore: correctCount > 0,
        });
      });
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
    const uF = navigation.addListener('focus', () => {
      if (!hasTriggeredGameOver.current && !isLoading) playBgm();
    });
    const uB = navigation.addListener('blur', () => {
      if (!hasTriggeredGameOver.current) {
        stopBgm();
        backgroundTimeRef.current = Date.now();
      }
    });
    return () => {
      uF();
      uB();
    };
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
    api.post('/game/use-hint', {}, { timeout: 2000 }).catch(() => {});

    // Éliminer un mauvais choix
    const exact = pair.exactMatch ? pair.exactMatch[0] : pair.options[0];
    const wrongOptions = pair.options.filter((o) => normalizeStr(o) !== normalizeStr(exact));
    const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

    setEliminatedChoice(toEliminate);
    setIsHintUsed(true);
    playHint();
    vib('light');
  };

  // VALIDATION INSTANTANÉE (0 MS) & FLUIDITÉ ABSOLUE
  const selectChoice = (choice: string, onSuccessTransition: () => void) => {
    if (isChecking || selectedChoice !== null || hasTriggeredGameOver.current) return;

    const pair = wordPairs[currentIndex];
    if (!pair) return;

    setSelectedChoice(choice);
    setIsChecking(true);

    const timeSpent = Math.max(1, 30 - timeLeft);

    // Détermination locale instantanée de la solution exacte
    let isCorrect = false;
    let officialSolution = pair.options[0];

    if (pair.exactMatch && Array.isArray(pair.exactMatch) && pair.exactMatch.length > 0) {
      officialSolution = pair.exactMatch[0];
      isCorrect = pair.exactMatch.some((m) => normalizeStr(m) === normalizeStr(choice));
    } else {
      isCorrect = normalizeStr(pair.options[0]) === normalizeStr(choice);
    }

    setIsCorrectState(isCorrect);
    setCorrectChoice(officialSolution);

    sessionAnswersRef.current.push({
      wordPairId: pair._id,
      answer: choice,
      isCorrect,
      timeSpent,
      accuracy: isCorrect ? 100 : 0,
    });

    if (isCorrect) {
      setLastAccuracy(100);
      setSuccessTrigger((prev) => prev + 1);
      vib('success');
      playSuccess();

      const gained = 8;
      setTimeWon(gained);
      setTimeLeft((prev) => Math.min(30, prev + gained));

      setCurrentXp((prev) => {
        const next = prev + 1;
        if (next >= xpNeeded) {
          setUserLevel((lvl) => lvl + 1);
          setXpNeeded((req) => req + 2);
          playLevelUp();
          setShowLevelUpModal(true);
          return 0;
        }
        return next;
      });

      // Synchronisation réseau silencieuse en arrière-plan sans bloquer l'UI
      if (!pair._id.startsWith('off_')) {
        api.post('/game/check', { wordPairId: pair._id, answer: choice, timeSpent }, { timeout: 3000 }).catch(() => {});
      }
    } else {
      vib('error');
      playError();
      if (!pair._id.startsWith('off_')) {
        api.post('/game/check', { wordPairId: pair._id, answer: choice, timeSpent }, { timeout: 3000 }).catch(() => {});
      }
    }

    // Transition ultra-réactive
    setTimeout(() => {
      setSelectedChoice(null);
      setCorrectChoice(null);
      setIsCorrectState(null);
      setEliminatedChoice(null);
      setIsHintUsed(false);
      setIsChecking(false);
      if (!showLevelUpModal) {
        onSuccessTransition();
      }
    }, isCorrect ? 380 : 650);
  };

  useEffect(() => {
    return () => {
      stopBgm();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopBgm]);

  return {
    wordPairs,
    currentIndex,
    setCurrentIndex,
    timeLeft,
    setTimeLeft,
    selectedChoice,
    correctChoice,
    isCorrectState,
    isLoading,
    errorMessage,
    isChecking,
    eliminatedChoice,
    isHintUsed,
    handleUseHint,
    showNoKevsModal,
    setShowNoKevsModal,
    userLevel,
    currentXp,
    xpNeeded,
    userKevs,
    timeWon,
    setTimeWon,
    successTrigger,
    lastAccuracy,
    selectChoice,
    showLevelUpModal,
    setShowLevelUpModal,
  };
};