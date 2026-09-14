// src/hooks/useHappyHour.ts
// HOOK DE GESTION DE L'HEURE MAGIQUE (HAPPY HOUR DOUBLE GAINS)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useSocket } from './useSocket';

interface HappyHourState {
  isActive: boolean;
  multiplier: number;
  endsAt: string | null;
}

export const useHappyHour = () => {
  const [state, setState] = useState<HappyHourState>({
    isActive: false,
    multiplier: 1,
    endsAt: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { subscribe } = useSocket();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/game/happy-hour');
      if (res.data?.status === 'success' && res.data?.data) {
        setState({
          isActive: Boolean(res.data.data.isActive),
          multiplier: res.data.data.multiplier || 1,
          endsAt: res.data.data.endsAt || null,
        });
      }
    } catch {
      // Échec silencieux en mode dégradé
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const unsubStart = subscribe('happy_hour_started', (data: any) => {
      setState({
        isActive: true,
        multiplier: data?.multiplier || 2,
        endsAt: data?.endsAt || null,
      });
    });

    const unsubEnd = subscribe('happy_hour_ended', () => {
      setState({
        isActive: false,
        multiplier: 1,
        endsAt: null,
      });
    });

    return () => {
      unsubStart();
      unsubEnd();
    };
  }, [fetchStatus, subscribe]);

  return {
    isHappyHour: state.isActive,
    multiplier: state.multiplier,
    endsAt: state.endsAt,
    loading,
    refreshHappyHour: fetchStatus,
  };
};
