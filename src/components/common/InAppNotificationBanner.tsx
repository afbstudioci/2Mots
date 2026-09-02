// src/components/common/InAppNotificationBanner.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useSocketContext } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../navigation/navigationRef';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

export type BannerType =
  | 'invite'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'chat'
  | 'friend_request'
  | 'friend_accepted'
  | 'level_up'
  | 'mission_complete'
  | 'general';

interface BannerData {
  type: BannerType;
  title: string;
  message: string;
  duelId?: string;
  friendId?: string;
  friendName?: string;
  friendAvatar?: string;
  buttonText?: string;
  borderColor: string;
}

export const InAppNotificationBanner: React.FC = () => {
  const { subscribe } = useSocketContext();
  const { themeColors, isDark } = useTheme();
  const [notification, setNotification] = useState<BannerData | null>(null);

  const translateY = useRef(new Animated.Value(-140)).current;
  const hideTimerRef = useRef<any>(null);

  const showBanner = useCallback((data: BannerData, autoDismissMs = 6000) => {
    setNotification(data);
    Animated.spring(translateY, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -140,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setNotification(null));
    }, autoDismissMs);
  }, [translateY]);

  const handleDismiss = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    Animated.timing(translateY, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  }, [translateY]);

  // Conversion et affichage selon le type de notification
  const handleIncomingPayload = useCallback((title: string, body: string, data: any) => {
    const rawType = data?.type || 'general';
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

    const duelId = data?.duelId ? String(data.duelId) : undefined;
    const friendId = data?.friendId ? String(data.friendId) : (data?.senderId ? String(data.senderId) : undefined);
    const friendName = data?.friendName || data?.senderName || 'Ami';
    const friendAvatar = data?.friendAvatar;

    switch (rawType) {
      case 'duel_invite':
      case 'invite':
        showBanner({
          type: 'invite',
          title: title || 'DÉFI EN DUEL 1V1 !',
          message: body || `${data?.challengerName || 'Un joueur'} vous défie !`,
          duelId,
          buttonText: 'VOIR',
          borderColor: colors.coral,
        }, 7000);
        break;

      case 'duel_accepted':
      case 'accepted':
        showBanner({
          type: 'accepted',
          title: title || 'DÉFI ACCEPTÉ !',
          message: body || 'Le duel commence !',
          duelId,
          buttonText: 'JOUER',
          borderColor: colors.mint,
        }, 8000);
        break;

      case 'duel_rejected':
      case 'rejected':
        showBanner({
          type: 'rejected',
          title: title || 'DÉFI REFUSÉ',
          message: body || 'Invitation déclinée.',
          borderColor: colors.error,
        }, 4500);
        break;

      case 'chat_message':
      case 'chat':
        showBanner({
          type: 'chat',
          title: friendName,
          message: body || 'Nouveau message reçu.',
          friendId,
          friendName,
          friendAvatar,
          buttonText: 'RÉPONDRE',
          borderColor: colors.coral,
        }, 6000);
        break;

      case 'friend_request':
        showBanner({
          type: 'friend_request',
          title: title || "NOUVELLE DEMANDE D'AMI",
          message: body || `${friendName} souhaite devenir votre ami !`,
          friendId,
          friendName,
          buttonText: 'VOIR',
          borderColor: colors.coral,
        }, 6500);
        break;

      case 'friend_accepted':
        showBanner({
          type: 'friend_accepted',
          title: title || 'DEMANDE ACCEPTÉE !',
          message: body || `${friendName} et vous êtes maintenant amis !`,
          friendId,
          friendName,
          buttonText: 'VOIR',
          borderColor: colors.mint,
        }, 6500);
        break;

      case 'level_up':
        showBanner({
          type: 'level_up',
          title: title || 'NIVEAU SUPÉRIEUR !',
          message: body || 'Félicitations pour votre progression !',
          buttonText: 'PROFIL',
          borderColor: colors.coral,
        }, 6000);
        break;

      case 'mission_complete':
        showBanner({
          type: 'mission_complete',
          title: title || 'MISSION TERMINÉE !',
          message: body || 'Une récompense est prête à être réclamée !',
          buttonText: 'RÉCLAMER',
          borderColor: colors.mint,
        }, 6500);
        break;

      default:
        showBanner({
          type: 'general',
          title: title || 'NOTIFICATION',
          message: body || 'Nouvelle information.',
          buttonText: 'VOIR',
          borderColor: colors.coral,
        }, 5000);
        break;
    }
  }, [showBanner]);

  useEffect(() => {
    // 1. Événements Socket.io en direct
    const unsubInvite = subscribe('duel_invite_received', (data: any) => {
      handleIncomingPayload('DÉFI EN DUEL 1V1 !', `${data?.challengerName || 'Un joueur'} vous défie (${data?.betAmount || 25} Kevs)`, { ...data, type: 'duel_invite' });
    });

    const unsubResponse = subscribe('duel_invite_response', (data: any) => {
      const opp = data?.opponentName || "L'adversaire";
      if (data?.accept) {
        handleIncomingPayload('DÉFI ACCEPTÉ !', `${opp} a accepté ! Le duel commence !`, { ...data, type: 'duel_accepted' });
      } else {
        handleIncomingPayload('DÉFI REFUSÉ', `${opp} a décliné votre invitation.`, { ...data, type: 'duel_rejected' });
      }
    });

    const unsubCancelled = subscribe('duel_invite_cancelled', () => {
      showBanner({
        type: 'cancelled',
        title: 'DÉFI ANNULÉ',
        message: "L'invitation de duel a été retirée.",
        borderColor: themeColors.border,
      }, 3500);
    });

    const unsubNotif = subscribe('notification_received', (data: any) => {
      handleIncomingPayload(data?.title, data?.body, { ...(data?.data || {}), type: data?.type });
    });

    // 2. Écouteur FCM Foreground expo-notifications
    const pushSub = Notifications.addNotificationReceivedListener((event) => {
      const { title, body, data } = event.request.content;
      handleIncomingPayload(title || '', body || '', data || {});
    });

    return () => {
      unsubInvite();
      unsubResponse();
      unsubCancelled();
      unsubNotif();
      pushSub.remove();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [subscribe, handleIncomingPayload, showBanner, themeColors.border]);

  const handlePress = () => {
    if (!notification) return;
    const { type, duelId, friendId, friendName, friendAvatar } = notification;
    handleDismiss();

    switch (type) {
      case 'accepted':
        if (duelId) navigate('DuelGame', { duelId });
        else navigate('DuelLobby');
        break;
      case 'invite':
      case 'rejected':
        navigate('DuelLobby', { initialTab: 'received' });
        break;
      case 'chat':
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
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.card,
          borderColor: notification.borderColor,
          transform: [{ translateY }],
        },
        shadows.float(isDark),
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: themeColors.overlayLight }]}>
          <Image
            source={require('../../../assets/duelicon.png')}
            style={styles.iconImg}
            onError={() => {}}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: notification.borderColor }]}>{notification.title}</Text>
          <Text style={[styles.message, { color: themeColors.text }]} numberOfLines={1}>
            {notification.message}
          </Text>
        </View>
        <View style={styles.actions}>
          {notification.buttonText ? (
            <View style={[styles.viewBtn, { backgroundColor: notification.borderColor }]}>
              <Text style={styles.viewBtnText}>{notification.buttonText}</Text>
            </View>
          ) : null}
          <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    padding: spacing.sm + 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 2,
    overflow: 'hidden',
  },
  iconImg: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  message: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  closeBtn: {
    padding: 4,
  },
});
