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
  const myRankRef = useRef<number>(1);
  const [activeAlert, setActiveAlert] = useState<RivalAlertData | null>(null);
  const alertedApproachesRef = useRef<Set<number>>(new Set());
  const alertedOvertakesRef = useRef<Set<number>>(new Set());
  const alertedThreatRef = useRef<boolean>(false);
  const dismissTimerRef = useRef<any>(null);

  const setRivalData = useCallback((rivals: LiveRival[], threat: LiveRival | null = null, userRank: number = 1) => {
    const sorted = [...(rivals || [])].sort((a, b) => a.score - b.score);
    rivalsRef.current = sorted;
    threatBehindRef.current = threat;
    myRankRef.current = userRank;
    alertedApproachesRef.current.clear();
    alertedOvertakesRef.current.clear();
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

  const onScoreUpdated = useCallback((currentScore: number) => {
    if (currentScore <= 0) return;

    // Cas 1 : Alerte "En Danger / Poursuivant" dès le 1er mot trouvé
    if (currentScore === 1 && threatBehindRef.current && !alertedThreatRef.current) {
      alertedThreatRef.current = true;
      const threat = threatBehindRef.current;
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setActiveAlert({
        type: 'danger',
        rivalPseudo: threat.pseudo,
        rivalRank: threat.rank,
        myRank: myRankRef.current,
      });

      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
      return;
    }

    if (rivalsRef.current.length === 0) return;

    const list = rivalsRef.current;
    const targetIdx = list.findIndex(r => r.score >= currentScore);
    if (targetIdx === -1) return;

    const target = list[targetIdx];
    const nextTarget = list[targetIdx + 1] || null;

    // Cas 2 : Dépassement de rang mondial (currentScore === target.score)
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

      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
      return;
    }

    // Cas 3 : Approche d'une place supérieure (currentScore === target.score - 1)
    if (currentScore === target.score - 1 && target.score >= 3 && !alertedApproachesRef.current.has(target.score)) {
      alertedApproachesRef.current.add(target.score);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setActiveAlert({
        type: 'approach',
        rivalPseudo: target.pseudo,
        rivalScore: target.score,
        rivalRank: target.rank,
      });

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
