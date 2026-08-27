//src/components/common/InAppNotificationBanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSocketContext } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../navigation/navigationRef';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

export const InAppNotificationBanner: React.FC = () => {
  const { subscribe } = useSocketContext();
  const { themeColors, isDark } = useTheme();
  const [notification, setNotification] = useState<{
    duelId: string;
    challengerName: string;
    betAmount: number;
  } | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const hideTimerRef = useRef<any>(null);

  useEffect(() => {
    const unsub = subscribe('duel_invite_received', (data: any) => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setNotification({
        duelId: data.duelId,
        challengerName: data.challengerName || 'Un joueur',
        betAmount: data.betAmount || 25,
      });

      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(handleDismiss, 6000);
    });

    return () => {
      unsub();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [subscribe]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  };

  const handlePress = () => {
    handleDismiss();
    navigate('DuelLobby');
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.card,
          borderColor: colors.coral,
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
          <Text style={[styles.title, { color: colors.coral }]}>DÉFI EN DUEL 1V1 !</Text>
          <Text style={[styles.message, { color: themeColors.text }]} numberOfLines={1}>
            <Text style={{ fontFamily: 'Poppins_700Bold' }}>{notification.challengerName}</Text> vous défie ({notification.betAmount} Kevs)
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={[styles.viewBtn, { backgroundColor: colors.coral }]}>
            <Text style={styles.viewBtnText}>VOIR</Text>
          </View>
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
    fontFamily: 'Poppins_400Regular',
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
