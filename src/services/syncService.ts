//src/services/syncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const SYNC_QUEUE_KEY = '@twomots_offline_queue';

export interface OfflineSession {
  id: string;
  playedAt: number;
  score: number;
  durationMs: number;
  rounds: {
    wordPairId: string;
    word1: string;
    word2: string;
    answer: string;
    isCorrect: boolean;
    timeSpentMs: number;
  }[];
}

export const queueOfflineSession = async (session: Omit<OfflineSession, 'id' | 'playedAt'>): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: OfflineSession[] = raw ? JSON.parse(raw) : [];

    const newEntry: OfflineSession = {
      ...session,
      id: `off_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playedAt: Date.now(),
    };

    queue.push(newEntry);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('[SYNC] Erreur de mise en file locale :', e);
  }
};

export const syncPendingSessions = async (): Promise<{ synced: number; failed: number }> => {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return { synced: 0, failed: 0 };

    const queue: OfflineSession[] = JSON.parse(raw);
    if (queue.length === 0) return { synced: 0, failed: 0 };

    const remaining: OfflineSession[] = [];
    let synced = 0;

    for (const session of queue) {
      try {
        await api.post('/game/sync-offline', session, { timeout: 8000 });
        synced++;
      } catch (err: any) {
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          // Erreur de validation (ex: session invalide/triche détectée) : on ne rejoue pas
          console.warn('[SYNC] Session rejetée par le backend :', err.response.data);
        } else {
          // Erreur réseau / serveur indisponible : on conserve la session pour le prochain cycle
          remaining.push(session);
        }
      }
    }

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    return { synced, failed: remaining.length };
  } catch (e) {
    console.warn('[SYNC] Erreur globale synchronisation :', e);
    return { synced: 0, failed: 0 };
  }
};

export const getPendingSessionsCount = async (): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue.length : 0;
  } catch {
    return 0;
  }
};