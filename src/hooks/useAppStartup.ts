//src/hooks/useAppStartup.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import api from '../services/api';
import { syncPendingSessions } from '../services/syncService';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const useAppStartup = () => {
  const { user } = useAuth();
  const { refreshAll } = useData();

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isPinging = useRef(false);
  const hasWokenUp = useRef(false);

  const pingServer = async () => {
    if (!user) return;
    if (isPinging.current) return;
    isPinging.current = true;

    try {
      await api.get('/auth/me', { timeout: 6000 });
      hasWokenUp.current = true;
      syncPendingSessions().catch(() => {});
      refreshAll().catch(() => {});
    } catch {
      if (!hasWokenUp.current && user) {
        setTimeout(() => {
          isPinging.current = false;
          if (user) pingServer();
        }, 7000);
        return;
      }
    } finally {
      isPinging.current = false;
    }
  };

  useEffect(() => {
    if (user) {
      pingServer();
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' && user) {
        pingServer();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user]);
};