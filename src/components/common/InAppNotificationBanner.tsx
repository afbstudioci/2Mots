// src/components/common/InAppNotificationBanner.tsx
// BANNIERE DE NOTIFICATION IN-APP - AFFICHAGE FOREGROUND HAUTE PRIORITE
// CSCSM Level: Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useSocketContext } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../navigation/navigationRef';
import { spacing, borderRadius, shadows } from '../../theme/theme';
import { BannerData, buildBannerData } from './bannerUtils';

export const InAppNotificationBanner: React.FC = () => {
  const { subscribe } = useSocketContext();
  const { themeColors, isDark } = useTheme();
  const [notification, setNotification] = useState<BannerData | null>(null);

  const translateY = useRef(new Animated.Value(-140)).current;
  const hideTimerRef = useRef<any>(null);

  const showBanner = useCallback((data: BannerData) => {
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
    }, data.autoDismissMs || 6000);
  }, [translateY]);

  const handleDismiss = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    Animated.timing(translateY, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  }, [translateY]);

  const handleIncomingPayload = useCallback((title: string, body: string, data: any) => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    const banner = buildBannerData(title, body, data);
    showBanner(banner);
  }, [showBanner]);

  useEffect(() => {
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
        autoDismissMs: 3500,
      });
    });

    const unsubNotif = subscribe('notification_received', (data: any) => {
      handleIncomingPayload(data?.title, data?.body, { ...(data?.data || {}), type: data?.type });
    });

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
    zIndex: 99999,
    elevation: 2000,
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
