//src/hooks/useDuelArena.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../context/SocketContext';
import { useAudioContext } from '../context/AudioContext';
import { getDuelDetails, DuelSessionData, DuelEnigma } from '../services/duelApi';

export type BuzzerState = 'free' | 'my_turn' | 'opponent_turn' | 'expired';

export const useDuelArena = (duelId: string, currentUserId: string) => {
  const { emit, subscribe, isConnected } = useSocketContext();
  const { playBgm, stopBgm, playSuccess, playError, playGameOver } = useAudioContext();

  const [duel, setDuel] = useState<DuelSessionData | null>(null);
  const [currentEnigma, setCurrentEnigma] = useState<DuelEnigma | null>(null);
  const [scores, setScores] = useState<{ challenger: number; opponent: number }>({ challenger: 0, opponent: 0 });
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState<boolean>(true);

  const [buzzerState, setBuzzerState] = useState<BuzzerState>('free');
  const [activeBuzzerUserId, setActiveBuzzerUserId] = useState<string | null>(null);
  const [activeBuzzerUserName, setActiveBuzzerUserName] = useState<string | null>(null);
  const [buzzerSecondsLeft, setBuzzerSecondsLeft] = useState<number>(0);
  const [globalSecondsLeft, setGlobalSecondsLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  const globalTimerRef = useRef<any>(null);
  const buzzerTimerRef = useRef<any>(null);

  // 1. Initialisation et connexion à la room
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const data = await getDuelDetails(duelId);
        if (isMounted && data) {
          setDuel(data);
          setScores(data.scores || { challenger: 0, opponent: 0 });
          if (data.enigmas && data.enigmas[data.currentEnigmaIndex]) {
            setCurrentEnigma(data.enigmas[data.currentEnigmaIndex]);
          }
          if (data.status === 'in_progress' && data.startedAt) {
            setIsWaitingForOpponent(false);
            playBgm();
          }
          emit('duel_join', { duelId, userId: currentUserId });
        }
      } catch (e) {
        console.error('[DUEL_ARENA] Erreur chargement duel:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSession();
    return () => {
      isMounted = false;
      stopBgm();
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
    };
  }, [duelId, currentUserId, emit, isConnected, playBgm, stopBgm]);

  // 2. Synchronisation du chronomètre global
  useEffect(() => {
    if (isLoading || isGameOver || isWaitingForOpponent || !duel?.startedAt) return;

    const tick = () => {
      if (!duel?.startedAt) return;
      const startTime = new Date(duel.startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const duration = duel.duration || 60;
      const remaining = Math.max(0, duration - elapsed);
      setGlobalSecondsLeft(remaining);

      if (remaining <= 0) {
        if (globalTimerRef.current) clearInterval(globalTimerRef.current);
        emit('duel_finish', { duelId });
      }
    };

    tick();
    globalTimerRef.current = setInterval(tick, 1000);

    return () => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    };
  }, [isLoading, isGameOver, isWaitingForOpponent, duel?.startedAt, duel?.duration, duelId, emit]);

  // 3. Écouteurs Socket temps réel
  useEffect(() => {
    const unsubWaiting = subscribe('duel_waiting_opponent', () => {
      setIsWaitingForOpponent(true);
    });

    const unsubStart = subscribe('duel_start', (data: any) => {
      setIsWaitingForOpponent(false);
      playBgm();
      if (data?.duel) {
        setDuel(data.duel);
        setScores(data.duel.scores || { challenger: 0, opponent: 0 });
        if (data.duel.enigmas && data.duel.enigmas[data.duel.currentEnigmaIndex]) {
          setCurrentEnigma(data.duel.enigmas[data.duel.currentEnigmaIndex]);
        }
      }
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    });

    const unsubBuzz = subscribe('duel_buzzer_locked', (data: any) => {
      const isMine = String(data.userId) === String(currentUserId);
      setActiveBuzzerUserId(String(data.userId));
      setActiveBuzzerUserName(data.userName || (isMine ? 'Vous' : 'Adversaire'));
      setBuzzerState(isMine ? 'my_turn' : 'opponent_turn');
      setBuzzerSecondsLeft(3);

      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}

      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      buzzerTimerRef.current = setInterval(() => {
        setBuzzerSecondsLeft((prev) => {
          if (prev <= 1) {
            if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    const unsubExpired = subscribe('duel_buzzer_expired', () => {
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setActiveBuzzerUserId(null);
      setActiveBuzzerUserName(null);
      setBuzzerState('free');
      setBuzzerSecondsLeft(0);
    });

    const unsubAnswer = subscribe('duel_answer_result', (data: any) => {
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setActiveBuzzerUserId(null);
      setActiveBuzzerUserName(null);
      setBuzzerState('free');
      setBuzzerSecondsLeft(0);

      if (data.scores) setScores(data.scores);

      if (data.isCorrect) {
        setLastAnswerStatus('correct');
        playSuccess();
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        if (data.nextEnigma) setCurrentEnigma(data.nextEnigma);
      } else {
        setLastAnswerStatus('wrong');
        playError();
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }

      setTimeout(() => setLastAnswerStatus(null), 1200);
    });

    const unsubGameOver = subscribe('duel_game_over', (data: any) => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      if (data?.duel) setDuel(data.duel);
      setIsGameOver(true);
      stopBgm();
      playGameOver(true);
    });

    const unsubSkipped = subscribe('duel_enigma_skipped', (data: any) => {
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setActiveBuzzerUserId(null);
      setActiveBuzzerUserName(null);
      setBuzzerState('free');
      setBuzzerSecondsLeft(0);
      if (data?.nextEnigma) setCurrentEnigma(data.nextEnigma);
    });

    return () => {
      unsubWaiting();
      unsubStart();
      unsubBuzz();
      unsubExpired();
      unsubAnswer();
      unsubGameOver();
      unsubSkipped();
    };
  }, [subscribe, currentUserId, playSuccess, playError, playGameOver, playBgm, stopBgm]);

  const pressBuzzer = useCallback(() => {
    if (buzzerState !== 'free' || isGameOver || isWaitingForOpponent) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    emit('duel_buzz', { duelId, userId: currentUserId });
  }, [buzzerState, isGameOver, isWaitingForOpponent, emit, duelId, currentUserId]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (buzzerState !== 'my_turn' || String(activeBuzzerUserId) !== String(currentUserId)) return;
      emit('duel_submit_answer', { duelId, userId: currentUserId, answer });
    },
    [emit, buzzerState, activeBuzzerUserId, currentUserId, duelId]
  );

  return {
    duel,
    currentEnigma,
    scores,
    globalSecondsLeft,
    buzzerSecondsLeft,
    buzzerState,
    activeBuzzerUserName,
    isWaitingForOpponent,
    isMyBuzzer: buzzerState === 'my_turn',
    isOpponentBuzzer: buzzerState === 'opponent_turn',
    isGameOver,
    isLoading,
    lastAnswerStatus,
    pressBuzzer,
    submitAnswer,
  };
};
