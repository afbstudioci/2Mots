// src/services/notificationService.ts
// GESTION CANAUX ET ENREGISTREMENT PUSH - STANDARDS INDUSTRIELS
// CSCSM Level: Bank Grade (Strict <= 270 lignes)

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { colors } from '../theme/theme';

export const PRIMARY_CHANNEL_ID = 'twomots_channel_v4_urgent';
export const LEGACY_CHANNEL_ID = 'default';

// Handler racine pour intercepter et forcer l'affichage de la banniere visuelle
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotificationChannelsAsync = async () => {
  if (Platform.OS === 'android') {
    // 1. Canal Maitre V4 (Heads-up banner & son)
    await Notifications.setNotificationChannelAsync(PRIMARY_CHANNEL_ID, {
      name: 'Alertes & Duels 2Mots',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.coral,
      enableLights: true,
      enableVibrate: true,
      sound: 'default',
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });

    // 2. Canal V3 Fallback
    await Notifications.setNotificationChannelAsync('twomots_alerts_v3', {
      name: 'Notifications 2Mots',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.coral,
      enableLights: true,
      enableVibrate: true,
      sound: 'default',
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });

    // 3. Canal Secondaire Compatibilite
    await Notifications.setNotificationChannelAsync(LEGACY_CHANNEL_ID, {
      name: 'Notifications Générales',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.coral,
      enableLights: true,
      enableVibrate: true,
      sound: 'default',
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }
};

// Initialisation immediate des canaux au chargement du module
setupNotificationChannelsAsync().catch((err) => {
  console.warn('[PUSH] Erreur initialisation canaux Android:', err);
});

