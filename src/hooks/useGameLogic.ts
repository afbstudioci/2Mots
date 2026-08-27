//src/hooks/useGameLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from './useAudio';
import { useGameBoosters } from './useGameBoosters';
import { useGameTimer } from './useGameTimer';
import { useLiveRivals } from './useLiveRivals';
import api from '../services/api';
import { getLocalGameBatch, shuffleArray } from '../services/offlineVault';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';
import * as Haptics from 'expo-haptics';

const normalizeStr = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const useGameLogic = () => {
  const { user } = useAuth();
  const { playSuccess, playError, playLevelUp, playHint, playDanger, stopBgm, playChest } = useAudio();
  const liveRivals = useLiveRivals();

  const [wordPairs, setWordPairs] = useState<EnrichedWordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [userLevel, setUserLevel] = useState(user?.level || 1);
  const [currentXp, setCurrentXp] = useState(user?.xp || 0);
  const [xpNeeded, setXpNeeded] = useState(3 + (user?.level || 1) * 2);
  const [userKevs, setUserKevs] = useState(user?.kevs || 0);
  const [kevyKeys, setKevyKeys] = useState(user?.kevyKeys || 0);
  const [showKevyChest, setShowKevyChest] = useState(false);
  const [isFeverMode, setIsFeverMode] = useState(false);
  const [successTrigger, setSuccessTrigger] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(100);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [errorLimitData, setErrorLimitData] = useState<{ visible: boolean; count: number; reason: string } | null>(null);
  const [isFastCombo, setIsFastCombo] = useState(false);

  const feverStreakRef = useRef(0);
  const kevyKeysRef = useRef(user?.kevyKeys || 0);
  const consecutiveErrorsRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const playedWordIdsRef = useRef<string[]>([]);
  const sessionAnswersRef = useRef<GameAnswer[]>([]);
  const playedPairsHistoryRef = useRef<Map<string, any>>(new Map());
  const isFetchingNextBatch = useRef(false);

  const userLevelRef = useRef(userLevel);
  userLevelRef.current = userLevel;
  const currentXpRef = useRef(currentXp);
  currentXpRef.current = currentXp;
  const userKevsRef = useRef(userKevs);
  userKevsRef.current = userKevs;

  const currentPairRef = useRef<EnrichedWordPair | null>(null);
  currentPairRef.current = wordPairs[currentIndex] || null;

  const timer = useGameTimer({
    isLoading, showLevelUpModal, showKevyChest, errorLimitData, userLevel,
    userLevelRef, currentXpRef, userKevsRef, currentPairRef, sessionAnswersRef,
    playedPairsHistoryRef, kevyKeysRef, stopBgm, playDanger,
  });

  const boosters = useGameBoosters({
    user, userKevs, setUserKevs, currentPair: currentPairRef.current, isChecking,
    hasTriggeredGameOver: timer.hasTriggeredGameOver, playHint, playSuccess,
    onTimeFreezeActivated: () => timer.freezeTimer(5),
    onSecondChanceReset: () => {
      consecutiveErrorsRef.current = 0;
      totalErrorsRef.current = 0;
      feverStreakRef.current = 0;
      setIsFeverMode(false);
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
      const excludeParam = playedWordIdsRef.current.slice(-20).join(',');
      const res = await api.get(`/game/batch?exclude=${excludeParam}`, { timeout: 60000 });
      const d = res.data?.data;
      const { rivals, threatBehind, userRank } = res.data || {};
      if (rivals?.length) liveRivals.setRivalData(rivals, threatBehind, userRank || 1);

      let fresh = Array.isArray(d) ? d.filter((p: any) => !new Set(playedWordIdsRef.current.slice(-15)).has(p._id)) : [];
      if (!fresh.length) fresh = d || getLocalGameBatch(30, userLevel, playedWordIdsRef.current.slice(-20));

      if (fresh.length) {
        setWordPairs((prev) => [...prev, ...fresh.map((p: any, idx: number) => ({
          ...p,
          options: shuffleArray(p.options || []),
          hasKey: typeof p.hasKey === 'boolean' ? p.hasKey : (idx === 17)
        }))]);
      }
    } catch {
      const local = getLocalGameBatch(30, userLevel, playedWordIdsRef.current.slice(-20));
      if (local.length) setWordPairs((prev) => [...prev, ...(local as any).map((p: any, idx: number) => ({ ...p, hasKey: idx === 17 }))]);
    } finally {
      isFetchingNextBatch.current = false;
    }
  }, [userLevel]);

  const loadInitialBatch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/game/batch', { timeout: 90000 });
      const { data: d, userStats: s, rivals, threatBehind, userRank } = res.data || {};
      if (rivals?.length) liveRivals.setRivalData(rivals, threatBehind, userRank || 1);
      if (d?.length) {
        setWordPairs(d.map((p: any, idx: number) => ({ ...p, options: shuffleArray(p.options || []), hasKey: typeof p.hasKey === 'boolean' ? p.hasKey : (idx === 17) })));
        if (s) {
          setUserLevel(s.level || 1); setCurrentXp(s.xp || 0);
          setXpNeeded(s.xpNeeded || 3 + (s.level || 1) * 2); setUserKevs(s.kevs || 0);
          if (typeof s.kevyKeys === 'number') { setKevyKeys(s.kevyKeys); kevyKeysRef.current = s.kevyKeys; }
        }
      } else { throw new Error('Vide'); }
    } catch {
      const local = getLocalGameBatch(30, 1, []);
      setWordPairs((local as any).map((p: any, idx: number) => ({ ...p, hasKey: idx === 17 })));
    } finally {
      setIsLoading(false);
      timer.resetTimer();
    }
  }, []);

  useEffect(() => { loadInitialBatch(); boosters.syncInventory(); }, []);
  useEffect(() => { if (wordPairs.length && currentIndex >= wordPairs.length - 4) fetchNextBatch(); }, [currentIndex, wordPairs.length, fetchNextBatch]);

  const selectChoice = (choice: string, onSuccessTransition: () => void) => {
    if (isChecking || selectedChoice !== null || timer.hasTriggeredGameOver || showKevyChest) return;
    const pair = currentPairRef.current;
    if (!pair) return;

    setSelectedChoice(choice);
    setIsChecking(true);
    const timeSpent = Math.max(1, (timer.maxTime || 30) - timer.timeLeft);
    const solution = pair.exactMatch?.[0] || pair.options[0];
    const isCorrect = pair.exactMatch?.some((m: string) => normalizeStr(m) === normalizeStr(choice)) ?? (normalizeStr(solution) === normalizeStr(choice));

    setIsCorrectState(isCorrect);
    setCorrectChoice(solution);
    playedPairsHistoryRef.current.set(pair._id, pair);
    sessionAnswersRef.current.push({ wordPairId: pair._id, answer: choice, isCorrect, timeSpent, accuracy: isCorrect ? 100 : 0 });
    playedWordIdsRef.current.push(pair._id);

    if (currentIndex + 4 >= wordPairs.length) fetchNextBatch();

    if (isCorrect) {
      consecutiveErrorsRef.current = 0;
      setLastAccuracy(100);
      setSuccessTrigger((prev) => prev + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      playSuccess();

      const currentScore = sessionAnswersRef.current.filter((a) => a.isCorrect).length;
      liveRivals.onScoreUpdated(currentScore);

      const isFast = timeSpent <= 3.5 && !boosters.isHintUsed;
      setIsFastCombo(isFast);
      if (isFast) {
        feverStreakRef.current += 1;
        if (feverStreakRef.current >= 3 && !isFeverMode) setIsFeverMode(true);
      } else if (!isFeverMode) { feverStreakRef.current = 0; }

      if ((pair as any)?.hasKey) {
        setKevyKeys((prev: number) => {
          const next = Math.min(3, prev + 1);
          kevyKeysRef.current = next;
          if (user) user.kevyKeys = next;
          api.post('/game/sync-keys', { kevyKeys: next }, { timeout: 3000 }).catch(() => {});
          if (next >= 3) { setTimeout(() => { setShowKevyChest(true); playChest(); }, 300); }
          return next;
        });
      }

      const correctCount = sessionAnswersRef.current.filter((a) => a.isCorrect).length;
      const kevsToAdd = (isFeverMode || isFast) ? 1 : (correctCount % 2 === 0 ? 1 : 0);
      const xpToAdd = isFeverMode ? 3 : (isFast ? 2 : 1);
      const bonusMs = isFeverMode ? 12000 : (isFast ? 10000 : 8000);

      if (kevsToAdd > 0) {
        setUserKevs((prev: number) => prev + kevsToAdd);
        if (user) user.kevs = (user.kevs || 0) + kevsToAdd;
      }
      timer.setTimeWon(Math.floor(bonusMs / 1000));
      timer.addTimeMs(bonusMs);

      setCurrentXp((prev: number) => {
        const next = prev + xpToAdd;
        const needed = 3 + userLevel * 2;
        if (next >= needed) {
          const nextLvl = userLevel + 1;
          setUserLevel(nextLvl); setXpNeeded(3 + nextLvl * 2);
          setShowLevelUpModal(true); playLevelUp();
          if (user) { user.level = nextLvl; user.xp = 0; user.kevs = (user.kevs || 0) + 5; }
          api.post('/game/sync-level', { level: nextLvl, xp: 0, kevs: (userKevs || 0) + 5 }, { timeout: 3000 }).catch(() => {});
          return 0;
        }
        return next;
      });
    } else {
      setIsFastCombo(false); setIsFeverMode(false); feverStreakRef.current = 0;
      consecutiveErrorsRef.current += 1; totalErrorsRef.current += 1;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      playError();
      timer.addTimeMs(-4000);
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
      setSelectedChoice(null); setCorrectChoice(null); setIsCorrectState(null);
      setIsFastCombo(false); boosters.resetBoosterState(); setIsChecking(false);
      if (!showLevelUpModal && !showKevyChest && !timer.hasTriggeredGameOver && !errorLimitData?.visible) {
        onSuccessTransition();
      }
    }, isCorrect ? 300 : 450);
  };

  const handleCloseLevelUp = () => { setShowLevelUpModal(false); timer.resetTimer(); };
  const handleCloseKevyChest = (gains: { kevs: number; freeze: number; hint: number; shield: number }) => {
    setShowKevyChest(false); setKevyKeys(0); kevyKeysRef.current = 0;
    if (user) { user.kevyKeys = 0; if (gains.kevs > 0) user.kevs = (user.kevs || 0) + gains.kevs; }
    if (gains.kevs > 0) setUserKevs((prev: number) => prev + gains.kevs);
    if (gains.freeze > 0) boosters.addBooster('freeze', gains.freeze);
    if (gains.hint > 0) boosters.addBooster('hint', gains.hint);
    if (gains.shield > 0) boosters.addBooster('shield', gains.shield);
    api.post('/game/chest-opened', { gains }, { timeout: 3000 }).catch(() => {});
    timer.resetTimer();
  };

  return {
    wordPairs, currentIndex, setCurrentIndex, timeLeft: timer.timeLeft, maxTime: timer.maxTime,
    selectedChoice, correctChoice, isCorrectState, isFastCombo, isFeverMode, isLoading, errorMessage: null, isChecking,
    eliminatedChoices: boosters.eliminatedChoices, isHintUsed: boosters.isHintUsed,
    handleUseHint: boosters.handleUseHint, handleUseTimeFreeze: boosters.handleUseTimeFreeze,
    handleUseSuperClue: boosters.handleUseSuperClue, handleUseSecondChance: boosters.handleUseSecondChance,
    isTimeFrozen: timer.isTimeFrozen || boosters.isTimeFrozen, timeFreezeCount: boosters.timeFreezeCount,
    superClueCount: boosters.superClueCount, secondChanceCount: boosters.secondChanceCount,
    showNoKevsModal: boosters.showNoKevsModal, setShowNoKevsModal: boosters.setShowNoKevsModal,
    userLevel, currentXp, xpNeeded, userKevs, kevyKeys, showKevyChest, handleCloseKevyChest,
    activeRivalAlert: liveRivals.activeAlert, timeWon: timer.timeWon, setTimeWon: timer.setTimeWon,
    successTrigger, lastAccuracy, selectChoice, showLevelUpModal, setShowLevelUpModal,
    handleCloseLevelUp, errorLimitData, setErrorLimitData, triggerGameOver: timer.triggerGameOver,
  };
};