//src/hooks/useLiveRivals.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export interface LiveRival {
  pseudo: string;
  score: number;
  level?: number;
  rank?: number;
}

export interface RivalAlertData {
  type: 'approach' | 'overtake';
  rivalPseudo: string;
  rivalScore: number;
  rivalRank?: number;
  nextRivalPseudo?: string;
  nextRivalScore?: number;
  nextRivalRank?: number;
}

export const useLiveRivals = (initialRivals: LiveRival[] = []) => {
  const rivalsRef = useRef<LiveRival[]>([]);
  const [activeAlert, setActiveAlert] = useState<RivalAlertData | null>(null);
  const alertedApproachesRef = useRef<Set<number>>(new Set());
  const alertedOvertakesRef = useRef<Set<number>>(new Set());
  const dismissTimerRef = useRef<any>(null);

  const setRivals = useCallback((list: LiveRival[]) => {
    const sorted = [...list].sort((a, b) => a.score - b.score);
    rivalsRef.current = sorted;
    alertedApproachesRef.current.clear();
    alertedOvertakesRef.current.clear();
  }, []);

  useEffect(() => {
    if (initialRivals && initialRivals.length > 0) {
      setRivals(initialRivals);
    }
  }, [initialRivals, setRivals]);

  const onScoreUpdated = useCallback((currentScore: number) => {
    if (rivalsRef.current.length === 0 || currentScore <= 0) return;

    const list = rivalsRef.current;
    const targetIdx = list.findIndex(r => r.score >= currentScore);
    if (targetIdx === -1) return;

    const target = list[targetIdx];
    const nextTarget = list[targetIdx + 1] || null;

    // Dépassement de rang mondial (currentScore === target.score)
    if (currentScore === target.score && !alertedOvertakesRef.current.has(target.score)) {
      alertedOvertakesRef.current.add(target.score);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setActiveAlert({
        type: 'overtake',
        rivalPseudo: target.pseudo,
        rivalScore: target.score,
        rivalRank: target.rank,
        nextRivalPseudo: nextTarget ? nextTarget.pseudo : undefined,
        nextRivalScore: nextTarget ? nextTarget.score : undefined,
        nextRivalRank: nextTarget ? nextTarget.rank : undefined,
      });

      // Durée de lecture confortable de 5 secondes
      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
      return;
    }

    // Approche de la place (currentScore === target.score - 1)
    if (currentScore === target.score - 1 && target.score >= 3 && !alertedApproachesRef.current.has(target.score)) {
      alertedApproachesRef.current.add(target.score);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setActiveAlert({
        type: 'approach',
        rivalPseudo: target.pseudo,
        rivalScore: target.score,
        rivalRank: target.rank,
      });

      // Durée de lecture confortable de 5 secondes
      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
    }
  }, []);

  const resetRivals = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setActiveAlert(null);
    alertedApproachesRef.current.clear();
    alertedOvertakesRef.current.clear();
  }, []);

  return {
    activeAlert,
    setRivals,
    onScoreUpdated,
    resetRivals,
  };
};
