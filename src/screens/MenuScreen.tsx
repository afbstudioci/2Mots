//src/screens/MenuScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme/theme';
import { RootStackParamList } from '../../App';
import packageJson from '../../package.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Menu'>;

const APP_VERSION = packageJson.version || '1.0.5';

const MENU_ITEMS = [
  { id: 'Profile', label: 'Mon Profil', icon: 'person-outline' },
  { id: 'Leaderboard', label: 'Classement', icon: 'trophy-outline' },
  { id: 'Rules', label: 'Règles du jeu', icon: 'book-outline' },
  { id: 'Settings', label: 'Paramètres', icon: 'settings-outline' },
];

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { themeColors } = useTheme();
  const { logout } = useAuth();

  const itemFadeAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;
  const itemSlideAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(25))).current;

  useEffect(() => {
    const animations = MENU_ITEMS.map((_, index) => {
      return Animated.parallel([
        Animated.timing(itemFadeAnims[index], { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(itemSlideAnims[index], { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(40, animations).start();
  }, []);

  const handleNavigation = (route: any) => {
    navigation.navigate(route);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Pressable
        onPress={handleClose}
        style={[styles.closeButton, { top: insets.top + spacing.sm, backgroundColor: themeColors.overlay }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={26} color={themeColors.text} />
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
                  borderColor: themeColors.cardBorder,
                  borderWidth: themeColors.cardBorderWidth,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              onPress={() => handleNavigation(item.id)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: themeColors.overlayLight }]}>
                <Ionicons name={item.icon as any} size={24} color={themeColors.primary} />
              </View>
              <Text style={[styles.menuText, { color: themeColors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} style={{ marginLeft: 'auto' }} />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} style={styles.logoutIcon} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
        </Pressable>

        <View style={styles.versionContainer}>
          <Text style={[styles.brandText, { color: themeColors.text }]}>2Mots</Text>
          <View style={[styles.versionBadge, { backgroundColor: themeColors.overlay }]}>
            <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>
              v{APP_VERSION}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  animatedItemContainer: {
    alignItems: 'center',
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 3,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    ...typography.buttonPrimary,
    fontSize: 17,
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: spacing.lg,
    width: '100%',
  },
  logoutIcon: {
    marginRight: spacing.sm,
  },
  logoutText: {
    ...typography.buttonPrimary,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    ...typography.buttonPrimary,
    fontSize: 14,
    letterSpacing: 1,
    marginRight: spacing.sm,
    opacity: 0.7,
  },
  versionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  versionText: {
    ...typography.bodySmall,
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.6,
  },
});