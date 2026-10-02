// src/hooks/useGameBatches.ts
// GESTION DU CHARGEMENT ET DU PRE-CHARGEMENT EN ARRIERE-PLAN DES LOTS D'ENIGMES
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { shuffleArray } from '../services/offlineVault';
import {
  getCachedGameBatch,
  saveEnigmasToCache,
  triggerSilentWakeup,
} from '../services/enigmaCacheService';
import { EnrichedWordPair } from '../types/gameTypes';

interface UseGameBatchesProps {
  user: any;
  userLevel: number;
  setUserLevel: (level: number) => void;
  setCurrentXp: (xp: number) => void;
  setXpNeeded: (needed: number) => void;
  setUserKevs: (kevs: number) => void;
  setKevyKeys: (keys: number) => void;
  kevyKeysRef: React.MutableRefObject<number>;
  playedWordIdsRef: React.MutableRefObject<string[]>;
  setWordPairs: React.Dispatch<React.SetStateAction<EnrichedWordPair[]>>;
  liveRivals: any;
  onBatchLoaded: () => void;
}

export const useGameBatches = ({
  user,
  userLevel,
  setUserLevel,
  setCurrentXp,
  setXpNeeded,
  setUserKevs,
  setKevyKeys,
  kevyKeysRef,
  playedWordIdsRef,
  setWordPairs,
  liveRivals,
  onBatchLoaded,
}: UseGameBatchesProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingNextBatch = useRef(false);

  const fetchNextBatch = useCallback(async () => {
    if (isFetchingNextBatch.current) return;
    isFetchingNextBatch.current = true;
    try {
      const excludeParam = playedWordIdsRef.current.slice(-25).join(',');
      const res = await api.get(`/game/batch?exclude=${excludeParam}`, { timeout: 15000 });
      const d = res.data?.data;
      const { rivals, threatBehind, userRank } = res.data || {};
      if (rivals?.length) liveRivals.setRivalData(rivals, threatBehind, userRank || 1);

      const fresh = Array.isArray(d)
        ? d.filter((p: any) => !new Set(playedWordIdsRef.current.slice(-15)).has(p._id))
        : [];
      if (fresh.length > 0) {
        saveEnigmasToCache(fresh).catch(() => {});
        setWordPairs((prev) => [
          ...prev,
          ...fresh.map((p: any, idx: number) => ({
            ...p,
            options: shuffleArray(p.options || []),
            hasKey: typeof p.hasKey === 'boolean' ? p.hasKey : idx === 17,
          })),
        ]);
      }
    } catch {
      const local = await getCachedGameBatch(20, userLevel);
      if (local.length) setWordPairs((prev) => [...prev, ...local]);
    } finally {
      isFetchingNextBatch.current = false;
    }
  }, [userLevel, playedWordIdsRef, liveRivals, setWordPairs]);

  const loadInitialBatch = useCallback(async () => {
    setIsLoading(true);
    let resolved = false;

    const fallbackTimer = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        const local = await getCachedGameBatch(30, user?.level || 1);
        setWordPairs(local);
        setIsLoading(false);
        onBatchLoaded();
        triggerSilentWakeup(user?.level || 1);
      }
    }, 5000);

    try {
      const res = await api.get('/game/batch', { timeout: 12000 });
      if (!resolved) {
        resolved = true;
        clearTimeout(fallbackTimer);
        const { data: d, userStats: s, rivals, threatBehind, userRank } = res.data || {};
        if (rivals?.length) liveRivals.setRivalData(rivals, threatBehind, userRank || 1);
        if (d?.length) {
          saveEnigmasToCache(d).catch(() => {});
          setWordPairs(
            d.map((p: any, idx: number) => ({
              ...p,
              options: shuffleArray(p.options || []),
              hasKey: typeof p.hasKey === 'boolean' ? p.hasKey : idx === 17,
            }))
          );
          if (s) {
            setUserLevel(s.level || 1);
            setCurrentXp(s.xp || 0);
            setXpNeeded(s.xpNeeded || 3 + (s.level || 1) * 2);
            setUserKevs(s.kevs || 0);
            if (typeof s.kevyKeys === 'number') {
              setKevyKeys(s.kevyKeys);
              kevyKeysRef.current = s.kevyKeys;
            }
          }
        } else {
          throw new Error('Reponse vide');
        }
        setIsLoading(false);
        onBatchLoaded();
      } else {
        const fresh = res.data?.data;
        if (fresh?.length) saveEnigmasToCache(fresh).catch(() => {});
      }
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(fallbackTimer);
        const local = await getCachedGameBatch(30, user?.level || 1);
        setWordPairs(local);
        setIsLoading(false);
        onBatchLoaded();
      }
    }
  }, [user, liveRivals, setWordPairs, setUserLevel, setCurrentXp, setXpNeeded, setUserKevs, setKevyKeys, kevyKeysRef, onBatchLoaded]);

  return {
    isLoading,
    loadInitialBatch,
    fetchNextBatch,
  };
};
