//src/hooks/useLiveRivals.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export interface LiveRival {
  pseudo: string;
  score: number;
  level?: number;
}

export interface RivalAlertData {
  type: 'approach' | 'overtake';
  rivalPseudo: string;
  rivalScore: number;
  nextRivalPseudo?: string;
  nextRivalScore?: number;
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
    // Trouver la cible actuelle (le premier rival avec un score >= currentScore)
    const targetIdx = list.findIndex(r => r.score >= currentScore);
    if (targetIdx === -1) return;

    const target = list[targetIdx];
    const nextTarget = list[targetIdx + 1] || null;

    // Cas 1 : Dépassement exact (currentScore === target.score)
    if (currentScore === target.score && !alertedOvertakesRef.current.has(target.score)) {
      alertedOvertakesRef.current.add(target.score);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setActiveAlert({
        type: 'overtake',
        rivalPseudo: target.pseudo,
        rivalScore: target.score,
        nextRivalPseudo: nextTarget ? nextTarget.pseudo : undefined,
        nextRivalScore: nextTarget ? nextTarget.score : undefined,
      });

      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 3000);
      return;
    }

    // Cas 2 : Approche (currentScore === target.score - 1)
    if (currentScore === target.score - 1 && target.score >= 4 && !alertedApproachesRef.current.has(target.score)) {
      alertedApproachesRef.current.add(target.score);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setActiveAlert({
        type: 'approach',
        rivalPseudo: target.pseudo,
        rivalScore: target.score,
      });

      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 2500);
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
