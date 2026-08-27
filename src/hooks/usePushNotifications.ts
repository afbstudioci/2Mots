//src/hooks/usePushNotifications.ts
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../navigation/navigationRef';
import api from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [pendingRouting, setPendingRouting] = useState<any>(null);

  // 1. Enregistrement du Token natif FCM & Canaux Android
  useEffect(() => {
    if (!user) return;

    const initPush = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notifications 2Mots',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF7F50',
          sound: 'default',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        try {
          let token: string | undefined;
          try {
            const tokenData = await Notifications.getDevicePushTokenAsync();
            token = tokenData?.data;
          } catch {
            const expoToken = await Notifications.getExpoPushTokenAsync();
            token = expoToken?.data;
          }

          if (token) {
            await api.post('/auth/fcm-token', { fcmToken: token });
          }
        } catch (err) {
          console.warn('[PUSH] Erreur enregistrement token:', err);
        }
      }
    };

    initPush();
  }, [user]);

  // 2. Gestion des clics sur notification (Cold Boot & Background)
  useEffect(() => {
    const checkColdBoot = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response?.notification?.request?.content?.data) {
          setPendingRouting(response.notification.request.content.data);
        }
      } catch {}
    };
    checkColdBoot();

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data) {
        setPendingRouting(data);
      }
    });

    return () => {
      responseListener.remove();
    };
  }, []);

  // 3. Aiguillage et Deep Linking avec temporisation de 400ms
  useEffect(() => {
    if (user && pendingRouting) {
      const timer = setTimeout(() => {
        const { type, duelId, friendId, friendName, friendAvatar } = pendingRouting;

        switch (type) {
          case 'duel_invite':
            navigate('DuelLobby');
            break;
          case 'duel_accepted':
            if (duelId) {
              navigate('DuelGame', { duelId });
            } else {
              navigate('DuelLobby');
            }
            break;
          case 'duel_rejected':
            navigate('DuelLobby');
            break;
          case 'chat_message':
            if (friendId) {
              navigate('Chat', { friendId, friendName: friendName || 'Ami', friendAvatar });
            }
            break;
          case 'friend_request':
          case 'friend_accepted':
            navigate('Friends');
            break;
          default:
            break;
        }

        setPendingRouting(null);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [user, pendingRouting]);
};
