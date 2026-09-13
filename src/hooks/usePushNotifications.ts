// src/hooks/usePushNotifications.ts
// GESTION DES NOTIFICATIONS PUSH EXPO (ANDROID HAUTE PRIORITE)
// Enregistrement, Synchronisation et Aiguillage Deep Link
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../navigation/navigationRef';
import api from '../services/api';
import {
  setupNotificationChannelsAsync,
  registerForPushNotificationsAsync,
} from '../services/notificationService';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [pendingRouting, setPendingRouting] = useState<any>(null);
  const tokenSyncedForUser = useRef<string | null>(null);

  // 1. Creation des canaux Android au montage
  useEffect(() => {
    setupNotificationChannelsAsync().catch((err) => {
      console.warn('[PUSH] Erreur setup canaux Android:', err);
    });
  }, []);

  // 2. Synchronisation du token des qu'un utilisateur est actif
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
        const token = await registerForPushNotificationsAsync();
        if (isMounted && token) {
          try {
            await api.post('/notifications/push-token', {
              token,
              platform: 'android',
            }).catch(() => api.post('/auth/fcm-token', { fcmToken: token }));

            tokenSyncedForUser.current = userId;
            console.log(`[PUSH] Token synchronise pour ${userId}`);
          } catch (apiErr: any) {
            console.warn('[PUSH] Erreur API token:', apiErr?.message);
          }
        }
      } catch (err: any) {
        console.error('[PUSH] Erreur enregistrement push:', err?.message);
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
