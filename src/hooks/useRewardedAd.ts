// src/hooks/useRewardedAd.ts
// GESTIONNAIRE SINGLETON ROBUSTE DES ANNONCES RECOMPENSEES GOOGLE ADMOB
// Standard : Bank Grade / Clean Architecture (Strict <= 270 lignes, Sans Emojis)

import { useEffect, useState, useRef, useCallback } from 'react';
import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId, ADMOB_CONFIG } from '../config/admob';

type AdStateSubscriber = (state: { isLoaded: boolean; isLoading: boolean }) => void;

interface PendingShowRequest {
  onEarned: () => void;
  onError?: (err: any) => void;
}

// ETAT GLOBAL SINGLETON (Partagé entre tous les composants de l'application)
class AdRewardManager {
  private static instance: AdRewardManager;
  private rewardedAd: RewardedAd | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private isInitialized: boolean = false;
  private isFallback: boolean = false;
  private subscribers: Set<AdStateSubscriber> = new Set();
  private pendingRequest: PendingShowRequest | null = null;
  private retryTimeout: any = null;
  private requestTimeout: any = null;
  private retryAttempt: number = 0;

  private constructor() {
    this.initSdk();
  }

  public static getInstance(): AdRewardManager {
    if (!AdRewardManager.instance) {
      AdRewardManager.instance = new AdRewardManager();
    }
    return AdRewardManager.instance;
  }

  private initSdk(): void {
    mobileAds()
      .initialize()
      .then(() => {
        this.isInitialized = true;
        this.preloadAd();
      })
      .catch(() => {
        this.isInitialized = true;
        this.preloadAd();
      });
  }

  public subscribe(subscriber: AdStateSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber({ isLoaded: this.isLoaded, isLoading: this.isLoading });
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    const state = { isLoaded: this.isLoaded, isLoading: this.isLoading };
    this.subscribers.forEach((sub) => sub(state));
  }

  public preloadAd(forceTest: boolean = false): void {
    if (this.isLoaded || this.isLoading) return;

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.isLoading = true;
    if (forceTest) {
      this.isFallback = true;
    }

    this.notify();

    try {
      const adUnitId = this.isFallback
        ? ADMOB_CONFIG.TEST_REWARDED_AD_UNIT_ID
        : getRewardedAdUnitId();

      const ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isLoaded = true;
        this.isLoading = false;
        this.retryAttempt = 0;
        this.notify();

        // Si une demande d'affichage était en attente
        if (this.pendingRequest) {
          if (this.requestTimeout) clearTimeout(this.requestTimeout);
          const req = this.pendingRequest;
          this.pendingRequest = null;
          this.executeShow(ad, req);
        }
      });

      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (this.pendingRequest) {
          this.pendingRequest.onEarned();
          this.pendingRequest = null;
        }
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        this.rewardedAd = null;
        this.notify();
        // Préchargement automatique immédiat de la prochaine vidéo
        setTimeout(() => {
          this.preloadAd();
        }, 1200);
      });

      const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isLoaded = false;
        this.isLoading = false;
        this.rewardedAd = null;
        this.notify();

        // Bascule automatique vers l'unité de test si l'unité de production renvoie un échec
        if (!this.isFallback) {
          this.isFallback = true;
          this.preloadAd(true);
          return;
        }

        // Si l'utilisateur attendait cette pub
        if (this.pendingRequest) {
          if (this.requestTimeout) clearTimeout(this.requestTimeout);
          const req = this.pendingRequest;
          this.pendingRequest = null;
          if (req.onError) {
            req.onError(
              error || new Error('La vidéo publicitaire est momentanément indisponible.')
            );
          }
        }

        // Réessai automatique en arrière-plan avec délai progressif
        this.scheduleRetry();
      });

      ad.load();
      this.rewardedAd = ad;
    } catch {
      this.isLoading = false;
      this.isLoaded = false;
      this.notify();
      this.scheduleRetry();
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this.retryAttempt += 1;
    // Délai progressif : 4s, 8s, 16s, 30s max
    const delay = Math.min(30000, 4000 * Math.pow(1.8, Math.min(this.retryAttempt, 4)));
    this.retryTimeout = setTimeout(() => {
      this.preloadAd();
    }, delay);
  }

  private executeShow(ad: RewardedAd, req: PendingShowRequest): void {
    try {
      this.pendingRequest = req;
      ad.show();
    } catch (err) {
      this.isLoaded = false;
      this.pendingRequest = null;
      this.notify();
      if (req.onError) req.onError(err);
      this.preloadAd();
    }
  }

  public showAd(onEarned: () => void, onError?: (err: any) => void): void {
    const req: PendingShowRequest = { onEarned, onError };

    // Cas 1 : La publicité est déjà disponible en mémoire
    if (this.isLoaded && this.rewardedAd) {
      this.executeShow(this.rewardedAd, req);
      return;
    }

    // Cas 2 : La publicité est en cours de chargement ou doit être initiée
    this.pendingRequest = req;
    if (!this.isLoading) {
      this.preloadAd();
    }

    // Timeout de sécurité de 10 secondes pour ne pas bloquer l'utilisateur
    if (this.requestTimeout) clearTimeout(this.requestTimeout);
    this.requestTimeout = setTimeout(() => {
      if (this.pendingRequest) {
        const pending = this.pendingRequest;
        this.pendingRequest = null;
        if (pending.onError) {
          pending.onError(
            new Error('Délai d’attente dépassé. Veuillez vérifier votre connexion et réessayer.')
          );
        }
      }
    }, 10000);
  }

  public getState() {
    return { isLoaded: this.isLoaded, isLoading: this.isLoading };
  }
}

export const useRewardedAd = () => {
  const manager = useRef(AdRewardManager.getInstance()).current;
  const [state, setState] = useState(manager.getState());

  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, [manager]);

  const showRewardedAd = useCallback(
    (onEarned: () => void, onError?: (err: any) => void) => {
      manager.showAd(onEarned, onError);
    },
    [manager]
  );

  const reloadAd = useCallback(() => {
    manager.preloadAd();
  }, [manager]);

  return {
    isLoaded: state.isLoaded,
    isLoading: state.isLoading,
    showRewardedAd,
    reloadAd,
  };
};

