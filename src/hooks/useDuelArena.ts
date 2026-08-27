//src/hooks/useDuelArena.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../context/SocketContext';
import { getDuelDetails, DuelSessionData, DuelEnigma } from '../services/duelApi';

export const useDuelArena = (duelId: string, currentUserId: string) => {
  const { socket, subscribe } = useSocketContext();

  const [duel, setDuel] = useState<DuelSessionData | null>(null);
  const [currentEnigma, setCurrentEnigma] = useState<DuelEnigma | null>(null);
  const [scores, setScores] = useState<{ challenger: number; opponent: number }>({ challenger: 0, opponent: 0 });
  const [activeBuzzerUserId, setActiveBuzzerUserId] = useState<string | null>(null);
  const [buzzerSecondsLeft, setBuzzerSecondsLeft] = useState<number>(0);
  const [globalSecondsLeft, setGlobalSecondsLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  const globalTimerRef = useRef<any>(null);
  const buzzerTimerRef = useRef<any>(null);

  // 1. Initialisation de la session et connexion à la room
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
          if (socket) {
            socket.emit('duel_join', { duelId, userId: currentUserId });
          }
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
    };
  }, [duelId, currentUserId, socket]);

  // 2. Gestion du chronomètre global de 60 secondes
  useEffect(() => {
    if (isLoading || isGameOver) return;

    globalTimerRef.current = setInterval(() => {
      setGlobalSecondsLeft((prev) => {
        if (prev <= 1) {
          if (globalTimerRef.current) clearInterval(globalTimerRef.current);
          if (socket) {
            socket.emit('duel_finish', { duelId });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    };
  }, [isLoading, isGameOver, duelId, socket]);

  // 3. Écouteurs d'événements Socket temps réel
  useEffect(() => {
    const unsubReady = subscribe('duel_player_ready', (data: any) => {
      if (data?.duel) {
        setDuel(data.duel);
        setScores(data.duel.scores);
        if (data.duel.enigmas && data.duel.enigmas[data.duel.currentEnigmaIndex]) {
          setCurrentEnigma(data.duel.enigmas[data.duel.currentEnigmaIndex]);
        }
      }
    });

    const unsubBuzz = subscribe('duel_buzzer_locked', (data: any) => {
      setActiveBuzzerUserId(data.userId);
      setBuzzerSecondsLeft(3);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}

      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      buzzerTimerRef.current = setInterval(() => {
        setBuzzerSecondsLeft((prev) => {
          if (prev <= 1) {
            if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
            setActiveBuzzerUserId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    const unsubAnswer = subscribe('duel_answer_result', (data: any) => {
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setActiveBuzzerUserId(null);
      setBuzzerSecondsLeft(0);

      if (data.scores) setScores(data.scores);

      if (data.isCorrect) {
        setLastAnswerStatus('correct');
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        if (data.nextEnigma) {
          setCurrentEnigma(data.nextEnigma);
        }
      } else {
        setLastAnswerStatus('wrong');
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }

      setTimeout(() => setLastAnswerStatus(null), 1200);
    });

    const unsubGameOver = subscribe('duel_game_over', (data: any) => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      if (data?.duel) setDuel(data.duel);
      setIsGameOver(true);
    });

    const unsubSkipped = subscribe('duel_enigma_skipped', (data: any) => {
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setActiveBuzzerUserId(null);
      setBuzzerSecondsLeft(0);
      if (data?.nextEnigma) {
        setCurrentEnigma(data.nextEnigma);
      }
    });

    return () => {
      unsubReady();
      unsubBuzz();
      unsubAnswer();
      unsubGameOver();
      unsubSkipped();
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
    };
  }, [subscribe]);

  // 4. Timer d'inactivité par énigme (12s sans buzzer -> passage à l'énigme suivante)
  useEffect(() => {
    if (isLoading || isGameOver || activeBuzzerUserId) return;

    const inactivityTimeout = setTimeout(() => {
      if (!activeBuzzerUserId && !isGameOver && socket) {
        socket.emit('duel_skip_enigma', { duelId });
      }
    }, 12000);

    return () => {
      clearTimeout(inactivityTimeout);
    };
  }, [currentEnigma, activeBuzzerUserId, isLoading, isGameOver, socket, duelId]);

  // 4. Actions joueur
  const pressBuzzer = useCallback(() => {
    if (activeBuzzerUserId || isGameOver || !socket) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    socket.emit('duel_buzz', { duelId, userId: currentUserId });
  }, [activeBuzzerUserId, isGameOver, socket, duelId, currentUserId]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!socket || String(activeBuzzerUserId) !== String(currentUserId)) return;
      socket.emit('duel_submit_answer', { duelId, userId: currentUserId, answer });
    },
    [socket, activeBuzzerUserId, currentUserId, duelId]
  );

  const isMyBuzzer = activeBuzzerUserId ? String(activeBuzzerUserId) === String(currentUserId) : false;
  const isOpponentBuzzer = activeBuzzerUserId ? String(activeBuzzerUserId) !== String(currentUserId) : false;

  return {
    duel,
    currentEnigma,
    scores,
    globalSecondsLeft,
    buzzerSecondsLeft,
    isMyBuzzer,
    isOpponentBuzzer,
    isGameOver,
    isLoading,
    lastAnswerStatus,
    pressBuzzer,
    submitAnswer,
  };
};
