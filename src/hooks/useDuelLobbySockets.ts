//src/hooks/useDuelLobbySockets.ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../context/SocketContext';

interface UseDuelLobbySocketsProps {
  onRefreshData: (force: boolean) => void;
  onAcceptedDuel: (duelData: { visible: boolean; opponentName: string; duelId: string }) => void;
  onActiveDuelCleared: () => void;
}

export function useDuelLobbySockets({
  onRefreshData,
  onAcceptedDuel,
  onActiveDuelCleared,
}: UseDuelLobbySocketsProps) {
  const { subscribe } = useSocketContext();
  const onRefreshRef = useRef(onRefreshData);
  onRefreshRef.current = onRefreshData;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        onRefreshRef.current(false);
      }
    });

    const unsubInviteReceived = subscribe('duel_invite_received', () => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      onRefreshRef.current(true);
    });

    const unsubInviteResponse = subscribe('duel_invite_response', (data: any) => {
      onRefreshRef.current(true);
      if (data?.accept && data?.duelId) {
        onAcceptedDuel({
          visible: true,
          opponentName: data.opponentName || 'Votre adversaire',
          duelId: data.duelId,
        });
      }
    });

    const unsubCancelled = subscribe('duel_invite_cancelled', () => {
      onActiveDuelCleared();
      onRefreshRef.current(true);
    });

    const unsubForfeited = subscribe('duel_forfeited', () => {
      onActiveDuelCleared();
      onRefreshRef.current(true);
    });

    const unsubSessionEnded = subscribe('duel_session_ended', () => {
      onActiveDuelCleared();
      onRefreshRef.current(true);
    });

    const unsubDuelCancelled = subscribe('duel_cancelled', () => {
      onActiveDuelCleared();
      onRefreshRef.current(true);
    });

    const unsubNotif = subscribe('notification_received', (data: any) => {
      if (data?.type && data.type.startsWith('duel_')) {
        onRefreshRef.current(true);
      }
    });

    return () => {
      subscription.remove();
      unsubInviteReceived();
      unsubInviteResponse();
      unsubCancelled();
      unsubForfeited();
      unsubSessionEnded();
      unsubDuelCancelled();
      unsubNotif();
    };
  }, [subscribe, onAcceptedDuel, onActiveDuelCleared]);
}
