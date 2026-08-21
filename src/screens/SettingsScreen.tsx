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
import { spacing, borderRadius, typography, colors, shadows } from '../theme/theme';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const { themeColors, isDark, toggleTheme } = useTheme();
  const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useSettings();
  const { logout, deleteAccount } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
    confirmText?: string;
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
      buttonText: 'Annuler',
      confirmText: 'Déconnexion',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        await logout();
      },
    });
  };

  const handleDeleteAccountPress = () => {
    setAlertConfig({
      visible: true,
      title: 'ZONE DE DANGER',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement votre compte 2Mots ? Cette action est irréversible et effacera tous vos scores, pièces et données.',
      type: 'error',
      buttonText: 'Annuler',
      confirmText: 'Oui, Supprimer',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        await deleteAccount();
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
            shadows.soft(isDark),
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
            shadows.soft(isDark),
          ]}
        >
          <SettingRow icon="document-text" title="Règles du jeu" onPress={() => handleNavigation('Rules')} />
          <SettingRow icon="shield-checkmark" title="Politique de confidentialité" onPress={() => handleNavigation('Privacy')} />
          <SettingRow icon="help-buoy" title="Nous contacter" onPress={() => handleNavigation('Contact')} isLast />
        </View>

        {/* BOUTON DÉCONNEXION */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.logoutBtn]}
          onPress={handleLogoutPress}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.coral} style={{ marginRight: 8 }} />
          <Text style={[styles.btnText, { color: colors.coral }]}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* ZONE DE DANGER : SUPPRIMER MON COMPTE (Modèle Yély) */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDeleteAccountPress}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={[styles.btnText, { color: colors.error }]}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        confirmText={alertConfig.confirmText}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onConfirm={alertConfig.onConfirm}
      />
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 90, 95, 0.08)',
    borderColor: 'rgba(255, 90, 95, 0.2)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: spacing.xxl,
  },
  btnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14.5,
  },
});