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
    if (isPinging.current) return;
    isPinging.current = true;

    try {
      // Ping silencieux ultra-léger avec timeout court de 6s
      await api.get('/auth/me', { timeout: 6000 });
      hasWokenUp.current = true;

      // Dès que le serveur répond, synchroniser les sessions hors-ligne en attente
      syncPendingSessions().catch(() => {});

      if (user) {
        refreshAll().catch(() => {});
      }
    } catch {
      // Si le serveur est endormi, retenter silencieusement dans 7s sans bloquer l'UI
      if (!hasWokenUp.current) {
        setTimeout(() => {
          isPinging.current = false;
          pingServer();
        }, 7000);
        return;
      }
    } finally {
      isPinging.current = false;
    }
  };

  useEffect(() => {
    pingServer();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        pingServer();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user]);
};