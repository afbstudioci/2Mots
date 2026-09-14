// src/config/admob.ts
// CONFIGURATION DES IDENTIFIANTS GOOGLE ADMOB
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { TestIds } from 'react-native-google-mobile-ads';

export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-5873173554180779~9273317337',
  PROD_REWARDED_AD_UNIT_ID: 'ca-app-pub-5873173554180779/5046297711',
  TEST_REWARDED_AD_UNIT_ID: TestIds.REWARDED,
};

/**
 * Retourne l'identifiant du bloc d'annonces récompensées.
 * Utilise l'ID de test en développement et l'ID officiel en production.
 */
export const getRewardedAdUnitId = (): string => {
  if (__DEV__) {
    return ADMOB_CONFIG.TEST_REWARDED_AD_UNIT_ID;
  }
  return ADMOB_CONFIG.PROD_REWARDED_AD_UNIT_ID;
};
