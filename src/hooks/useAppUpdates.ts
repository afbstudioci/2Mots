//src/hooks/useAppUpdates.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import api from '../services/api';

interface UpdateState {
  visible: boolean;
  type: 'store' | 'ota';
  title?: string;
  message?: string;
  isForced?: boolean;
  storeUrl?: string;
}

export const useAppUpdates = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    visible: false,
    type: 'ota',
    isForced: false,
  });

  const isChecking = useRef(false);
  const otaDownloaded = useRef(false);

  const localVersionCode =
    Constants.expoConfig?.android?.versionCode ||
    (Platform.OS === 'android' ? 11 : 1);

  const checkOTAUpdates = async (): Promise<boolean> => {
    if (__DEV__) return false;
    try {
      if (otaDownloaded.current) return true;
      const checkResult = await Updates.checkForUpdateAsync();
      if (checkResult.isAvailable) {
        await Updates.fetchUpdateAsync();
        otaDownloaded.current = true;
        setUpdateState({
          visible: true,
          type: 'ota',
          title: 'Mise à jour prête',
          message:
            'Une mise à jour rapide a été téléchargée avec succès. Redémarrez l\'application pour en profiter immédiatement.',
          isForced: false,
        });
        return true;
      }
    } catch (e) {
      console.log('[UPDATES] Vérification OTA ignorée:', e);
    }
    return false;
  };

  const checkStoreUpdates = async () => {
    try {
      const res = await api.get('/config', { timeout: 6000 });
      const versioning = res.data?.data?.versioning;
      if (!versioning) return;

      const remoteLatestCode = Number(versioning.latestVersionCode) || 0;
      const remoteMinCode = Number(versioning.minVersionCode) || 0;
      const isForced = Boolean(versioning.forceUpdate || localVersionCode < remoteMinCode);

      if (remoteLatestCode > localVersionCode) {
        setUpdateState({
          visible: true,
          type: 'store',
          title: versioning.updateTitle || 'Mise à jour disponible',
          message:
            versioning.updateMessage ||
            'Une nouvelle version de votre application est disponible sur le Play Store. Elle contient des améliorations importantes.',
          isForced,
          storeUrl:
            versioning.storeUrl ||
            'https://play.google.com/store/apps/details?id=com.afbstudio.twomots',
        });
      }
    } catch (e) {
      console.log('[UPDATES] Vérification Store ignorée:', e);
    }
  };

  const runAllChecks = useCallback(async () => {
    if (isChecking.current) return;
    isChecking.current = true;

    try {
      const otaFound = await checkOTAUpdates();
      if (!otaFound) {
        await checkStoreUpdates();
      }
    } finally {
      isChecking.current = false;
    }
  }, [localVersionCode]);

  useEffect(() => {
    runAllChecks();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        runAllChecks();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [runAllChecks]);

  const handleApplyUpdate = async () => {
    if (updateState.type === 'ota') {
      try {
        await Updates.reloadAsync();
      } catch {
        setUpdateState((prev) => ({ ...prev, visible: false }));
      }
    } else if (updateState.type === 'store') {
      const url =
        updateState.storeUrl ||
        'https://play.google.com/store/apps/details?id=com.afbstudio.twomots';
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (e) {
        console.warn('[UPDATES] Impossible d\'ouvrir le store:', e);
      }
    }
  };

  const handleDismiss = () => {
    if (!updateState.isForced) {
      setUpdateState((prev) => ({ ...prev, visible: false }));
    }
  };

  return {
    updateState,
    handleApplyUpdate,
    handleDismiss,
  };
};
