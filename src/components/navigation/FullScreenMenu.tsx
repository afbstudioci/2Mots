//src/components/navigation/FullScreenMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';

const APP_VERSION = '1.0.0';

export default function FullScreenMenu() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { themeColors, isDark } = useTheme();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateCrossAnim = useRef(new Animated.Value(0)).current;

  const MENU_ITEMS = [
    { id: 'Profile', label: 'Mon Profil', icon: 'person-outline' },
    { id: 'Leaderboard', label: 'Classement', icon: 'trophy-outline' },
    { id: 'Shop', label: 'Boutique', icon: 'cart-outline' },
    { id: 'Rules', label: 'Règles du jeu', icon: 'book-outline' },
    { id: 'Settings', label: 'Paramètres', icon: 'settings-outline' },
  ];

  const itemFadeAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;
  const itemSlideAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(20))).current;

  const toggleMenu = () => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(rotateCrossAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(rotateCrossAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.stagger(
          35,
          MENU_ITEMS.map((_, i) =>
            Animated.parallel([
              Animated.timing(itemFadeAnims[i], { toValue: 1, duration: 200, useNativeDriver: true }),
              Animated.spring(itemSlideAnims[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
            ])
          )
        ),
      ]).start();
    }
  };

  const handleNavigation = (route: string) => {
    setIsOpen(false);
    fadeAnim.setValue(0);
    rotateCrossAnim.setValue(0);
    navigation.navigate(route);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    fadeAnim.setValue(0);
    rotateCrossAnim.setValue(0);
    await logout();
  };

  const rotate1 = rotateCrossAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const rotate2 = rotateCrossAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] });

  return (
    <>
      {!isOpen && (
        <Pressable
          onPress={toggleMenu}
          style={[styles.actionButton, { top: insets.top + spacing.sm, backgroundColor: themeColors.overlay }]}
        >
          <View style={styles.hamburgerContainer}>
            <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text, width: 16 }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
          </View>
        </Pressable>
      )}

      <Modal
        transparent
        visible={isOpen}
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={toggleMenu}
      >
        <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeColors.background, bottom: -150 }]} />

          <Pressable
            onPress={toggleMenu}
            style={[styles.actionButton, { top: insets.top + spacing.sm, backgroundColor: themeColors.overlay }]}
          >
            <Animated.View style={[styles.crossLine, { backgroundColor: themeColors.text, transform: [{ rotate: rotate1 }] }]} />
            <Animated.View style={[styles.crossLine, { backgroundColor: themeColors.text, transform: [{ rotate: rotate2 }] }]} />
          </Pressable>

          <View style={styles.menuContent}>
            {MENU_ITEMS.map((item, index) => (
              <Animated.View
                key={item.id}
                style={[
                  styles.animatedItemContainer,
                  { opacity: itemFadeAnims[index], transform: [{ translateY: itemSlideAnims[index] }] },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.overlayLight,
                      borderWidth: 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                  onPress={() => handleNavigation(item.id)}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: colors.coral + '15' }]}>
                    <Ionicons name={item.icon as any} size={22} color={colors.coral} />
                  </View>
                  <Text style={[styles.menuText, { color: themeColors.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} style={{ marginLeft: 'auto' }} />
                </Pressable>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} style={styles.logoutIcon} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
            </Pressable>

            <View style={styles.versionContainer}>
              <Text style={[styles.brandText, { color: themeColors.text }]}>2Mots</Text>
              <View style={[styles.versionBadge, { backgroundColor: themeColors.overlay }]}>
                <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>v{APP_VERSION}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actionButton: { position: 'absolute', right: spacing.lg, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', zIndex: 100, borderRadius: 25 },
  hamburgerContainer: { alignItems: 'flex-end', width: 24 },
  hamburgerLine: { width: 24, height: 2.5, borderRadius: 2, marginVertical: 3 },
  crossLine: { width: 26, height: 2.5, borderRadius: 2, position: 'absolute' },
  menuContainer: { flex: 1, backgroundColor: 'transparent' },
  menuContent: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: spacing.xl },
  animatedItemContainer: { alignItems: 'center', width: '100%' },
  menuItem: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginVertical: spacing.xs, borderRadius: borderRadius.xl },
  menuIconContainer: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  menuText: { ...typography.buttonPrimary, fontSize: 16, letterSpacing: 0.5 },
  footer: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.xl },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: borderRadius.xl, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: spacing.lg, width: '100%' },
  logoutIcon: { marginRight: spacing.sm },
  logoutText: { ...typography.buttonPrimary, fontSize: 15, letterSpacing: 0.5 },
  versionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandText: { ...typography.buttonPrimary, fontSize: 14, letterSpacing: 1, marginRight: spacing.sm, opacity: 0.7 },
  versionBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  versionText: { ...typography.bodySmall, fontSize: 11, letterSpacing: 1, opacity: 0.6 },
});