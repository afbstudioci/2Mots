//src/components/common/InAppNotificationBanner.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../navigation/navigationRef';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

interface BannerData {
  type: 'invite' | 'accepted' | 'rejected' | 'cancelled';
  title: string;
  message: string;
  duelId?: string;
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
    hideTimerRef.current = setTimeout(handleDismiss, autoDismissMs);
  }, [translateY]);

  const handleDismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  }, [translateY]);

  useEffect(() => {
    const unsubInvite = subscribe('duel_invite_received', (data: any) => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      showBanner({
        type: 'invite',
        title: 'DÉFI EN DUEL 1V1 !',
        message: `${data?.challengerName || 'Un joueur'} vous défie (${data?.betAmount || 25} Kevs)`,
        duelId: data?.duelId,
        buttonText: 'VOIR',
        borderColor: colors.coral,
      }, 7000);
    });

    const unsubResponse = subscribe('duel_invite_response', (data: any) => {
      if (data?.accept) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        showBanner({
          type: 'accepted',
          title: 'DÉFI ACCEPTÉ !',
          message: `${data?.opponentName || 'L\'adversaire'} a accepté ! Le duel commence !`,
          duelId: data?.duelId,
          buttonText: 'JOUER',
          borderColor: colors.mint,
        }, 8000);
      } else {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
        showBanner({
          type: 'rejected',
          title: 'DÉFI REFUSÉ',
          message: `${data?.opponentName || 'L\'adversaire'} a décliné votre invitation.`,
          borderColor: colors.error,
        }, 4000);
      }
    });

    const unsubCancelled = subscribe('duel_invite_cancelled', () => {
      showBanner({
        type: 'cancelled',
        title: 'DÉFI ANNULÉ',
        message: 'L\'invitation de duel a été retirée.',
        borderColor: themeColors.border,
      }, 3500);
    });

    const unsubNotif = subscribe('notification_received', (data: any) => {
      const notifType = data?.type;
      const notifData = data?.data || {};
      const notifDuelId = notifData.duelId || notifData.id;

      if (notifType === 'duel_invite') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        showBanner({
          type: 'invite',
          title: data.title || 'DÉFI EN DUEL 1V1 !',
          message: data.body || 'Un joueur vous défie en duel !',
          duelId: notifDuelId,
          buttonText: 'VOIR',
          borderColor: colors.coral,
        }, 7000);
      } else if (notifType === 'duel_accepted') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        showBanner({
          type: 'accepted',
          title: data.title || 'DÉFI ACCEPTÉ !',
          message: data.body || 'Le duel commence !',
          duelId: notifDuelId,
          buttonText: 'JOUER',
          borderColor: colors.mint,
        }, 8000);
      }
    });

    return () => {
      unsubInvite();
      unsubResponse();
      unsubCancelled();
      unsubNotif();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [subscribe, showBanner, themeColors.border]);

  const handlePress = () => {
    const currentDuelId = notification?.duelId;
    const currentType = notification?.type;
    handleDismiss();

    if (currentType === 'accepted' && currentDuelId) {
      navigate('DuelGame', { duelId: currentDuelId });
    } else if (currentType === 'invite') {
      navigate('DuelLobby', { initialTab: 'received' });
    } else {
      navigate('DuelLobby');
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
