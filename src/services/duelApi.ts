//src/services/duelApi.ts
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
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
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
}

export const getEligibleOpponents = async (): Promise<Opponent[]> => {
  const response = await api.get('/duel/opponents');
  return response.data?.data || [];
};

export const getPendingInvites = async (): Promise<{ received: DuelInvite[]; sent: DuelInvite[] }> => {
  const response = await api.get('/duel/invites');
  return response.data?.data || { received: [], sent: [] };
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
