//src/services/duelApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface Opponent {
  _id: string;
  login: string;
  avatar?: string;
  level: number;
  bestScore: number;
  isVip?: boolean;
  equippedFrame?: string;
  isFriend?: boolean;
  isOnline?: boolean;
}

export interface DuelInvite {
  _id: string;
  challenger: {
    _id: string;
    login: string;
    avatar?: string;
    level: number;
  };
  opponent: {
    _id: string;
    login: string;
    avatar?: string;
    level: number;
  };
  betAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'ready';
  createdAt: string;
}

export interface DuelEnigma {
  enigmaId: string;
  word1: string;
  word2: string;
  answer?: string;
  propositions: string[];
  clue?: string;
}

export interface DuelSessionData {
  _id: string;
  challenger: { _id: string; login: string; avatar?: string; level: number };
  opponent: { _id: string; login: string; avatar?: string; level: number };
  betAmount: number;
  totalPot: number;
  status: string;
  scores: { challenger: number; opponent: number };
  enigmas: DuelEnigma[];
  currentEnigmaIndex: number;
  activeBuzzer?: { userId?: string; lockedAt?: string; expiresAt?: string };
  winner?: { _id: string; login: string; avatar?: string; level: number };
  isDraw?: boolean;
  duration: number;
  startedAt?: string;
  endedAt?: string;
}

export interface DuelLobbyData {
  opponents: Opponent[];
  invites: { received: DuelInvite[]; sent: DuelInvite[] };
  activeDuel: DuelSessionData | null;
}

const OPPONENTS_CACHE_KEY = '@cached_duel_opponents';
const INVITES_CACHE_KEY = '@cached_duel_invites';
const LOBBY_MEMORY_TTL_MS = 20 * 1000; // 20 secondes de rétention ultra-rapide

let memoryLobbyCache: (DuelLobbyData & { cachedAt: number }) | null = null;

export const invalidateDuelLobbyCache = (): void => {
  memoryLobbyCache = null;
};

export const getCachedLobbyData = async (): Promise<DuelLobbyData | null> => {
  if (memoryLobbyCache) {
    return {
      opponents: memoryLobbyCache.opponents,
      invites: memoryLobbyCache.invites,
      activeDuel: memoryLobbyCache.activeDuel,
    };
  }
  try {
    const [rawOpps, rawInvs] = await Promise.all([
      AsyncStorage.getItem(OPPONENTS_CACHE_KEY),
      AsyncStorage.getItem(INVITES_CACHE_KEY),
    ]);
    const opponents = rawOpps ? JSON.parse(rawOpps) : [];
    const invites = rawInvs ? JSON.parse(rawInvs) : { received: [], sent: [] };
    if (opponents.length > 0 || invites.received.length > 0 || invites.sent.length > 0) {
      return { opponents, invites, activeDuel: null };
    }
  } catch {}
  return null;
};

export const getCachedOpponents = async (): Promise<Opponent[] | null> => {
  if (memoryLobbyCache?.opponents) return memoryLobbyCache.opponents;
  try {
    const raw = await AsyncStorage.getItem(OPPONENTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCachedOpponents = async (data: Opponent[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OPPONENTS_CACHE_KEY, JSON.stringify(data));
  } catch {}
};

export const getCachedInvites = async (): Promise<{ received: DuelInvite[]; sent: DuelInvite[] } | null> => {
  if (memoryLobbyCache?.invites) return memoryLobbyCache.invites;
  try {
    const raw = await AsyncStorage.getItem(INVITES_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCachedInvites = async (data: { received: DuelInvite[]; sent: DuelInvite[] }): Promise<void> => {
  try {
    await AsyncStorage.setItem(INVITES_CACHE_KEY, JSON.stringify(data));
  } catch {}
};

export const getDuelLobbyBootstrap = async (forceRefresh = false): Promise<DuelLobbyData> => {
  const now = Date.now();
  if (!forceRefresh && memoryLobbyCache && (now - memoryLobbyCache.cachedAt) < LOBBY_MEMORY_TTL_MS) {
    return {
      opponents: memoryLobbyCache.opponents,
      invites: memoryLobbyCache.invites,
      activeDuel: memoryLobbyCache.activeDuel,
    };
  }

  try {
    const response = await api.get('/duel/lobby-bootstrap');
    const data: DuelLobbyData = response.data?.data || {
      opponents: [],
      invites: { received: [], sent: [] },
      activeDuel: null,
    };

    memoryLobbyCache = {
      ...data,
      cachedAt: Date.now(),
    };

    setCachedOpponents(data.opponents).catch(() => {});
    setCachedInvites(data.invites).catch(() => {});

    return data;
  } catch (error) {
    if (memoryLobbyCache) {
      return {
        opponents: memoryLobbyCache.opponents,
        invites: memoryLobbyCache.invites,
        activeDuel: memoryLobbyCache.activeDuel,
      };
    }
    const [opps, invs, active] = await Promise.all([
      getEligibleOpponents(),
      getPendingInvites(),
      getActiveDuel(),
    ]);
    const fallbackData: DuelLobbyData = {
      opponents: opps,
      invites: invs,
      activeDuel: active,
    };
    memoryLobbyCache = { ...fallbackData, cachedAt: Date.now() };
    return fallbackData;
  }
};

export const getEligibleOpponents = async (): Promise<Opponent[]> => {
  const response = await api.get('/duel/opponents');
  const data = response.data?.data || [];
  setCachedOpponents(data).catch(() => {});
  return data;
};

export const getPendingInvites = async (): Promise<{ received: DuelInvite[]; sent: DuelInvite[] }> => {
  const response = await api.get('/duel/invites');
  const data = response.data?.data || { received: [], sent: [] };
  setCachedInvites(data).catch(() => {});
  return data;
};

export const getActiveDuel = async (): Promise<DuelSessionData | null> => {
  try {
    const response = await api.get('/duel/active');
    return response.data?.data || null;
  } catch {
    return null;
  }
};

export const sendDuelInvite = async (opponentId: string, betAmount: number): Promise<DuelInvite> => {
  invalidateDuelLobbyCache();
  const response = await api.post('/duel/invite', { opponentId, betAmount });
  return response.data?.data;
};

export const respondDuelInvite = async (duelId: string, accept: boolean): Promise<any> => {
  invalidateDuelLobbyCache();
  const response = await api.post('/duel/respond', { duelId, accept });
  return response.data?.data;
};

export const getDuelDetails = async (duelId: string): Promise<DuelSessionData> => {
  const response = await api.get(`/duel/${duelId}`);
  return response.data?.data;
};

export const cancelDuelInvite = async (duelId: string): Promise<any> => {
  invalidateDuelLobbyCache();
  const response = await api.post('/duel/cancel', { duelId });
  return response.data?.data;
};

export const cancelInactiveDuel = async (duelId: string): Promise<any> => {
  invalidateDuelLobbyCache();
  const response = await api.post('/duel/cancel-inactive', { duelId });
  return response.data?.data;
};

export const forfeitDuel = async (duelId: string): Promise<any> => {
  invalidateDuelLobbyCache();
  const response = await api.post('/duel/forfeit', { duelId });
  return response.data?.data;
};
