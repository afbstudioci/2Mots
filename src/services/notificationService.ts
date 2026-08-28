//src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';
import { getToken } from './authStorage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications 2Mots',
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

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
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
      } catch {}
    }

    const authToken = await getToken();
    if (token && authToken) {
      try {
        await api.post('/auth/fcm-token', { fcmToken: token });
      } catch {}
    }
  }

  return token;
};