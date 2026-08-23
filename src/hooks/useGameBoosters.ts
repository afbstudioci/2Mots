//src/hooks/useGameBoosters.ts
import { useState, useCallback } from 'react';
import api from '../services/api';
import { EnrichedWordPair } from '../types/gameTypes';

const normalizeStr = (str: string) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

interface UseGameBoostersProps {
  user: any;
  userKevs: number;
  setUserKevs: React.Dispatch<React.SetStateAction<number>>;
  currentPair: EnrichedWordPair | null;
  isChecking: boolean;
  hasTriggeredGameOver: boolean;
  playHint: () => void;
  playSuccess: () => void;
  onTimeFreezeActivated: (extraSecondsMs: number) => void;
  onSecondChanceReset: () => void;
}

export const useGameBoosters = ({
  user,
  userKevs,
  setUserKevs,
  currentPair,
  isChecking,
  hasTriggeredGameOver,
  playHint,
  playSuccess,
  onTimeFreezeActivated,
  onSecondChanceReset,
}: UseGameBoostersProps) => {
  const [timeFreezeCount, setTimeFreezeCount] = useState<number>(user?.inventory?.boosters?.timeFreeze ?? 2);
  const [superClueCount, setSuperClueCount] = useState<number>(user?.inventory?.boosters?.superClue ?? 2);
  const [secondChanceCount, setSecondChanceCount] = useState<number>(user?.inventory?.boosters?.secondChance ?? 1);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);
  const [eliminatedChoices, setEliminatedChoices] = useState<string[]>([]);
  const [isHintUsed, setIsHintUsed] = useState<boolean>(false);
  const [showNoKevsModal, setShowNoKevsModal] = useState<boolean>(false);

  const syncInventory = useCallback(async () => {
    try {
      const res = await api.get('/shop/catalog', { timeout: 3000 });
      const d = res.data?.data;
      if (d) {
        if (d.inventory?.boosters) {
          setTimeFreezeCount(d.inventory.boosters.timeFreeze ?? 2);
          setSuperClueCount(d.inventory.boosters.superClue ?? 2);
          setSecondChanceCount(d.inventory.boosters.secondChance ?? 1);
        }
        if (d.userKevs !== undefined) setUserKevs(d.userKevs);
      }
    } catch {}
  }, [setUserKevs]);

  const handleUseHint = () => {
    if (isHintUsed || isChecking || hasTriggeredGameOver) return;
    if (userKevs < 5) {
      setShowNoKevsModal(true);
      return;
    }
    if (!currentPair?.options || currentPair.options.length < 3) return;

    setUserKevs((prev) => Math.max(0, prev - 5));
    api.post('/game/use-hint', {}, { timeout: 2000 }).catch(() => {});
    const exact = currentPair.exactMatch ? currentPair.exactMatch[0] : currentPair.options[0];
    const wrong = currentPair.options.filter((o: string) => normalizeStr(o) !== normalizeStr(exact));
    const toEliminate = wrong[Math.floor(Math.random() * wrong.length)];
    setEliminatedChoices([toEliminate]);
    setIsHintUsed(true);
    playHint();
  };

  const handleUseTimeFreeze = async () => {
    if (isTimeFrozen || isChecking || hasTriggeredGameOver) return;
    if (timeFreezeCount <= 0 && userKevs < 15) {
      setShowNoKevsModal(true);
      return;
    }

    try {
      if (timeFreezeCount > 0) setTimeFreezeCount((prev) => prev - 1);
      else setUserKevs((prev) => Math.max(0, prev - 15));

      api.post('/shop/use-booster', { boosterType: 'timeFreeze' }).catch(() => {});
      setIsTimeFrozen(true);
      onTimeFreezeActivated(5000);
      playHint();

      setTimeout(() => {
        setIsTimeFrozen(false);
      }, 5000);
    } catch {}
  };

  const handleUseSuperClue = async () => {
    if (isChecking || hasTriggeredGameOver) return;
    if (superClueCount <= 0 && userKevs < 25) {
      setShowNoKevsModal(true);
      return;
    }
    if (!currentPair?.options) return;

    try {
      if (superClueCount > 0) setSuperClueCount((prev) => prev - 1);
      else setUserKevs((prev) => Math.max(0, prev - 25));

      api.post('/shop/use-booster', { boosterType: 'superClue' }).catch(() => {});
      const exact = currentPair.exactMatch ? currentPair.exactMatch[0] : currentPair.options[0];
      const allWrong = currentPair.options.filter((o: string) => normalizeStr(o) !== normalizeStr(exact));
      setEliminatedChoices(allWrong);
      setIsHintUsed(true);
      playSuccess();
    } catch {}
  };

  const handleUseSecondChance = async (onTransition?: () => void) => {
    if (secondChanceCount <= 0 && userKevs < 30) {
      setShowNoKevsModal(true);
      return;
    }

    try {
      if (secondChanceCount > 0) setSecondChanceCount((prev) => prev - 1);
      else setUserKevs((prev) => Math.max(0, prev - 30));

      api.post('/shop/use-booster', { boosterType: 'secondChance' }).catch(() => {});
      setEliminatedChoices([]);
      setIsHintUsed(false);
      onSecondChanceReset();
      playSuccess();
      if (onTransition) onTransition();
    } catch {}
  };

  const resetBoosterState = () => {
    setEliminatedChoices([]);
    setIsHintUsed(false);
  };

  const addBooster = (type: 'freeze' | 'hint' | 'shield', amount: number = 1) => {
    if (type === 'freeze') setTimeFreezeCount((prev) => prev + amount);
    if (type === 'hint') setSuperClueCount((prev) => prev + amount);
    if (type === 'shield') setSecondChanceCount((prev) => prev + amount);
  };

  return {
    timeFreezeCount,
    superClueCount,
    secondChanceCount,
    isTimeFrozen,
    eliminatedChoices,
    isHintUsed,
    showNoKevsModal,
    setShowNoKevsModal,
    syncInventory,
    handleUseHint,
    handleUseTimeFreeze,
    handleUseSuperClue,
    handleUseSecondChance,
    resetBoosterState,
    addBooster,
  };
};
