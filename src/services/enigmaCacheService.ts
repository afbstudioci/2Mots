// src/services/enigmaCacheService.ts
// SERVICE DE GESTION DU CACHE PERSISTANT D'ENIGMES ET REVEIL SERVEUR
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { getLocalGameBatch, shuffleArray } from './offlineVault';
import { EnrichedWordPair } from '../types/gameTypes';

const ENIGMA_CACHE_KEY = '@twomots_enigma_cache';
const PLAYED_CACHE_IDS_KEY = '@twomots_played_cached_ids';
const MAX_CACHE_SIZE = 90;
const MAX_PLAYED_HISTORY = 500;

let isPrefetching = false;

export const getPlayedCacheIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(PLAYED_CACHE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markEnigmasAsPlayed = async (enigmaIds: string[]): Promise<void> => {
  if (!enigmaIds || enigmaIds.length === 0) return;
  try {
    const current = await getPlayedCacheIds();
    const merged = Array.from(new Set([...current, ...enigmaIds])).slice(-MAX_PLAYED_HISTORY);
    await AsyncStorage.setItem(PLAYED_CACHE_IDS_KEY, JSON.stringify(merged));

    // Nettoyage des enigmes jouees dans le stock persistant
    const rawCache = await AsyncStorage.getItem(ENIGMA_CACHE_KEY);
    if (rawCache) {
      const cache: EnrichedWordPair[] = JSON.parse(rawCache);
      const playedSet = new Set(merged);
      const filtered = cache.filter((p) => !playedSet.has(p._id));
      await AsyncStorage.setItem(ENIGMA_CACHE_KEY, JSON.stringify(filtered));
    }
  } catch (err: any) {
    console.warn('[CACHE_ENIGMA] Erreur enregistrement enigmes jouees :', err?.message);
  }
};

export const getCachedEnigmas = async (): Promise<EnrichedWordPair[]> => {
  try {
    const raw = await AsyncStorage.getItem(ENIGMA_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveEnigmasToCache = async (newEnigmas: EnrichedWordPair[]): Promise<void> => {
  if (!newEnigmas || newEnigmas.length === 0) return;
  try {
    const played = await getPlayedCacheIds();
    const playedSet = new Set(played);
    const existing = await getCachedEnigmas();
    const existingIds = new Set(existing.map((e) => e._id));

    const validNew = newEnigmas.filter((e) => !playedSet.has(e._id) && !existingIds.has(e._id));
    const merged = [...existing, ...validNew].slice(-MAX_CACHE_SIZE);
    await AsyncStorage.setItem(ENIGMA_CACHE_KEY, JSON.stringify(merged));
  } catch (err: any) {
    console.warn('[CACHE_ENIGMA] Erreur sauvegarde cache :', err?.message);
  }
};

export const getCachedGameBatch = async (
  count: number = 30,
  userLevel: number = 1
): Promise<EnrichedWordPair[]> => {
  try {
    const cached = await getCachedEnigmas();
    const played = await getPlayedCacheIds();
    const playedSet = new Set(played);

    const available = cached.filter((p) => !playedSet.has(p._id));
    if (available.length >= 10) {
      const selected = available.slice(0, count);
      return selected.map((p, idx) => ({
        ...p,
        options: shuffleArray(p.options || []),
        hasKey: typeof p.hasKey === 'boolean' ? p.hasKey : idx === 17,
      }));
    }

    // Si le stock dynamique est insuffisant, fusion transparente avec le vault hors-ligne
    const fallback = getLocalGameBatch(count, userLevel, played.slice(-30));
    return (fallback as any).map((p: any, idx: number) => ({
      ...p,
      hasKey: idx === 17,
    }));
  } catch {
    const fallback = getLocalGameBatch(count, userLevel, []);
    return (fallback as any).map((p: any, idx: number) => ({
      ...p,
      hasKey: idx === 17,
    }));
  }
};

export const prefetchEnigmas = async (userLevel: number = 1): Promise<void> => {
  if (isPrefetching) return;
  isPrefetching = true;
  try {
    const played = await getPlayedCacheIds();
    const excludeParam = played.slice(-25).join(',');
    const res = await api.get(`/game/batch?exclude=${excludeParam}`, { timeout: 35000 });
    const freshData = res.data?.data;
    if (Array.isArray(freshData) && freshData.length > 0) {
      await saveEnigmasToCache(freshData);
    }
  } catch (err: any) {
    console.log('[CACHE_ENIGMA] Prefetch differe (serveur en veille ou hors-ligne) :', err?.message);
  } finally {
    isPrefetching = false;
  }
};

export const triggerSilentWakeup = (userLevel: number = 1): void => {
  // Envoi asynchrone non-bloquant pour reveiller le backend en tâche de fond
  setTimeout(() => {
    prefetchEnigmas(userLevel).catch(() => {});
  }, 100);
};
