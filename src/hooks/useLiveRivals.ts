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
  type: 'approach' | 'overtake' | 'danger';
  rivalPseudo: string;
  rivalScore?: number;
  rivalRank?: number;
  myRank?: number;
  nextRivalPseudo?: string;
  nextRivalScore?: number;
  nextRivalRank?: number;
}

export const useLiveRivals = (initialRivals: LiveRival[] = []) => {
  const rivalsRef = useRef<LiveRival[]>([]);
  const threatBehindRef = useRef<LiveRival | null>(null);
  const baseRankRef = useRef<number>(1);
  const [activeAlert, setActiveAlert] = useState<RivalAlertData | null>(null);
  const overtakenSetRef = useRef<Set<string>>(new Set());
  const approachedSetRef = useRef<Set<string>>(new Set());
  const alertedThreatRef = useRef<boolean>(false);
  const dismissTimerRef = useRef<any>(null);

  const setRivalData = useCallback((rivals: LiveRival[], threat: LiveRival | null = null, userRank: number = 1) => {
    const sorted = [...(rivals || [])].sort((a, b) => a.score - b.score);
    rivalsRef.current = sorted;
    threatBehindRef.current = threat;
    baseRankRef.current = Math.max(1, userRank);
    overtakenSetRef.current.clear();
    approachedSetRef.current.clear();
    alertedThreatRef.current = false;
  }, []);

  const setRivals = useCallback((list: LiveRival[]) => {
    setRivalData(list, null, 1);
  }, [setRivalData]);

  useEffect(() => {
    if (initialRivals && initialRivals.length > 0) {
      setRivals(initialRivals);
    }
  }, [initialRivals, setRivals]);

  const showAlert = (alert: RivalAlertData, durationMs = 4500) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setActiveAlert(alert);
    dismissTimerRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, durationMs);
  };

  const onScoreUpdated = useCallback((currentScore: number) => {
    if (currentScore <= 0) return;

    // 1. Alerte DÉPASSEMENT (Priorité 1) : Détecte si on franchit le score d'un rival
    const rivals = rivalsRef.current;
    for (const rival of rivals) {
      if (currentScore >= rival.score && !overtakenSetRef.current.has(rival.pseudo)) {
        overtakenSetRef.current.add(rival.pseudo);

        const currentOvertakes = overtakenSetRef.current.size;
        const newRank = Math.max(1, baseRankRef.current - currentOvertakes);

        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}

        showAlert({
          type: 'overtake',
          rivalPseudo: rival.pseudo,
          rivalScore: rival.score,
          rivalRank: newRank,
          myRank: newRank
        });
        return;
      }
    }

    // 2. Alerte APPROCHE (Priorité 2) : Détecte si on est à 1 ou 2 mots de doubler le prochain rival
    for (const rival of rivals) {
      const remaining = rival.score - currentScore;
      if (remaining > 0 && remaining <= 2 && !approachedSetRef.current.has(rival.pseudo) && !overtakenSetRef.current.has(rival.pseudo)) {
        approachedSetRef.current.add(rival.pseudo);

        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

        showAlert({
          type: 'approach',
          rivalPseudo: rival.pseudo,
          rivalScore: remaining,
          rivalRank: rival.rank || Math.max(1, baseRankRef.current - 1)
        });
        return;
      }
    }

    // 3. Alerte DANGER (Poursuivant direct) : Affiché uniquement au tout début (mot 2) si quelqu'un talonne
    if (currentScore === 2 && threatBehindRef.current && !alertedThreatRef.current) {
      alertedThreatRef.current = true;
      const threat = threatBehindRef.current;
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

      showAlert({
        type: 'danger',
        rivalPseudo: threat.pseudo,
        rivalRank: threat.rank || (baseRankRef.current + 1),
        myRank: baseRankRef.current
      });
    }
  }, []);

  const resetRivals = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setActiveAlert(null);
    overtakenSetRef.current.clear();
    approachedSetRef.current.clear();
    alertedThreatRef.current = false;
  }, []);

  return {
    activeAlert,
    setRivals,
    setRivalData,
    onScoreUpdated,
    resetRivals,
  };
};
