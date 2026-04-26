//src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
    const { themeColors, isDark, toggleTheme } = useTheme();
    const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useSettings();
    const navigation = useNavigation<NavigationProp>();

    const handleNavigation = (route: keyof RootStackParamList) => {
        navigation.navigate(route as any);
    };

    const SettingRow = ({ icon, title, isSwitch, value, onToggle, onPress, isLast }: any) => (
        <TouchableOpacity 
            activeOpacity={isSwitch ? 1 : 0.7} 
            onPress={isSwitch ? undefined : onPress}
            style={[
                styles.settingRow, 
                { 
                    borderBottomColor: themeColors.overlayLight,
                    borderBottomWidth: isLast ? 0 : 1
                }
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: themeColors.overlay }]}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>PARAMÈTRES</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PRÉFÉRENCES</Text>
                <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                    <SettingRow 
                        icon="volume-high" 
                        title="Effets sonores" 
                        isSwitch 
                        value={soundEnabled} 
                        onToggle={toggleSound} 
                    />
                    <SettingRow 
                        icon="phone-portrait" 
                        title="Vibrations (Haptique)" 
                        isSwitch 
                        value={hapticsEnabled} 
                        onToggle={toggleHaptics} 
                    />
                    <SettingRow 
                        icon={isDark ? "moon" : "sunny"} 
                        title="Mode Sombre" 
                        isSwitch 
                        value={isDark} 
                        onToggle={toggleTheme} 
                        isLast
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>INFORMATIONS</Text>
                <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
                    <SettingRow 
                        icon="document-text" 
                        title="Règles du jeu" 
                        onPress={() => handleNavigation('Rules')} 
                    />
                    <SettingRow 
                        icon="shield-checkmark" 
                        title="Politique de confidentialité" 
                        onPress={() => handleNavigation('Privacy')} 
                    />
                    <SettingRow 
                        icon="help-buoy" 
                        title="Nous contacter" 
                        onPress={() => handleNavigation('Contact')} 
                        isLast
                    />
                </View>
            </ScrollView>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
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
});