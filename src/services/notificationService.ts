// src/services/notificationService.ts
// SERVICE CLIENT DES NOTIFICATIONS PUSH EXPO (ANDROID HAUTE PRIORITE)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { colors } from '../theme/theme';

export const ANDROID_PUSH_CHANNEL_ID = 'default';
const FALLBACK_EAS_PROJECT_ID = 'b10e5217-af10-4e8a-a753-b7b2608af455';

// Comportement des notifications quand l'application est au premier plan (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure les canaux de notification Android haute priorite
 */
export const setupNotificationChannelsAsync = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_PUSH_CHANNEL_ID, {
      name: 'Notifications 2Mots',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.coral,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }
};

/**
 * Enregistre l'appareil pour les notifications Push Expo et retourne le token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[PUSH] Appareil virtuel detecte : les push requierent un terminal physique.');
    return null;
  }

  // 1. OBLIGATOIRE ANDROID : Creation du canal haute priorite
  await setupNotificationChannelsAsync();

  // 2. Demande et verification des permissions (Android 13+)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[PUSH] Permission refusee par l\'utilisateur.');
    return null;
  }

  // 3. Extraction de l'EAS Project ID et generation du token Expo
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    FALLBACK_EAS_PROJECT_ID;

  if (!projectId) {
    console.error('[PUSH] Erreur : EAS projectId introuvable dans la configuration Expo.');
    return null;
  }

  try {
    const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = pushTokenData?.data;
    console.log('[PUSH] Token Expo genere avec succes :', token?.substring(0, 25) + '...');
    return token || null;
  } catch (error: any) {
    console.error('[PUSH] Erreur lors de la generation du token Expo :', error?.message || error);
    return null;
  }
}
