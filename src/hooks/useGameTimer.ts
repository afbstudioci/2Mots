// src/hooks/useGameTimer.ts
// GESTION DU CHRONOMETRE DE JEU ET FINALISATION SECURISEE DE SESSION
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis, Typographie Soignée)

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { queueOfflineSession } from '../services/syncService';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';

export const getLevelMaxTime = (level: number = 1): number => {
  if (level <= 10) return 30;
  if (level <= 30) return 25;
  if (level <= 60) return 20;
  if (level <= 100) return 15;
  return Math.max(8, 10 - Math.floor((level - 101) / 50));
};

interface UseGameTimerProps {
  isLoading: boolean;
  showLevelUpModal: boolean;
  showKevyChest?: boolean;
  errorLimitData: any;
  emergencyBoosterVisible?: boolean;
  isPaused?: boolean;
  userLevel?: number;
  userLevelRef?: React.MutableRefObject<number>;
  currentXpRef?: React.MutableRefObject<number>;
  userKevsRef?: React.MutableRefObject<number>;
  currentPairRef: React.MutableRefObject<EnrichedWordPair | null>;
  sessionAnswersRef: React.MutableRefObject<GameAnswer[]>;
  playedPairsHistoryRef: React.MutableRefObject<Map<string, any>>;
  kevyKeysRef?: React.MutableRefObject<number>;
  stopBgm: () => void;
  playDanger: () => void;
}

export const useGameTimer = ({
  isLoading,
  showLevelUpModal,
  showKevyChest = false,
  errorLimitData,
  emergencyBoosterVisible = false,
  isPaused = false,
  userLevel = 1,
  userLevelRef,
  currentXpRef,
  userKevsRef,
  currentPairRef,
  sessionAnswersRef,
  playedPairsHistoryRef,
  kevyKeysRef,
  stopBgm,
  playDanger,
}: UseGameTimerProps) => {
  const navigation = useNavigation<any>();
  const initialMax = getLevelMaxTime(userLevel);
  const [maxTime, setMaxTime] = useState<number>(initialMax);
  const [timeLeft, setTimeLeft] = useState<number>(initialMax);
  const [timeWon, setTimeWon] = useState<number>(0);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);

  const timeLeftMsRef = useRef<number>(initialMax * 1000);
  const maxTimeRef = useRef<number>(initialMax);
  maxTimeRef.current = initialMax;
  const lastTickTimeRef = useRef<number>(Date.now());
  const frozenUntilRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);
  const hasTriggeredGameOver = useRef<boolean>(false);
  const backgroundTimeRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const isTimerPaused = Boolean(
    isLoading ||
    showLevelUpModal ||
    showKevyChest ||
    errorLimitData?.visible ||
    emergencyBoosterVisible ||
    isPaused
  );
  const isTimerPausedRef = useRef<boolean>(isTimerPaused);
  isTimerPausedRef.current = isTimerPaused;

  const triggerGameOver = useCallback(
    (reason?: string) => {
      if (hasTriggeredGameOver.current) return;
      hasTriggeredGameOver.current = true;
      stopBgm();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}

      const pair = currentPairRef.current;
      if (pair) {
        playedPairsHistoryRef.current.set(pair._id, pair);
        if (!sessionAnswersRef.current.some((a) => a.wordPairId === pair._id)) {
          sessionAnswersRef.current.push({
            wordPairId: pair._id,
            answer: reason || 'Temps ecoule',
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
        const p = playedPairsHistoryRef.current.get(item.wordPairId);
        return {
          word1: p?.word1 || '',
          word2: p?.word2 || '',
          userAnswer: item.answer || 'Temps ecoule',
          expectedAnswer: p?.exactMatch?.[0] || p?.options?.[0] || 'Inconnu',
          isCorrect: Boolean(item.isCorrect),
        };
      });

      const sessionPayload = {
        score: correctCount,
        answers,
        kevyKeys: kevyKeysRef?.current || 0,
        level: userLevelRef?.current || userLevel,
        xp: currentXpRef?.current || 0,
        kevs: userKevsRef?.current || 0,
      };

      api.post('/game/end', sessionPayload, { timeout: 4500 })
        .catch(() => {
          queueOfflineSession({
            score: correctCount,
            durationMs: 30000,
            rounds: answers.map((a) => {
              const p = playedPairsHistoryRef.current.get(a.wordPairId);
              return {
                wordPairId: a.wordPairId,
                word1: p?.word1 || '',
                word2: p?.word2 || '',
                answer: a.answer,
                isCorrect: a.isCorrect,
                timeSpentMs: (a.timeSpent || 5) * 1000,
              };
            }),
          }).catch(() => {});
        });

      navigation.replace('GameOver', {
        score: correctCount,
        reason,
        stats: { accuracy, correctCount, errorCount: wrongAnswers.length },
        enigmasSummary,
      });
    },
    [navigation, stopBgm, currentPairRef, playedPairsHistoryRef, sessionAnswersRef, kevyKeysRef, userLevel, userLevelRef, currentXpRef, userKevsRef]
  );

  useEffect(() => {
    if (isLoading || hasTriggeredGameOver.current) return;
    lastTickTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      if (hasTriggeredGameOver.current || isTimerPausedRef.current) {
        lastTickTimeRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const isFrozen = now < frozenUntilRef.current;
      if (isFrozen) {
        setIsTimeFrozen(true);
        lastTickTimeRef.current = now;
        return;
      }

      setIsTimeFrozen(false);
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      timeLeftMsRef.current = Math.max(0, timeLeftMsRef.current - delta);
      const remainingSec = Math.ceil(timeLeftMsRef.current / 1000);
      setTimeLeft(remainingSec);

      if (remainingSec === 6 && timeLeftMsRef.current > 5800) playDanger();
      if (timeLeftMsRef.current <= 0) {
        clearInterval(timerIntervalRef.current);
        triggerGameOver('Temps ecoule');
      }
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isLoading, playDanger, triggerGameOver, isTimerPaused]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const bgTime = backgroundTimeRef.current;
        backgroundTimeRef.current = null;
        lastTickTimeRef.current = Date.now();

        // Ne soustrait pas le temps ecoule si le jeu etait en pause (pub, modale joker, niveau franchi)
        if (bgTime && !isTimerPausedRef.current && Date.now() >= frozenUntilRef.current) {
          const elapsed = Date.now() - bgTime;
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
  }, [triggerGameOver]);

  const addTimeMs = (extraMs: number) => {
    if (extraMs < 0 && Date.now() < frozenUntilRef.current) {
      return;
    }
    timeLeftMsRef.current = Math.min(maxTimeRef.current * 1000, Math.max(0, timeLeftMsRef.current + extraMs));
    setTimeLeft(Math.ceil(timeLeftMsRef.current / 1000));
  };

  const resetTimer = (newSeconds?: number) => {
    const sec = newSeconds || maxTimeRef.current;
    frozenUntilRef.current = 0;
    setIsTimeFrozen(false);
    setMaxTime(sec);
    maxTimeRef.current = sec;
    timeLeftMsRef.current = sec * 1000;
    setTimeLeft(sec);
    lastTickTimeRef.current = Date.now();
    hasTriggeredGameOver.current = false;
  };

  const freezeTimer = (seconds: number = 5) => {
    const target = Date.now() + seconds * 1000;
    frozenUntilRef.current = Math.max(frozenUntilRef.current, target);
    setIsTimeFrozen(true);
    lastTickTimeRef.current = Date.now();
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  return {
    timeLeft,
    setTimeLeft,
    maxTime,
    setMaxTime,
    timeWon,
    setTimeWon,
    isTimeFrozen,
    freezeTimer,
    addTimeMs,
    resetTimer,
    stopTimer,
    triggerGameOver,
    hasTriggeredGameOver: hasTriggeredGameOver.current,
  };
};
