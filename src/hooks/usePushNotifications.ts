// src/hooks/usePushNotifications.ts
// GESTION FCM - Enregistrement, Synchronisation et Aiguillage Deep Link
// CSCSM Level: Bank Grade (Strict <= 325 lignes)

import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../navigation/navigationRef';
import api from '../services/api';
import { setupNotificationChannelsAsync } from '../services/notificationService';

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

  // 1. Initialisation immédiate des canaux Android au montage
  useEffect(() => {
    setupNotificationChannelsAsync().catch((err) => {
      console.warn('[PUSH] Erreur setup canaux au montage:', err);
    });
  }, []);

  // 2. Demande de permissions & Enregistrement Token FCM dès qu'un utilisateur est actif
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const initPush = async () => {
      try {
        await setupNotificationChannelsAsync();

        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== 'granted') {
            console.warn('[PUSH] Permission de notification refusée.');
            return;
          }

          let token: string | undefined;
          try {
            const tokenData = await Notifications.getDevicePushTokenAsync();
            token = typeof tokenData?.data === 'string' ? tokenData.data : String(tokenData?.data || '');
          } catch (devErr) {
            console.warn('[PUSH] Fallback vers getExpoPushTokenAsync:', devErr);
          }

          if (!token) {
            try {
              const expoToken = await Notifications.getExpoPushTokenAsync({
                projectId: 'b10e5217-af10-4e8a-a753-b7b2608af455',
              });
              token = expoToken?.data;
            } catch (expoErr) {
              console.warn('[PUSH] Erreur getExpoPushTokenAsync:', expoErr);
            }
          }

          if (token && isMounted) {
            console.log('[PUSH] Token FCM synchronisé:', token);
            await api.post('/auth/fcm-token', { fcmToken: token });
          }
        }
      } catch (err: any) {
        console.warn('[PUSH] Erreur enregistrement token push:', err.message);
      }
    };

    initPush();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 3. Écouteurs de clics sur notification (Cold boot & Background)
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

  // 4. Aiguillage et Deep Linking instantané
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
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [user, pendingRouting]);
};
