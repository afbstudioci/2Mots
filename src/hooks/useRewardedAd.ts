// src/hooks/useRewardedAd.ts
// HOOK ROBUSTE DE GESTION DES ANNONCES RECOMPENSEES GOOGLE ADMOB
// Standard : Bank Grade / Clean Architecture (Strict <= 270 lignes, Sans Emojis)

import { useEffect, useState, useRef, useCallback } from 'react';
import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId, ADMOB_CONFIG } from '../config/admob';

export const useRewardedAd = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const rewardedAdRef = useRef<RewardedAd | null>(null);
  const onRewardCallbackRef = useRef<(() => void) | null>(null);
  const onErrorCallbackRef = useRef<((err: any) => void) | null>(null);
  const pendingShowRef = useRef<{ onEarned: () => void; onError?: (err: any) => void } | null>(null);
  const isFallbackRef = useRef<boolean>(false);
  const loadTimeoutRef = useRef<any>(null);

  const loadAd = useCallback((forceTestUnit: boolean = false) => {
    try {
      setIsLoading(true);
      if (forceTestUnit) {
        isFallbackRef.current = true;
      }

      const adUnitId = isFallbackRef.current
        ? ADMOB_CONFIG.TEST_REWARDED_AD_UNIT_ID
        : getRewardedAdUnitId();

      const ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setIsLoaded(true);
        setIsLoading(false);

        // Si l'utilisateur avait cliqué avant la fin du chargement, afficher immédiatement
        if (pendingShowRef.current) {
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          const { onEarned, onError } = pendingShowRef.current;
          onRewardCallbackRef.current = onEarned;
          onErrorCallbackRef.current = onError || null;
          pendingShowRef.current = null;
          try {
            ad.show();
          } catch (showErr) {
            setIsLoaded(false);
            if (onError) onError(showErr);
          }
        }
      });

      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (onRewardCallbackRef.current) {
          onRewardCallbackRef.current();
          onRewardCallbackRef.current = null;
        }
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        isFallbackRef.current = false;
        // Préchargement de la prochaine publicité
        setTimeout(() => {
          loadAd();
        }, 1000);
      });

      const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        setIsLoaded(false);

        // Si l'identifiant de production échoue (ex: inventaire non encore actif par AdMob), bascule automatique sur l'unité de test
        if (!isFallbackRef.current) {
          isFallbackRef.current = true;
          loadAd(true);
          return;
        }

        setIsLoading(false);
        if (pendingShowRef.current) {
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          const { onError } = pendingShowRef.current;
          pendingShowRef.current = null;
          if (onError) onError(error || new Error('Vidéo indisponible. Réessayez.'));
        } else if (onErrorCallbackRef.current) {
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
    mobileAds()
      .initialize()
      .then(() => {
        loadAd();
      })
      .catch(() => {
        loadAd();
      });

    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [loadAd]);

  const showRewardedAd = useCallback(
    (onEarned: () => void, onError?: (err: any) => void) => {
      onRewardCallbackRef.current = onEarned;
      onErrorCallbackRef.current = onError || null;

      // Cas 1 : L'annonce est déjà prête en mémoire
      if (isLoaded && rewardedAdRef.current) {
        try {
          rewardedAdRef.current.show();
        } catch (err) {
          setIsLoaded(false);
          // Tentative de rechargement immédiat
          pendingShowRef.current = { onEarned, onError };
          loadAd(true);
        }
        return;
      }

      // Cas 2 : L'annonce est encore en train de se charger
      pendingShowRef.current = { onEarned, onError };
      setIsLoading(true);
      loadAd();

      // Timeout de sécurité de 12 secondes
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = setTimeout(() => {
        if (pendingShowRef.current) {
          pendingShowRef.current = null;
          setIsLoading(false);
          if (onError) {
            onError(new Error('Le chargement de la vidéo a expiré. Veuillez vérifier votre connexion et réessayer.'));
          }
        }
      }, 12000);
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
