// src/hooks/useRewardedAd.ts
// HOOK DE GESTION DES ANNONCES RECOMPENSEES GOOGLE ADMOB
// Standard : Bank Grade / Clean Architecture (Strict <= 270 lignes, Sans Emojis)

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId } from '../config/admob';

export const useRewardedAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const rewardedAdRef = useRef<RewardedAd | null>(null);
  const onRewardCallbackRef = useRef<(() => void) | null>(null);
  const onErrorCallbackRef = useRef<((err: any) => void) | null>(null);

  const loadAd = useCallback(() => {
    try {
      setIsLoading(true);
      const adUnitId = getRewardedAdUnitId();
      const ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setIsLoaded(true);
        setIsLoading(false);
      });

      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (onRewardCallbackRef.current) {
          onRewardCallbackRef.current();
          onRewardCallbackRef.current = null;
        }
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        // Préchargement automatique de la prochaine publicité
        loadAd();
      });

      const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        setIsLoaded(false);
        setIsLoading(false);
        if (onErrorCallbackRef.current) {
          onErrorCallbackRef.current(error);
          onErrorCallbackRef.current = null;
        }
      });

      ad.load();
      rewardedAdRef.current = ad;

      return () => {
        unsubLoaded();
        unsubEarned();
        unsubClosed();
        unsubError();
      };
    } catch {
      setIsLoaded(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cleanup = loadAd();
    return () => {
      if (cleanup) cleanup();
    };
  }, [loadAd]);

  const showRewardedAd = useCallback(
    (onEarned: () => void, onError?: (err: any) => void) => {
      if (!isLoaded || !rewardedAdRef.current) {
        if (onError) onError(new Error('La vidéo publicitaire est en cours de préparation. Réessayez dans quelques secondes.'));
        loadAd();
        return;
      }

      onRewardCallbackRef.current = onEarned;
      onErrorCallbackRef.current = onError || null;

      try {
        rewardedAdRef.current.show();
      } catch (err) {
        setIsLoaded(false);
        if (onError) onError(err);
        loadAd();
      }
    },
    [isLoaded, loadAd]
  );

  return {
    isLoaded,
    isLoading,
    showRewardedAd,
    reloadAd: loadAd,
  };
};
