// src/services/notificationService.ts
// GESTION CANAUX ET ENREGISTREMENT PUSH - STANDARDS INDUSTRIELS
// CSCSM Level: Bank Grade (Strict <= 270 lignes, Sans Emojis)

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { colors } from '../theme/theme';

export const PRIMARY_CHANNEL_ID = 'default';

// Handler racine pour forcer l'affichage de la banniere visuelle foreground/background
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
    // 1. Canal Maitre Unifie (Modele Yely - default)
    await Notifications.setNotificationChannelAsync('default', {
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

    // 2. Canaux de compatibilite
    await Notifications.setNotificationChannelAsync('twomots_channel_v4_urgent', {
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

    await Notifications.setNotificationChannelAsync('twomots_alerts_v3', {
      name: 'Alertes 2Mots V3',
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
