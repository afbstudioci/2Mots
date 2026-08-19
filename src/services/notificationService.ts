//src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token: string | undefined;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[PUSH] Permission refusée');
      return;
    }

    try {
      const pushTokenData = await Notifications.getDevicePushTokenAsync();
      token = pushTokenData.data;
    } catch {
      try {
        const expoToken = await Notifications.getExpoPushTokenAsync();
        token = expoToken.data;
      } catch (e) {
        console.warn('[PUSH] Impossible d obtenir un token:', e);
      }
    }

    if (token) {
      try {
        await api.post('/auth/fcm-token', { fcmToken: token });
      } catch (e) {
        console.warn('[PUSH] Erreur envoi token au serveur:', e);
      }
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications 2Mots',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F50',
    });
  }

  return token;
};