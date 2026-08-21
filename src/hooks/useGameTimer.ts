//src/hooks/useGameTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { EnrichedWordPair, GameAnswer } from '../types/gameTypes';

interface UseGameTimerProps {
  isLoading: boolean;
  isTimeFrozen: boolean;
  showLevelUpModal: boolean;
  errorLimitData: any;
  currentPairRef: React.MutableRefObject<EnrichedWordPair | null>;
  sessionAnswersRef: React.MutableRefObject<GameAnswer[]>;
  playedPairsHistoryRef: React.MutableRefObject<Map<string, any>>;
  stopBgm: () => void;
  playDanger: () => void;
}

export const useGameTimer = ({
  isLoading,
  isTimeFrozen,
  showLevelUpModal,
  errorLimitData,
  currentPairRef,
  sessionAnswersRef,
  playedPairsHistoryRef,
  stopBgm,
  playDanger,
}: UseGameTimerProps) => {
  const navigation = useNavigation<any>();
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timeWon, setTimeWon] = useState<number>(0);

  const timeLeftMsRef = useRef<number>(30000);
  const lastTickTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);
  const hasTriggeredGameOver = useRef<boolean>(false);
  const backgroundTimeRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

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
        const p = playedPairsHistoryRef.current.get(item.wordPairId);
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
        stats: { accuracy, correctCount, errorCount: wrongAnswers.length },
        enigmasSummary,
      });
    },
    [navigation, stopBgm, currentPairRef, playedPairsHistoryRef, sessionAnswersRef]
  );

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

      if (remainingSec === 6 && timeLeftMsRef.current > 5800) playDanger();
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
      if (next.match(/inactive|background/)) backgroundTimeRef.current = Date.now();
      appState.current = next;
    });
    return () => sub.remove();
  }, [triggerGameOver, showLevelUpModal, errorLimitData?.visible, isTimeFrozen]);

  const addTimeMs = (extraMs: number) => {
    timeLeftMsRef.current = Math.min(30000, timeLeftMsRef.current + extraMs);
    setTimeLeft(Math.ceil(timeLeftMsRef.current / 1000));
  };

  const resetTimer = (newSeconds = 30) => {
    timeLeftMsRef.current = newSeconds * 1000;
    setTimeLeft(newSeconds);
    lastTickTimeRef.current = Date.now();
    hasTriggeredGameOver.current = false;
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  return {
    timeLeft,
    setTimeLeft,
    timeWon,
    setTimeWon,
    addTimeMs,
    resetTimer,
    stopTimer,
    triggerGameOver,
    hasTriggeredGameOver: hasTriggeredGameOver.current,
  };
};
