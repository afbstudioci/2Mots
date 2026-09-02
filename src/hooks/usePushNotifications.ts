// src/hooks/usePushNotifications.ts
// GESTION FCM - Enregistrement, Synchronisation et Aiguillage Deep Link
// Architecture : getDevicePushTokenAsync uniquement — pas de token Expo

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../navigation/navigationRef';
import api from '../services/api';
import { setupNotificationChannelsAsync } from '../services/notificationService';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [pendingRouting, setPendingRouting] = useState<any>(null);
  const tokenSyncedForUser = useRef<string | null>(null);

  // 1. Creation des canaux Android (MAX priority) au montage, une seule fois
  useEffect(() => {
    setupNotificationChannelsAsync().catch((err) => {
      console.warn('[PUSH] Erreur setup canaux Android:', err);
    });
  }, []);

  // 2. Demande permissions & enregistrement du token FCM natif quand user connecte
  useEffect(() => {
    if (!user) {
      tokenSyncedForUser.current = null;
      return;
    }

    // Evite de re-synchroniser si on est deja synced pour ce user
    if (tokenSyncedForUser.current === String(user._id)) return;

    let isMounted = true;

    const initPush = async () => {
      try {
        // Les canaux doivent etre crees AVANT toute reception de notif
        await setupNotificationChannelsAsync();

        if (!Device.isDevice) {
          console.warn('[PUSH] Simulateur detecte — les push FCM ne fonctionnent pas sur simulateur.');
          return;
        }

        // Demande de permissions (Android 13+ et iOS)
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('[PUSH] Permission de notification refusee par l\'utilisateur.');
          return;
        }

        // CRITIQUE : getDevicePushTokenAsync = vrai token FCM natif Google
        // Ne JAMAIS utiliser getExpoPushTokenAsync ici, car notre backend
        // utilise Firebase Admin SDK directement et ne comprend que les tokens FCM natifs.
        if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
          console.warn('[PUSH] Plateforme non supportee pour les push:', Platform.OS);
          return;
        }

        let token: string | undefined;

        try {
          const tokenData = await Notifications.getDevicePushTokenAsync();
          token = typeof tokenData?.data === 'string' ? tokenData.data : undefined;

          if (!token) {
            console.error('[PUSH] getDevicePushTokenAsync a retourne un token vide ou invalide.');
            return;
          }

          // Verification de securite : le token FCM natif ne commence jamais par ExponentPushToken
          if (token.startsWith('ExponentPushToken') || token.startsWith('ExpoPushToken')) {
            console.error('[PUSH] ERREUR : token au format Expo recu alors qu\'on attend un token FCM natif.');
            console.error('[PUSH] Verifiez que google-services.json est correctement configure.');
            return;
          }

          console.log(`[PUSH] Token FCM natif obtenu (${token.substring(0, 20)}...)`);
        } catch (tokenErr: any) {
          console.error('[PUSH] Impossible d\'obtenir le token FCM natif:', tokenErr.message);
          console.error('[PUSH] Verifiez que google-services.json est present et que google_app_id est correct.');
          return;
        }

        if (isMounted && token) {
          try {
            await api.post('/auth/fcm-token', { fcmToken: token });
            tokenSyncedForUser.current = String(user._id);
            console.log(`[PUSH] Token FCM synchronise avec le backend pour l'utilisateur ${user._id}`);
          } catch (apiErr: any) {
            console.warn('[PUSH] Erreur synchronisation token avec le backend:', apiErr.message);
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
      const data = response.notification.request.content.data;
      if (data) setPendingRouting(data);
    });

    return () => {
      responseListener.remove();
    };
  }, []);

  // 4. Aiguillage Deep Linking instantane
  useEffect(() => {
    if (!user || !pendingRouting) return;

    const timer = setTimeout(() => {
      const { type, duelId, friendId, friendName, friendAvatar } = pendingRouting;

      switch (type) {
        case 'duel_invite':
          navigate('DuelLobby', { initialTab: 'received' });
          break;
        case 'duel_accepted':
          navigate(duelId ? 'DuelGame' : 'DuelLobby', duelId ? { duelId } : undefined);
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
