// src/hooks/useDuelArena.ts
// HOOK PRINCIPAL DE L'ARENE DE DUEL 1V1 - 2MOTS
// Standard : Clean Architecture / Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../context/SocketContext';
import { useAudioContext } from '../context/AudioContext';
import api from '../services/api';
import { getDuelDetails, DuelSessionData, DuelEnigma } from '../services/duelApi';
import { useDuelSocketEvents } from './useDuelSocketEvents';

export type BuzzerState = 'free' | 'my_turn' | 'opponent_turn' | 'expired';

export const useDuelArena = (duelId: string, currentUserId: string) => {
  const { emit, subscribe, isConnected } = useSocketContext();
  const { playBgm, stopBgm, playSuccess, playError, playGameOver, playBuzzer } = useAudioContext();

  const [duel, setDuel] = useState<DuelSessionData | null>(null);
  const [currentEnigma, setCurrentEnigma] = useState<DuelEnigma | null>(null);
  const [scores, setScores] = useState<{ challenger: number; opponent: number }>({ challenger: 0, opponent: 0 });
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState<boolean>(true);
  const [lobbySecondsLeft, setLobbySecondsLeft] = useState<number>(60);
  const [lobbyTimeoutInfo, setLobbyTimeoutInfo] = useState<{ visible: boolean; message: string } | null>(null);

  const [buzzerState, setBuzzerState] = useState<BuzzerState>('free');
  const [activeBuzzerUserId, setActiveBuzzerUserId] = useState<string | null>(null);
  const [activeBuzzerUserName, setActiveBuzzerUserName] = useState<string | null>(null);
  const [buzzerSecondsLeft, setBuzzerSecondsLeft] = useState<number>(0);
  const [globalSecondsLeft, setGlobalSecondsLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  const [isOpponentDisconnected, setIsOpponentDisconnected] = useState<boolean>(false);
  const [disconnectSecondsLeft, setDisconnectSecondsLeft] = useState<number>(15);
  const [forfeitInfo, setForfeitInfo] = useState<{
    visible: boolean;
    isWinner: boolean;
    penaltyKevs: number;
    message: string;
  } | null>(null);

  const globalTimerRef = useRef<any>(null);
  const buzzerTimerRef = useRef<any>(null);
  const lobbyTimerRef = useRef<any>(null);
  const gameStartTimestampRef = useRef<number | null>(null);
  const disconnectStartTimestampRef = useRef<number | null>(null);
  const hasGameStartedRef = useRef<boolean>(false);

  // 1. Initialisation et chargement de la session
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

          if (data.status === 'in_progress' || hasGameStartedRef.current) {
            hasGameStartedRef.current = true;
            setIsWaitingForOpponent(false);
            if (data.startedAt) {
              const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
              gameStartTimestampRef.current = new Date(data.startedAt).getTime();
              setGlobalSecondsLeft(Math.max(0, (data.duration || 60) - elapsed));
            }
            playBgm();
          } else {
            if (!hasGameStartedRef.current) {
              setIsWaitingForOpponent(true);
            }
          }
        }
      } catch (err) {
        console.warn('[DUEL_ARENA] Erreur chargement session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSession();

    if (isConnected) {
      emit('duel_join', { duelId, userId: currentUserId });
    }

    return () => {
      isMounted = false;
      stopBgm();
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
    };
  }, [duelId, currentUserId, emit, isConnected, playBgm, stopBgm]);

  // 2. Ecouteurs Socket temps reel
  useDuelSocketEvents({
    subscribe,
    currentUserId,
    hasGameStartedRef,
    lobbyTimerRef,
    globalTimerRef,
    buzzerTimerRef,
    gameStartTimestampRef,
    disconnectStartTimestampRef,
    setIsWaitingForOpponent,
    setLobbySecondsLeft,
    setGlobalSecondsLeft,
    setDuel,
    setScores,
    setCurrentEnigma,
    setActiveBuzzerUserId,
    setActiveBuzzerUserName,
    setBuzzerState,
    setBuzzerSecondsLeft,
    setLastAnswerStatus,
    setIsGameOver,
    setIsOpponentDisconnected,
    setDisconnectSecondsLeft,
    setForfeitInfo,
    setLobbyTimeoutInfo,
    audio: { playBgm, stopBgm, playSuccess, playError, playGameOver, playBuzzer },
  });

  // 3. Synchronisation du chronometre global de la partie
  useEffect(() => {
    if (isLoading || isGameOver || isWaitingForOpponent || isOpponentDisconnected || !gameStartTimestampRef.current) return;

    const tick = () => {
      if (!gameStartTimestampRef.current) return;
      const now = Date.now();
      const elapsed = Math.floor((now - gameStartTimestampRef.current) / 1000);
      const duration = duel?.duration || 60;
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
  }, [isLoading, isGameOver, isWaitingForOpponent, isOpponentDisconnected, duel?.duration, duelId, emit]);

  // 4. Decompte visuel de deconnexion adverse (15s)
  useEffect(() => {
    if (!isOpponentDisconnected) return;
    const interval = setInterval(() => {
      setDisconnectSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpponentDisconnected]);

  const cancelLobbyWait = useCallback(async () => {
    try {
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
      emit('duel_cancel_lobby', { duelId, userId: currentUserId });
      await api.post('/duel/cancel-inactive', { duelId }).catch(() => {});
    } catch (e) {
      console.warn('[DUEL_ARENA] Erreur annulation lobby:', e);
    }
  }, [duelId, currentUserId, emit]);

  const forfeitGame = useCallback(async () => {
    try {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      stopBgm();
      emit('duel_forfeit', { duelId, userId: currentUserId });
      await api.post('/duel/forfeit', { duelId }).catch(() => {});
    } catch (e) {
      console.warn('[DUEL_ARENA] Erreur abandon duel:', e);
    }
  }, [duelId, currentUserId, emit, stopBgm]);

  const pressBuzzer = useCallback(() => {
    if (buzzerState !== 'free' || isGameOver || isWaitingForOpponent || isOpponentDisconnected) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    emit('duel_buzz', { duelId, userId: currentUserId });
  }, [buzzerState, isGameOver, isWaitingForOpponent, isOpponentDisconnected, emit, duelId, currentUserId]);

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
    lobbySecondsLeft,
    lobbyTimeoutInfo,
    cancelLobbyWait,
    isMyBuzzer: buzzerState === 'my_turn',
    isOpponentBuzzer: buzzerState === 'opponent_turn',
    isGameOver,
    isLoading,
    lastAnswerStatus,
    isOpponentDisconnected,
    disconnectSecondsLeft,
    forfeitInfo,
    forfeitGame,
    pressBuzzer,
    submitAnswer,
  };
};
