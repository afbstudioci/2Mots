// src/hooks/useDuelSocketEvents.ts
// GESTIONNAIRE D'ECOUTEURS TEMPS REEL POUR L'ARENE DE DUEL
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';

interface UseDuelSocketEventsParams {
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  currentUserId: string;
  hasGameStartedRef: React.MutableRefObject<boolean>;
  lobbyTimerRef: React.MutableRefObject<any>;
  globalTimerRef: React.MutableRefObject<any>;
  buzzerTimerRef: React.MutableRefObject<any>;
  gameStartTimestampRef: React.MutableRefObject<number | null>;
  disconnectStartTimestampRef: React.MutableRefObject<number | null>;
  setIsWaitingForOpponent: (v: boolean) => void;
  setLobbySecondsLeft: (v: number | ((prev: number) => number)) => void;
  setGlobalSecondsLeft: (v: number) => void;
  setDuel: (v: any) => void;
  setScores: (v: any) => void;
  setCurrentEnigma: (v: any) => void;
  setActiveBuzzerUserId: (v: string | null) => void;
  setActiveBuzzerUserName: (v: string | null) => void;
  setBuzzerState: (v: any) => void;
  setBuzzerSecondsLeft: (v: number | ((prev: number) => number)) => void;
  setLastAnswerStatus: (v: 'correct' | 'wrong' | null) => void;
  setIsGameOver: (v: boolean) => void;
  setIsOpponentDisconnected: (v: boolean) => void;
  setDisconnectSecondsLeft: (v: number) => void;
  setForfeitInfo: (v: any) => void;
  setLobbyTimeoutInfo: (v: any) => void;
  audio: {
    playBgm: () => void;
    stopBgm: () => void;
    playSuccess: () => void;
    playError: () => void;
    playGameOver: (win?: boolean) => void;
    playBuzzer: () => void;
  };
}

export const useDuelSocketEvents = (params: UseDuelSocketEventsParams) => {
  const {
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
    audio,
  } = params;

  useEffect(() => {
    const unsubWaiting = subscribe('duel_waiting_opponent', (data: any) => {
      if (hasGameStartedRef.current) return;
      setIsWaitingForOpponent(true);
      const expiresAt = data?.expiresAt || (Date.now() + (data?.waitSeconds || 60) * 1000);
      const initialRemaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setLobbySecondsLeft(initialRemaining);

      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
      lobbyTimerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        setLobbySecondsLeft(remaining);
        if (remaining <= 0) {
          if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
        }
      }, 1000);
    });

    const unsubStart = subscribe('duel_start', (data: any) => {
      hasGameStartedRef.current = true;
      if (lobbyTimerRef.current) {
        clearInterval(lobbyTimerRef.current);
        lobbyTimerRef.current = null;
      }
      setIsWaitingForOpponent(false);
      gameStartTimestampRef.current = Date.now();
      setGlobalSecondsLeft(data?.duration || 60);
      audio.playBgm();

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

      audio.playBuzzer();
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
        audio.playSuccess();
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        if (data.nextEnigma) setCurrentEnigma(data.nextEnigma);
      } else {
        setLastAnswerStatus('wrong');
        audio.playError();
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }

      setTimeout(() => setLastAnswerStatus(null), 1200);
    });

    const unsubGameOver = subscribe('duel_game_over', (data: any) => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setGlobalSecondsLeft(0);
      if (data?.duel) setDuel(data.duel);
      setIsGameOver(true);
      audio.stopBgm();
      audio.playGameOver(true);
    });

    const unsubSkipped = subscribe('duel_enigma_skipped', (data: any) => {
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      setActiveBuzzerUserId(null);
      setActiveBuzzerUserName(null);
      setBuzzerState('free');
      setBuzzerSecondsLeft(0);
      if (data?.nextEnigma) setCurrentEnigma(data.nextEnigma);
    });

    const unsubPlayerDisc = subscribe('duel_player_disconnected', (data: any) => {
      if (String(data?.userId) !== String(currentUserId)) {
        disconnectStartTimestampRef.current = Date.now();
        setIsOpponentDisconnected(true);
        setDisconnectSecondsLeft(data?.graceSeconds || 15);
        audio.stopBgm();
      }
    });

    const unsubPlayerRec = subscribe('duel_player_reconnected', (data: any) => {
      if (String(data?.userId) !== String(currentUserId)) {
        if (disconnectStartTimestampRef.current && gameStartTimestampRef.current) {
          const pausedDuration = Date.now() - disconnectStartTimestampRef.current;
          gameStartTimestampRef.current += pausedDuration;
        }
        disconnectStartTimestampRef.current = null;
        setIsOpponentDisconnected(false);
        audio.playBgm();
      }
    });

    const unsubForfeit = subscribe('duel_forfeited', (data: any) => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (buzzerTimerRef.current) clearInterval(buzzerTimerRef.current);
      audio.stopBgm();
      setIsOpponentDisconnected(false);
      const isMe = String(data?.forfeiterId) === String(currentUserId);
      const reason = data?.reason;
      setForfeitInfo({
        visible: true,
        isWinner: !isMe,
        penaltyKevs: data?.penaltyKevs || 1,
        message: isMe
          ? `Vous avez quitte la partie. Penalite de ${data?.penaltyKevs || 1} Kevs deduite.`
          : reason === 'disconnection_timeout'
          ? `Votre adversaire a perdu sa connexion reseau. Vous remportez ${data?.penaltyKevs || 1} Kevs de dedommagement !`
          : `Votre adversaire a quitte la partie. Vous remportez ${data?.penaltyKevs || 1} Kevs de compensation !`,
      });
      if (!isMe) {
        audio.playSuccess();
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      }
    });

    const unsubLobbyTimeout = subscribe('duel_lobby_timeout', (data: any) => {
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
      setIsWaitingForOpponent(false);
      setLobbyTimeoutInfo({
        visible: true,
        message: data?.message || "L'adversaire n'a pas rejoint la salle a temps (60s). Le duel a ete annule et vos Kevs sont intacts.",
      });
    });

    const unsubLobbyCancelled = subscribe('duel_lobby_cancelled', (data: any) => {
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
      setIsWaitingForOpponent(false);
      setLobbyTimeoutInfo({
        visible: true,
        message: data?.message || "Le duel a ete annule. Vos Kevs vous ont ete restitues.",
      });
    });

    return () => {
      unsubWaiting();
      unsubStart();
      unsubBuzz();
      unsubExpired();
      unsubAnswer();
      unsubGameOver();
      unsubSkipped();
      unsubPlayerDisc();
      unsubPlayerRec();
      unsubForfeit();
      unsubLobbyTimeout();
      unsubLobbyCancelled();
    };
  }, [
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
    audio,
  ]);
};
