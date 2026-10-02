// src/hooks/useGameLogic.ts
// LOGIQUE PRINCIPALE DU JEU AVEC GESTION SECURISEE ET FLUIDE DES ENIGMES
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from './useAudio';
import { useGameBoosters } from './useGameBoosters';
import { useGameTimer } from './useGameTimer';
import { useLiveRivals } from './useLiveRivals';
import { useGameBatches } from './useGameBatches';
import api from '../services/api';
import { markEnigmasAsPlayed } from '../services/enigmaCacheService';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';
import * as Haptics from 'expo-haptics';

const normalizeStr = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const useGameLogic = () => {
  const { user, updateUser, updateKevs } = useAuth();
  const isVip = Boolean(user?.isVip);
  const { playSuccess, playError, playLevelUp, playHint, playDanger, stopBgm, playChest } = useAudio();
  const liveRivals = useLiveRivals();

  const [wordPairs, setWordPairs] = useState<EnrichedWordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const initialLevel = user?.level || 1;
  const initialNeeded = 3 + initialLevel * 2;
  const initialXp = Math.max(0, typeof user?.xp === 'number' && user.xp < initialNeeded ? user.xp : 0);
  const [userLevel, setUserLevel] = useState(initialLevel);
  const [currentXp, setCurrentXp] = useState(initialXp);
  const [xpNeeded, setXpNeeded] = useState(initialNeeded);
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

  const userLevelRef = useRef(userLevel);
  userLevelRef.current = userLevel;
  const currentXpRef = useRef(currentXp);
  currentXpRef.current = currentXp;
  const userKevsRef = useRef(userKevs);
  userKevsRef.current = userKevs;

  const currentPairRef = useRef<EnrichedWordPair | null>(null);
  currentPairRef.current = wordPairs[currentIndex] || null;
  const timerRef = useRef<any>(null);

  const boosters = useGameBoosters({
    user,
    userKevs,
    setUserKevs,
    currentPair: currentPairRef.current,
    isChecking,
    isTimeFrozen: timerRef.current?.isTimeFrozen ?? false,
    hasTriggeredGameOver: timerRef.current?.hasTriggeredGameOver ?? false,
    playHint,
    playSuccess,
    onTimeFreezeActivated: () => timerRef.current?.freezeTimer(5),
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
      timerRef.current?.resetTimer();
    },
  });

  const timer = useGameTimer({
    isLoading: false,
    showLevelUpModal,
    showKevyChest,
    errorLimitData,
    emergencyBoosterVisible: Boolean(boosters.emergencyBoosterType),
    isPaused: Boolean(boosters.emergencyBoosterType) || Boolean(errorLimitData?.visible) || showLevelUpModal || showKevyChest,
    userLevel,
    userLevelRef,
    currentXpRef,
    userKevsRef,
    currentPairRef,
    sessionAnswersRef,
    playedPairsHistoryRef,
    kevyKeysRef,
    stopBgm,
    playDanger,
  });
  timerRef.current = timer;

  const batches = useGameBatches({
    user, userLevel, setUserLevel, setCurrentXp, setXpNeeded, setUserKevs,
    setKevyKeys, kevyKeysRef, playedWordIdsRef, setWordPairs, liveRivals,
    onBatchLoaded: () => timer.resetTimer(),
  });

  useEffect(() => { batches.loadInitialBatch(); boosters.syncInventory(); }, []);
  useEffect(() => { if (wordPairs.length && currentIndex >= wordPairs.length - 4) batches.fetchNextBatch(); }, [currentIndex, wordPairs.length]);

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
    markEnigmasAsPlayed([pair._id]).catch(() => {});

    if (currentIndex + 4 >= wordPairs.length) batches.fetchNextBatch();

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
          updateUser({ kevyKeys: next });
          api.post('/game/sync-keys', { kevyKeys: next }, { timeout: 3000 }).catch(() => {});
          if (next >= 3) { setTimeout(() => { setShowKevyChest(true); playChest(); }, 300); }
          return next;
        });
      }

      const correctCount = sessionAnswersRef.current.filter((a) => a.isCorrect).length;
      const vipMultiplier = isVip ? 2 : 1;
      const baseKev = (isFeverMode || isFast) ? 1 : (correctCount % 2 === 0 ? 1 : 0);
      const kevsToAdd = baseKev * vipMultiplier;
      const xpToAdd = isFeverMode ? 3 : (isFast ? 2 : 1);
      const bonusMs = isFeverMode ? 12000 : (isFast ? 10000 : 8000);

      if (kevsToAdd > 0) {
        const nextKevs = (user?.kevs || userKevs || 0) + kevsToAdd;
        setUserKevs(nextKevs);
        updateKevs(nextKevs);
      }
      timer.setTimeWon(Math.floor(bonusMs / 1000));
      timer.addTimeMs(bonusMs);

      setCurrentXp((prev: number) => {
        let currentLvl = userLevelRef.current || userLevel;
        let nextXp = prev + xpToAdd;
        let needed = 3 + currentLvl * 2;
        let leveledUp = false;

        while (nextXp >= needed) {
          nextXp -= needed;
          currentLvl += 1;
          needed = 3 + currentLvl * 2;
          leveledUp = true;
        }

        if (leveledUp) {
          setUserLevel(currentLvl);
          setXpNeeded(needed);
          setShowLevelUpModal(true);
          playLevelUp();
          const lvlKevBonus = 5 * vipMultiplier;
          const nextKevs = (user?.kevs || userKevs || 0) + lvlKevBonus;
          setUserKevs(nextKevs);
          updateUser({ level: currentLvl, xp: nextXp, kevs: nextKevs });
          api.post('/game/sync-level', { level: currentLvl, xp: nextXp, kevs: nextKevs }, { timeout: 3000 }).catch(() => {});
        } else {
          updateUser({ xp: nextXp });
        }
        return nextXp;
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
    const addedKevs = gains.kevs > 0 ? gains.kevs : 0;
    const nextKevs = (user?.kevs || userKevs || 0) + addedKevs;
    if (addedKevs > 0) setUserKevs(nextKevs);
    updateUser({
      kevyKeys: 0,
      ...(addedKevs > 0 ? { kevs: nextKevs } : {}),
    });
    if (gains.freeze > 0) boosters.addBooster('freeze', gains.freeze);
    if (gains.hint > 0) boosters.addBooster('hint', gains.hint);
    if (gains.shield > 0) boosters.addBooster('shield', gains.shield);
    api.post('/game/chest-opened', { gains }, { timeout: 3000 }).catch(() => {});
    timer.resetTimer();
  };

  return {
    wordPairs, currentIndex, setCurrentIndex, timeLeft: timer.timeLeft, maxTime: timer.maxTime,
    selectedChoice, correctChoice, isCorrectState, isFastCombo, isFeverMode, isLoading: batches.isLoading,
    errorMessage: null, isChecking, eliminatedChoices: boosters.eliminatedChoices, isHintUsed: boosters.isHintUsed,
    handleUseHint: boosters.handleUseHint, handleUseTimeFreeze: boosters.handleUseTimeFreeze,
    handleUseSuperClue: boosters.handleUseSuperClue, handleUseSecondChance: boosters.handleUseSecondChance,
    isTimeFrozen: timer.isTimeFrozen, timeFreezeCount: boosters.timeFreezeCount,
    superClueCount: boosters.superClueCount, secondChanceCount: boosters.secondChanceCount,
    showNoKevsModal: boosters.showNoKevsModal, setShowNoKevsModal: boosters.setShowNoKevsModal,
    emergencyBoosterType: boosters.emergencyBoosterType,
    setEmergencyBoosterType: boosters.setEmergencyBoosterType,
    handleApplyEmergencyBooster: boosters.handleApplyEmergencyBooster,
    userLevel, currentXp, xpNeeded, userKevs, kevyKeys, showKevyChest, handleCloseKevyChest,
    activeRivalAlert: liveRivals.activeAlert, timeWon: timer.timeWon, setTimeWon: timer.setTimeWon,
    successTrigger, lastAccuracy, selectChoice, showLevelUpModal, setShowLevelUpModal,
    handleCloseLevelUp, errorLimitData, setErrorLimitData, triggerGameOver: timer.triggerGameOver,
  };
};