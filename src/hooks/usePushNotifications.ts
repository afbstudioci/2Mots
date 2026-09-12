// src/hooks/usePushNotifications.ts
// GESTION DES NOTIFICATIONS PUSH EXPO (100% GRATUIT)
// Enregistrement, Synchronisation et Aiguillage Deep Link
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../navigation/navigationRef';
import api from '../services/api';
import { setupNotificationChannelsAsync } from '../services/notificationService';

const EAS_PROJECT_ID = 'b10e5217-af10-4e8a-a753-b7b2608af455';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [pendingRouting, setPendingRouting] = useState<any>(null);
  const tokenSyncedForUser = useRef<string | null>(null);

  // 1. Creation des canaux Android (priorite MAX) au montage
  useEffect(() => {
    setupNotificationChannelsAsync().catch((err) => {
      console.warn('[PUSH] Erreur setup canaux Android:', err);
    });
  }, []);

  // 2. Demande des permissions & obtention du token Expo Push
  useEffect(() => {
    if (!user) {
      tokenSyncedForUser.current = null;
      return;
    }

    const userId = String(user._id || user.id || '');
    if (!userId) return;

    if (tokenSyncedForUser.current === userId) return;

    let isMounted = true;

    const initPush = async () => {
      try {
        await setupNotificationChannelsAsync();

        if (!Device.isDevice) {
          console.log('[PUSH] Simulateur detecte — push non disponible.');
          return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('[PUSH] Permission de notification refusee.');
          return;
        }

        if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
          return;
        }

        let token: string | undefined;

        try {
          const tokenResponse = await Notifications.getExpoPushTokenAsync({
            projectId: EAS_PROJECT_ID,
          });
          token = tokenResponse?.data;
          console.log(`[PUSH] Token Expo Push obtenu: ${token?.substring(0, 25)}...`);
        } catch (tokenErr: any) {
          console.warn('[PUSH] Erreur obtention token Expo:', tokenErr.message);
          return;
        }

        if (isMounted && token) {
          try {
            await api.post('/auth/fcm-token', { fcmToken: token });
            tokenSyncedForUser.current = userId;
            console.log(`[PUSH] Token synchronise pour l'utilisateur ${userId}`);
          } catch (apiErr: any) {
            console.warn('[PUSH] Erreur synchronisation token backend:', apiErr.message);
          }
        }
      } catch (err: any) {
        console.error('[PUSH] Erreur generale enregistrement push:', err.message);
      }
    };

    initPush();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 3. Ecouteurs de clics sur notification (Cold Boot & Background)
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
      const data = response?.notification?.request?.content?.data;
      if (data) setPendingRouting(data);
    });

    return () => {
      responseListener.remove();
    };
  }, []);

  // 4. Aiguillage Deep Linking automatique
  useEffect(() => {
    if (!user || !pendingRouting) return;

    const timer = setTimeout(() => {
      const { type, duelId, friendId, friendName, friendAvatar } = pendingRouting;

      switch (type) {
        case 'duel_invite':
          navigate('DuelLobby', { initialTab: 'received' });
          break;
        case 'duel_accepted':
        case 'duel_opponent_ready':
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
          if (friendId) navigate('Chat', { friendId, friendName: friendName || 'Ami', friendAvatar });
          break;
        case 'friend_request':
        case 'friend_accepted':
          navigate('Friends');
          break;
        case 'level_up':
          navigate('Profile');
          break;
        case 'mission_complete':
          navigate('Missions');
          break;
        default:
          break;
      }

      setPendingRouting(null);
    }, 350);

    return () => clearTimeout(timer);
  }, [user, pendingRouting]);
};
