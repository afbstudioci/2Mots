// src/components/home/HomeHeader.tsx
// EN-TETE DE L'ECRAN D'ACCUEIL (AVATAR, PSEUDO, BOUTON MENU)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { colors, spacing, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface HomeHeaderProps {
  user: any;
  insetsTop: number;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  insetsTop,
  fadeAnim,
  slideAnim,
  onOpenMenu,
  onOpenProfile,
}) => {
  const { themeColors } = useTheme();

  return (
    <>
      <Pressable
        onPress={onOpenMenu}
        style={[styles.hamburgerButton, { top: insetsTop + spacing.xs }]}
      >
        <View style={styles.hamburgerContainer}>
          <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text, width: 16 }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
        </View>
      </Pressable>

      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.greetingText, { color: themeColors.textSecondary }]}>BONJOUR</Text>
        <View style={styles.userRow}>
          <Pressable onPress={onOpenProfile} style={styles.avatarPressable}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: themeColors.card, borderColor: colors.coral },
              ]}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarPlaceholder, { color: colors.coral }]}>
                  {(user?.login || 'U')[0].toUpperCase()}
                </Text>
              )}
            </View>
          </Pressable>
          <Text style={[styles.userNameText, { color: themeColors.text }]}>{user?.login}</Text>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 24,
  },
  hamburgerContainer: { alignItems: 'flex-end', width: 24 },
  hamburgerLine: { width: 24, height: 2.5, borderRadius: 2, marginVertical: 3 },
  header: { marginTop: spacing.xl, width: '100%' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  avatarPressable: { marginRight: spacing.sm },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.soft(false),
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  greetingText: { fontFamily: 'Poppins_500Medium', fontSize: 15, letterSpacing: 1 },
  userNameText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 28, letterSpacing: 0.5, flexShrink: 1 },
});
