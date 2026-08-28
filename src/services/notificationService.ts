// src/services/notificationService.ts
// GESTION CANAUX ET ENREGISTREMENT PUSH - STANDARDS INDUSTRIELS
// CSCSM Level: Bank Grade (Strict <= 325 lignes)

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';
import { getToken } from './authStorage';

export const PRIMARY_CHANNEL_ID = 'twomots_alerts_v3';
export const LEGACY_CHANNEL_ID = 'default';

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
    // 1. Canal Maître Dédié Priorité MAX (Anti-Cache Android)
    await Notifications.setNotificationChannelAsync(PRIMARY_CHANNEL_ID, {
      name: 'Alertes & Duels 2Mots',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F50',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });

    // 2. Canal Secondaire Compatibilité
    await Notifications.setNotificationChannelAsync(LEGACY_CHANNEL_ID, {
      name: 'Notifications Générales',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F50',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }
};

// Initialisation immédiate des canaux au chargement du module
setupNotificationChannelsAsync().catch((err) => {
  console.warn('[PUSH] Erreur initialisation canaux Android:', err);
});

export const registerForPushNotificationsAsync = async () => {
  let token: string | undefined;

  await setupNotificationChannelsAsync();

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[PUSH] Permission de notification refusée par l\'utilisateur.');
      return undefined;
    }

    try {
      const pushTokenData = await Notifications.getDevicePushTokenAsync();
      token = typeof pushTokenData?.data === 'string' ? pushTokenData.data : String(pushTokenData?.data || '');
    } catch {
      try {
        const expoToken = await Notifications.getExpoPushTokenAsync({
          projectId: 'b10e5217-af10-4e8a-a753-b7b2608af455',
        });
        token = expoToken?.data;
      } catch (expoErr) {
        console.warn('[PUSH] Erreur récupération Expo Push Token:', expoErr);
      }
    }

    const authToken = await getToken();
    if (token && authToken) {
      try {
        await api.post('/auth/fcm-token', { fcmToken: token });
        console.log('[PUSH] Token synchronisé avec le backend avec succès.');
      } catch (syncErr: any) {
        console.warn('[PUSH] Échec synchronisation token API:', syncErr.message);
      }
    }
  }

  return token;
};
