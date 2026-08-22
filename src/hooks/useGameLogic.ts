//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from './useAudio';
import { useGameBoosters } from './useGameBoosters';
import { useGameTimer } from './useGameTimer';
import api from '../services/api';
import { getLocalGameBatch, shuffleArray } from '../services/offlineVault';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';
import * as Haptics from 'expo-haptics';

const normalizeStr = (str: string) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const useGameLogic = () => {
  const { user } = useAuth();
  const { playSuccess, playError, playLevelUp, playHint, playDanger, stopBgm } = useAudio();

  const [wordPairs, setWordPairs] = useState<EnrichedWordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<number>(user?.level || 1);
  const [currentXp, setCurrentXp] = useState<number>(user?.xp || 0);
  const [xpNeeded, setXpNeeded] = useState<number>(3 + (user?.level || 1) * 2);
  const [userKevs, setUserKevs] = useState<number>(user?.kevs || 0);
  const [successTrigger, setSuccessTrigger] = useState<number>(0);
  const [lastAccuracy, setLastAccuracy] = useState<number>(100);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [errorLimitData, setErrorLimitData] = useState<{ visible: boolean; count: number; reason: string } | null>(null);

  const consecutiveErrorsRef = useRef<number>(0);
  const totalErrorsRef = useRef<number>(0);
  const playedWordIdsRef = useRef<string[]>([]);
  const sessionAnswersRef = useRef<GameAnswer[]>([]);
  const playedPairsHistoryRef = useRef<Map<string, any>>(new Map());
  const isFetchingNextBatch = useRef<boolean>(false);

  const currentPairRef = useRef<EnrichedWordPair | null>(null);
  currentPairRef.current = wordPairs[currentIndex] || null;

  const [isFastCombo, setIsFastCombo] = useState<boolean>(false);

  const timer = useGameTimer({
    isLoading,
    isTimeFrozen: false,
    showLevelUpModal,
    errorLimitData,
    userLevel,
    currentPairRef,
    sessionAnswersRef,
    playedPairsHistoryRef,
    stopBgm,
    playDanger,
  });

  const boosters = useGameBoosters({
    user,
    userKevs,
    setUserKevs,
    currentPair: currentPairRef.current,
    isChecking,
    hasTriggeredGameOver: timer.hasTriggeredGameOver,
    playHint,
    playSuccess,
    onTimeFreezeActivated: () => {
      timer.freezeTimer(5);
    },
    onSecondChanceReset: () => {
      consecutiveErrorsRef.current = 0;
      totalErrorsRef.current = 0;
      setErrorLimitData(null);
      setSelectedChoice(null);
      setCorrectChoice(null);
      setIsCorrectState(null);
      setIsChecking(false);
      timer.resetTimer();
    },
  });

  const fetchNextBatch = useCallback(async () => {
    if (isFetchingNextBatch.current) return;
    isFetchingNextBatch.current = true;
    try {
      const excludeParam = playedWordIdsRef.current.slice(-50).join(',');
      const res = await api.get(`/game/batch?exclude=${excludeParam}`, { timeout: 3500 });
      const d = res.data?.data;
      if (d && Array.isArray(d) && d.length > 0) {
        const fresh = d.filter((p: any) => !playedWordIdsRef.current.includes(p._id));
        if (fresh.length > 0) {
          const enriched = fresh.map((p: any) => ({ ...p, options: shuffleArray(p.options || []) }));
          setWordPairs((prev) => {
            const existingIds = new Set(prev.map((i) => i._id));
            const uniqueNew = enriched.filter((i: any) => !existingIds.has(i._id));
            return [...prev, ...uniqueNew];
          });
        }
      }
    } catch {
      const local = getLocalGameBatch(15, userLevel, playedWordIdsRef.current);
      if (local.length > 0) {
        setWordPairs((prev) => {
          const existingIds = new Set(prev.map((i) => i._id));
          const uniqueNew = (local as any).filter((i: any) => !existingIds.has(i._id));
          return [...prev, ...uniqueNew];
        });
      }
    } finally {
      isFetchingNextBatch.current = false;
    }
  }, [userLevel]);

  const loadInitialBatch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/game/batch', { timeout: 3500 });
      const d = res.data?.data;
      const s = res.data?.userStats;
      if (d?.length > 0) {
        setWordPairs(d.map((p: any) => ({ ...p, options: shuffleArray(p.options || []) })));
        if (s) {
          setUserLevel(s.level || 1);
          setCurrentXp(s.xp || 0);
          setXpNeeded(s.xpNeeded || 3 + (s.level || 1) * 2);
          setUserKevs(s.kevs || 0);
        }
      } else {
        throw new Error('Batch initial vide');
      }
    } catch {
      const local = getLocalGameBatch(15, 1, []);
      setWordPairs(local as any);
    } finally {
      setIsLoading(false);
      timer.resetTimer();
    }
  }, []);

  useEffect(() => {
    loadInitialBatch();
    boosters.syncInventory();
  }, []);

  const selectChoice = (choice: string, onSuccessTransition: () => void) => {
    if (isChecking || selectedChoice !== null || timer.hasTriggeredGameOver) return;
    const pair = currentPairRef.current;
    if (!pair) return;

    setSelectedChoice(choice);
    setIsChecking(true);
    const maxT = timer.maxTime || 30;
    const timeSpent = Math.max(1, maxT - timer.timeLeft);

    const officialSolution = pair.exactMatch?.[0] || pair.options[0];
    const isCorrect = pair.exactMatch?.some((m: string) => normalizeStr(m) === normalizeStr(choice)) ?? (normalizeStr(officialSolution) === normalizeStr(choice));

    setIsCorrectState(isCorrect);
    setCorrectChoice(officialSolution);

    playedPairsHistoryRef.current.set(pair._id, pair);
    sessionAnswersRef.current.push({ wordPairId: pair._id, answer: choice, isCorrect, timeSpent, accuracy: isCorrect ? 100 : 0 });
    playedWordIdsRef.current.push(pair._id);

    if (currentIndex + 4 >= wordPairs.length) {
      fetchNextBatch();
    }

    if (isCorrect) {
      consecutiveErrorsRef.current = 0;
      setLastAccuracy(100);
      setSuccessTrigger((prev) => prev + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      playSuccess();

      const isFast = timeSpent <= 3 && !boosters.isHintUsed;
      setIsFastCombo(isFast);
      const kevsToAdd = isFast ? 3 : 1; // +1 de base + 2 bonus de rapidité

      setUserKevs((prev) => prev + kevsToAdd);
      if (user) user.kevs = (user.kevs || 0) + kevsToAdd;
      timer.setTimeWon(isFast ? 10 : 8);
      timer.addTimeMs(isFast ? 10000 : 8000);

      setCurrentXp((prev) => {
        const next = prev + (isFast ? 2 : 1);
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
          return 0;
        }
        return next;
      });
    } else {
      setIsFastCombo(false);
      consecutiveErrorsRef.current += 1;
      totalErrorsRef.current += 1;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      playError();

      if (consecutiveErrorsRef.current >= 3) {
        setTimeout(() => setErrorLimitData({ visible: true, count: 3, reason: '3 erreurs consecutives' }), 150);
        return;
      }
      if (totalErrorsRef.current >= 5) {
        setTimeout(() => setErrorLimitData({ visible: true, count: 5, reason: '5 erreurs cumulees' }), 150);
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
      setIsFastCombo(false);
      boosters.resetBoosterState();
      setIsChecking(false);
      if (!showLevelUpModal && !timer.hasTriggeredGameOver && !errorLimitData?.visible) {
        onSuccessTransition();
      }
    }, isCorrect ? 300 : 450);
  };

  const handleCloseLevelUp = () => {
    setShowLevelUpModal(false);
    timer.resetTimer();
  };

  return {
    wordPairs, currentIndex, setCurrentIndex, timeLeft: timer.timeLeft, maxTime: timer.maxTime,
    selectedChoice, correctChoice, isCorrectState, isFastCombo, isLoading, errorMessage: null, isChecking,
    eliminatedChoices: boosters.eliminatedChoices, isHintUsed: boosters.isHintUsed,
    handleUseHint: boosters.handleUseHint, handleUseTimeFreeze: boosters.handleUseTimeFreeze,
    handleUseSuperClue: boosters.handleUseSuperClue, handleUseSecondChance: boosters.handleUseSecondChance,
    isTimeFrozen: timer.isTimeFrozen || boosters.isTimeFrozen, timeFreezeCount: boosters.timeFreezeCount,
    superClueCount: boosters.superClueCount, secondChanceCount: boosters.secondChanceCount,
    showNoKevsModal: boosters.showNoKevsModal, setShowNoKevsModal: boosters.setShowNoKevsModal,
    userLevel, currentXp, xpNeeded, userKevs, timeWon: timer.timeWon, setTimeWon: timer.setTimeWon,
    successTrigger, lastAccuracy, selectChoice, showLevelUpModal, setShowLevelUpModal,
    handleCloseLevelUp, errorLimitData, setErrorLimitData, triggerGameOver: timer.triggerGameOver,
  };
};