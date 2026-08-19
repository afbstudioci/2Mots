//src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const { themeColors, isDark, toggleTheme } = useTheme();
  const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useSettings();
  const { logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
  };

  const handleLogoutPress = () => {
    setAlertConfig({
      visible: true,
      title: 'SE DÉCONNECTER ?',
      message: 'Voulez-vous vraiment vous déconnecter de votre compte 2Mots ?',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        await logout();
      },
    });
  };

  const SettingRow = ({ icon, title, isSwitch, value, onToggle, onPress, isLast }: any) => (
    <TouchableOpacity
      activeOpacity={isSwitch ? 1 : 0.7}
      onPress={isSwitch ? undefined : onPress}
      style={[
        styles.settingRow,
        {
          borderBottomColor: themeColors.overlayLight,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: themeColors.overlay }]}>
          <Ionicons name={icon} size={22} color={themeColors.primary} />
        </View>
        <Text style={[styles.settingTitle, { color: themeColors.text }]}>{title}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: themeColors.overlayMedium, true: colors.mint }}
          thumbColor={colors.white}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: themeColors.overlay }]}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>PARAMÈTRES</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PRÉFÉRENCES</Text>
        <View
          style={[
            styles.section,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.cardBorder,
              borderWidth: themeColors.cardBorderWidth,
            },
          ]}
        >
          <SettingRow icon="volume-high" title="Effets sonores" isSwitch value={soundEnabled} onToggle={toggleSound} />
          <SettingRow icon="phone-portrait" title="Vibrations (Haptique)" isSwitch value={hapticsEnabled} onToggle={toggleHaptics} />
          <SettingRow icon={isDark ? 'moon' : 'sunny'} title="Mode Sombre" isSwitch value={isDark} onToggle={toggleTheme} isLast />
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>INFORMATIONS</Text>
        <View
          style={[
            styles.section,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.cardBorder,
              borderWidth: themeColors.cardBorderWidth,
            },
          ]}
        >
          <SettingRow icon="document-text" title="Règles du jeu" onPress={() => handleNavigation('Rules')} />
          <SettingRow icon="shield-checkmark" title="Politique de confidentialité" onPress={() => handleNavigation('Privacy')} />
          <SettingRow icon="help-buoy" title="Nous contacter" onPress={() => handleNavigation('Contact')} isLast />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      {alertConfig.visible && (
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttonText="Annuler"
          confirmText="Confirmer"
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onConfirm={alertConfig.onConfirm}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
  headerSpacer: { width: 40 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.bodySmall,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    fontFamily: 'Poppins_700Bold',
  },
  section: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.bodyMedium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  logoutText: {
    color: colors.error,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
});