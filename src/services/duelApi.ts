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

const OPPONENTS_CACHE_KEY = '@cached_duel_opponents';
const INVITES_CACHE_KEY = '@cached_duel_invites';

export const getCachedOpponents = async (): Promise<Opponent[] | null> => {
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
  const response = await api.post('/duel/invite', { opponentId, betAmount });
  return response.data?.data;
};

export const respondDuelInvite = async (duelId: string, accept: boolean): Promise<any> => {
  const response = await api.post('/duel/respond', { duelId, accept });
  return response.data?.data;
};

export const getDuelDetails = async (duelId: string): Promise<DuelSessionData> => {
  const response = await api.get(`/duel/${duelId}`);
  return response.data?.data;
};

export const cancelDuelInvite = async (duelId: string): Promise<any> => {
  const response = await api.post('/duel/cancel', { duelId });
  return response.data?.data;
};

export const cancelInactiveDuel = async (duelId: string): Promise<any> => {
  const response = await api.post('/duel/cancel-inactive', { duelId });
  return response.data?.data;
};

export const forfeitDuel = async (duelId: string): Promise<any> => {
  const response = await api.post('/duel/forfeit', { duelId });
  return response.data?.data;
};
