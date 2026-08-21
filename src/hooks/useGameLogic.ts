//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAudio } from './useAudio';
import api from '../services/api';
import { getLocalGameBatch, shuffleArray } from '../services/offlineVault';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';
import * as Haptics from 'expo-haptics';

const normalizeStr = (str: string) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const useGameLogic = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { playSuccess, playError, playLevelUp, playHint, playDanger, stopBgm } = useAudio();

  const [wordPairs, setWordPairs] = useState<EnrichedWordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [eliminatedChoices, setEliminatedChoices] = useState<string[]>([]);
  const [isHintUsed, setIsHintUsed] = useState<boolean>(false);
  const [showNoKevsModal, setShowNoKevsModal] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<number>(user?.level || 1);
  const [currentXp, setCurrentXp] = useState<number>(user?.xp || 0);
  const [xpNeeded, setXpNeeded] = useState<number>(3 + (user?.level || 1) * 2);
  const [userKevs, setUserKevs] = useState<number>(user?.kevs || 0);
  const [timeWon, setTimeWon] = useState<number>(0);
  const [successTrigger, setSuccessTrigger] = useState<number>(0);
  const [lastAccuracy, setLastAccuracy] = useState<number>(100);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [errorLimitData, setErrorLimitData] = useState<{ visible: boolean; count: number; reason: string } | null>(null);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);

  const [timeFreezeCount, setTimeFreezeCount] = useState<number>(user?.inventory?.boosters?.timeFreeze ?? 2);
  const [superClueCount, setSuperClueCount] = useState<number>(user?.inventory?.boosters?.superClue ?? 2);
  const [secondChanceCount, setSecondChanceCount] = useState<number>(user?.inventory?.boosters?.secondChance ?? 1);

  const isInitialLoad = useRef<boolean>(true);
  const timeLeftMsRef = useRef<number>(30000);
  const lastTickTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);
  const hasTriggeredGameOver = useRef<boolean>(false);
  const consecutiveErrorsRef = useRef<number>(0);
  const totalErrorsRef = useRef<number>(0);
  const playedWordIdsRef = useRef<string[]>([]);
  const sessionAnswersRef = useRef<GameAnswer[]>([]);
  const backgroundTimeRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const currentPairRef = useRef<EnrichedWordPair | null>(null);
  currentPairRef.current = wordPairs[currentIndex] || null;

  const wordPairsRef = useRef<EnrichedWordPair[]>([]);
  wordPairsRef.current = wordPairs;

  const syncInventory = useCallback(async () => {
    try {
      const res = await api.get('/shop/catalog', { timeout: 3000 });
      const d = res.data?.data;
      if (d) {
        if (d.inventory?.boosters) {
          setTimeFreezeCount(d.inventory.boosters.timeFreeze ?? 2);
          setSuperClueCount(d.inventory.boosters.superClue ?? 2);
          setSecondChanceCount(d.inventory.boosters.secondChance ?? 1);
        }
        if (d.userKevs !== undefined) setUserKevs(d.userKevs);
      }
    } catch {}
  }, []);

  const loadBatch = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      const res = await api.get('/game/batch', { timeout: 3500 });
      const d = res.data.data;
      const s = res.data.userStats;
      if (d?.length > 0) {
        const filtered = d.filter((p: any) => !playedWordIdsRef.current.includes(p._id));
        const finalPool = filtered.length > 0 ? filtered : d;
        setWordPairs(finalPool.map((p: any) => ({ ...p, options: shuffleArray(p.options || []) })));
        if (!isSilent) setCurrentIndex(0);
        if (s && !isSilent) {
          setUserLevel(s.level || 1);
          setCurrentXp(s.xp || 0);
          setXpNeeded(s.xpNeeded || (3 + (s.level || 1) * 2));
          setUserKevs(s.kevs || 0);
        }
      } else {
        throw new Error('Batch vide');
      }
    } catch {
      if (!isSilent) {
        const local = getLocalGameBatch(10, userLevel, playedWordIdsRef.current);
        setWordPairs(local as any);
        setCurrentIndex(0);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
      lastTickTimeRef.current = Date.now();
    }
  }, [userLevel]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadBatch(false);
      syncInventory();
    }
  }, [loadBatch, syncInventory]);

    const playedPairsHistoryRef = useRef<Map<string, any>>(new Map());

  const triggerGameOver = useCallback((reason?: string) => {
    if (hasTriggeredGameOver.current) return;
    hasTriggeredGameOver.current = true;
    stopBgm();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setErrorLimitData(null);

    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}

    const pair = currentPairRef.current;
    if (pair) {
      playedPairsHistoryRef.current.set(pair._id, pair);
      if (!sessionAnswersRef.current.some(a => a.wordPairId === pair._id)) {
        sessionAnswersRef.current.push({
          wordPairId: pair._id,
          answer: reason || 'Temps écoulé',
          timeSpent: 30,
          isCorrect: false,
          accuracy: 0,
        });
      }
    }

    const answers = sessionAnswersRef.current;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
    const wrongAnswers = answers.filter((a) => !a.isCorrect);

    const enigmasSummary = answers.map((item) => {
      const p = playedPairsHistoryRef.current.get(item.wordPairId) || wordPairsRef.current.find((w) => w._id === item.wordPairId);
      return {
        word1: p?.word1 || '',
        word2: p?.word2 || '',
        userAnswer: item.answer || 'Temps écoulé',
        expectedAnswer: p?.exactMatch?.[0] || p?.options?.[0] || 'Inconnu',
        isCorrect: Boolean(item.isCorrect),
      };
    });

    api.post('/game/end', { score: correctCount, answers }, { timeout: 3500 }).catch(() => {});

    navigation.replace('GameOver', {
      score: correctCount,
      reason,
      stats: {
        accuracy,
        correctCount,
        errorCount: wrongAnswers.length,
      },
      enigmasSummary,
    });
  }, [navigation, stopBgm]);

  useEffect(() => {
    if (isLoading || hasTriggeredGameOver.current) return;
    lastTickTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      if (hasTriggeredGameOver.current || errorLimitData?.visible || showLevelUpModal || isTimeFrozen) {
        lastTickTimeRef.current = Date.now();
        return;
      }
      const now = Date.now();
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      timeLeftMsRef.current = Math.max(0, timeLeftMsRef.current - delta);
      const remainingSec = Math.ceil(timeLeftMsRef.current / 1000);
      setTimeLeft(remainingSec);

      if (remainingSec === 6 && timeLeftMsRef.current > 5800) {
        playDanger();
      }

      if (timeLeftMsRef.current <= 0) {
        clearInterval(timerIntervalRef.current);
        triggerGameOver('Temps ecoule');
      }
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isLoading, playDanger, triggerGameOver, errorLimitData?.visible, showLevelUpModal, isTimeFrozen]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active' && backgroundTimeRef.current) {
        const elapsed = Date.now() - backgroundTimeRef.current;
        backgroundTimeRef.current = null;
        lastTickTimeRef.current = Date.now();
        if (!showLevelUpModal && !errorLimitData?.visible && !isTimeFrozen) {
          timeLeftMsRef.current = Math.max(0, timeLeftMsRef.current - elapsed);
          const rem = Math.ceil(timeLeftMsRef.current / 1000);
          setTimeLeft(rem);
          if (timeLeftMsRef.current <= 0 && !hasTriggeredGameOver.current) {
            triggerGameOver('Temps ecoule');
          }
        }
      }
      if (next.match(/inactive|background/)) {
        backgroundTimeRef.current = Date.now();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [triggerGameOver, showLevelUpModal, errorLimitData?.visible, isTimeFrozen]);

  const handleCloseLevelUp = () => {
    setShowLevelUpModal(false);
    timeLeftMsRef.current = 30000;
    setTimeLeft(30);
    lastTickTimeRef.current = Date.now();
  };

  const handleUseHint = () => {
    if (isHintUsed || isChecking || hasTriggeredGameOver.current) return;
    if (userKevs < 5) {
      setShowNoKevsModal(true);
      return;
    }
    const pair = currentPairRef.current;
    if (!pair?.options || pair.options.length < 3) return;

    setUserKevs((prev: number) => Math.max(0, prev - 5));
    api.post('/game/use-hint', {}, { timeout: 2000 }).catch(() => {});
    const exact = pair.exactMatch ? pair.exactMatch[0] : pair.options[0];
    const wrong = pair.options.filter((o: string) => normalizeStr(o) !== normalizeStr(exact));
    const toEliminate = wrong[Math.floor(Math.random() * wrong.length)];
    setEliminatedChoices([toEliminate]);
    setIsHintUsed(true);
    playHint();
  };

  const handleUseTimeFreeze = async () => {
    if (isTimeFrozen || isChecking || hasTriggeredGameOver.current) return;
    if (timeFreezeCount <= 0 && userKevs < 15) {
      setShowNoKevsModal(true);
      return;
    }

    try {
      if (timeFreezeCount > 0) setTimeFreezeCount(prev => prev - 1);
      else setUserKevs(prev => Math.max(0, prev - 15));

      api.post('/shop/use-booster', { boosterType: 'timeFreeze' }).catch(() => {});
      setIsTimeFrozen(true);
      setTimeWon(5);
      timeLeftMsRef.current = Math.min(30000, timeLeftMsRef.current + 5000);
      setTimeLeft(Math.ceil(timeLeftMsRef.current / 1000));
      playHint();

      setTimeout(() => {
        setIsTimeFrozen(false);
        lastTickTimeRef.current = Date.now();
      }, 5000);
    } catch {}
  };

  const handleUseSuperClue = async () => {
    if (isChecking || hasTriggeredGameOver.current) return;
    if (superClueCount <= 0 && userKevs < 25) {
      setShowNoKevsModal(true);
      return;
    }
    const pair = currentPairRef.current;
    if (!pair?.options) return;

    try {
      if (superClueCount > 0) setSuperClueCount(prev => prev - 1);
      else setUserKevs(prev => Math.max(0, prev - 25));

      api.post('/shop/use-booster', { boosterType: 'superClue' }).catch(() => {});
      const exact = pair.exactMatch ? pair.exactMatch[0] : pair.options[0];
      const allWrong = pair.options.filter((o: string) => normalizeStr(o) !== normalizeStr(exact));
      setEliminatedChoices(allWrong);
      setIsHintUsed(true);
      playSuccess();
    } catch {}
  };

  const handleUseSecondChance = async (onTransition?: () => void) => {
    if (secondChanceCount <= 0 && userKevs < 30) {
      setShowNoKevsModal(true);
      return;
    }

    try {
      if (secondChanceCount > 0) setSecondChanceCount(prev => prev - 1);
      else setUserKevs(prev => Math.max(0, prev - 30));

      api.post('/shop/use-booster', { boosterType: 'secondChance' }).catch(() => {});
      consecutiveErrorsRef.current = 0;
      totalErrorsRef.current = 0;
      setErrorLimitData(null);
      hasTriggeredGameOver.current = false;

      setSelectedChoice(null);
      setCorrectChoice(null);
      setIsCorrectState(null);
      setIsChecking(false);
      setEliminatedChoices([]);
      setIsHintUsed(false);

      timeLeftMsRef.current = 30000;
      setTimeLeft(30);
      lastTickTimeRef.current = Date.now();

      playSuccess();
      if (onTransition) {
        onTransition();
      }
    } catch {}
  };

  const selectChoice = (choice: string, onSuccessTransition: () => void) => {
    if (isChecking || selectedChoice !== null || hasTriggeredGameOver.current) return;
    const pair = currentPairRef.current;
    if (!pair) return;

    setSelectedChoice(choice);
    setIsChecking(true);
    const timeSpent = Math.max(1, 30 - timeLeft);

    const officialSolution = pair.exactMatch?.[0] || pair.options[0];
    const isCorrect = pair.exactMatch?.some((m: string) => normalizeStr(m) === normalizeStr(choice)) ?? (normalizeStr(officialSolution) === normalizeStr(choice));

    setIsCorrectState(isCorrect);
    setCorrectChoice(officialSolution);

    playedPairsHistoryRef.current.set(pair._id, pair);
sessionAnswersRef.current.push({ wordPairId: pair._id, answer: choice, isCorrect, timeSpent, accuracy: isCorrect ? 100 : 0 });
    playedWordIdsRef.current.push(pair._id);

    if (isCorrect) {
      consecutiveErrorsRef.current = 0;
      setLastAccuracy(100);
      setSuccessTrigger((prev: number) => prev + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      playSuccess();
      setUserKevs((prev: number) => prev + 1);
      if (user) user.kevs = (user.kevs || 0) + 1;
      setTimeWon(8);
      timeLeftMsRef.current = Math.min(30000, timeLeftMsRef.current + 8000);
      setTimeLeft(Math.ceil(timeLeftMsRef.current / 1000));

      setCurrentXp((prev: number) => {
        const next = prev + 1;
        const needed = 3 + userLevel * 2;
        if (next >= needed) {
          const nextLvl = userLevel + 1;
          setUserLevel(nextLvl);
          setXpNeeded(3 + nextLvl * 2);
          setShowLevelUpModal(true);
          playLevelUp();
          if (user) {
            user.level = nextLvl;
            user.xp = 0;
            user.kevs = (user.kevs || 0) + 5;
          }
          loadBatch(true);
          return 0;
        }
        return next;
      });
    } else {
      consecutiveErrorsRef.current += 1;
      totalErrorsRef.current += 1;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      playError();

      if (consecutiveErrorsRef.current >= 3) {
        setTimeout(() => {
          setErrorLimitData({ visible: true, count: 3, reason: '3 erreurs consecutives' });
        }, 150);
        return;
      }
      if (totalErrorsRef.current >= 5) {
        setTimeout(() => {
          setErrorLimitData({ visible: true, count: 5, reason: '5 erreurs cumulees' });
        }, 150);
        return;
      }
    }

    if (!pair._id.startsWith('off_')) {
      api.post('/game/check', { wordPairId: pair._id, answer: choice, timeSpent }, { timeout: 3000 }).catch(() => {});
    }

    setTimeout(() => {
      setSelectedChoice(null);
      setCorrectChoice(null);
      setIsCorrectState(null);
      setEliminatedChoices([]);
      setIsHintUsed(false);
      setIsChecking(false);
      if (!showLevelUpModal && !hasTriggeredGameOver.current && !errorLimitData?.visible) {
        onSuccessTransition();
      }
    }, isCorrect ? 300 : 450);
  };

  useEffect(() => {
    return () => {
      stopBgm();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stopBgm]);

  return {
    wordPairs, currentIndex, setCurrentIndex, timeLeft, setTimeLeft,
    selectedChoice, correctChoice, isCorrectState, isLoading, errorMessage: null, isChecking,
    eliminatedChoices, isHintUsed, handleUseHint, handleUseTimeFreeze, handleUseSuperClue,
    handleUseSecondChance, isTimeFrozen, timeFreezeCount, superClueCount, secondChanceCount,
    showNoKevsModal, setShowNoKevsModal,
    userLevel, currentXp, xpNeeded, userKevs, timeWon, setTimeWon, successTrigger,
    lastAccuracy, selectChoice, showLevelUpModal, setShowLevelUpModal,
    handleCloseLevelUp, errorLimitData, setErrorLimitData, triggerGameOver,
  };
};