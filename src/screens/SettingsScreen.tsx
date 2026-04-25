//src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { spacing, borderRadius, typography, colors } from '../theme/theme';

export default function SettingsScreen() {
    const { themeColors, isDark } = useTheme();
    const navigation = useNavigation();
    
    // Etats fictifs pour le mockup
    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [hapticsEnabled, setHapticsEnabled] = React.useState(true);

    const SettingRow = ({ icon, title, isSwitch, value, onToggle }: any) => (
        <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={24} color={themeColors.primary} style={styles.settingIcon} />
                <Text style={[styles.settingTitle, { color: themeColors.text }]}>{title}</Text>
            </View>
            {isSwitch ? (
                <Switch 
                    value={value} 
                    onValueChange={onToggle}
                    trackColor={{ false: themeColors.surface, true: colors.mint }}
                    thumbColor={colors.white}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
            )}
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>PARAMÈTRES</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.section, { backgroundColor: themeColors.card }]}>
                    <SettingRow 
                        icon="volume-high" 
                        title="Effets sonores" 
                        isSwitch 
                        value={soundEnabled} 
                        onToggle={setSoundEnabled} 
                    />
                    <SettingRow 
                        icon="phone-portrait" 
                        title="Vibrations (Haptique)" 
                        isSwitch 
                        value={hapticsEnabled} 
                        onToggle={setHapticsEnabled} 
                    />
                    <SettingRow 
                        icon={isDark ? "moon" : "sunny"} 
                        title="Mode Sombre" 
                        isSwitch 
                        value={isDark} 
                        onToggle={() => {}} // A relier a ton ThemeContext plus tard
                    />
                </View>

                <View style={[styles.section, { backgroundColor: themeColors.card }]}>
                    <TouchableOpacity activeOpacity={0.7}>
                        <SettingRow icon="document-text" title="Règles du jeu" />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7}>
                        <SettingRow icon="shield-checkmark" title="Politique de confidentialité" />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7}>
                        <SettingRow icon="help-buoy" title="Nous contacter" />
                    </TouchableOpacity>
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
    backButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    headerSpacer: { width: 32 },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
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
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: spacing.md,
    },
    settingTitle: {
        ...typography.bodyMedium,
    },
});