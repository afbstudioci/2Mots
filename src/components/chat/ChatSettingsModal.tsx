import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface ChatSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    friendName: string;
    onBlock: () => void;
    onMute: (value: boolean) => void;
    isMuted: boolean;
    onClearHistory: () => void;
    onThemeChange: (themeId: string) => void;
}

export default function ChatSettingsModal({
    visible,
    onClose,
    friendName,
    onBlock,
    onMute,
    isMuted,
    onClearHistory,
    onThemeChange
}: ChatSettingsModalProps) {
    const { themeColors, isDark } = useTheme();

    const themes = [
        { id: 'default', color: colors.nightBlue, name: 'Défaut' },
        { id: 'sunset', color: '#FF7E5F', name: 'Coucher de soleil' },
        { id: 'forest', color: '#134E5E', name: 'Forêt' },
        { id: 'ocean', color: '#00D2FF', name: 'Océan' },
        { id: 'luxury', color: '#333333', name: 'Luxe' },
    ];

    const OptionItem = ({ icon, label, onPress, color = themeColors.text, showSwitch = false, value = false, onToggle = () => {} }: any) => (
        <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.optionLabel, { color: themeColors.text }]}>{label}</Text>
            {showSwitch ? (
                <Switch 
                    value={value} 
                    onValueChange={onToggle} 
                    trackColor={{ false: '#767577', true: colors.coral }}
                    thumbColor="#f4f3f4"
                />
            ) : (
                <Ionicons name="chevron-forward" size={18} color={themeColors.overlayMedium} />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.dismiss} onPress={onClose} />
                <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
                    <View style={[styles.handle, { backgroundColor: themeColors.overlayLight }]} />
                    
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: themeColors.text }]}>Paramètres du chat</Text>
                        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>avec {friendName}</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PRÉFÉRENCES</Text>
                            <OptionItem 
                                icon="notifications-off-outline" 
                                label="Mettre en sourdine" 
                                showSwitch 
                                value={isMuted}
                                onToggle={onMute}
                            />
                            <OptionItem 
                                icon="images-outline" 
                                label="Médias partagés" 
                                onPress={() => {}}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PERSONNALISATION</Text>
                            <Text style={[styles.label, { color: themeColors.text }]}>Arrière-plan</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
                                {themes.map(t => (
                                    <TouchableOpacity 
                                        key={t.id} 
                                        style={styles.themeCircle} 
                                        onPress={() => onThemeChange(t.id)}
                                    >
                                        <View style={[styles.themeColor, { backgroundColor: t.color }]} />
                                        <Text style={[styles.themeName, { color: themeColors.textSecondary }]}>{t.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.error }]}>ZONE DE DANGER</Text>
                            <OptionItem 
                                icon="trash-outline" 
                                label="Effacer l'historique" 
                                color={colors.error}
                                onPress={onClearHistory}
                            />
                            <OptionItem 
                                icon="ban-outline" 
                                label="Bloquer l'utilisateur" 
                                color={colors.error}
                                onPress={onBlock}
                            />
                        </View>

                        {/* 5 Actions Supplémentaires au choix */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>AUTRES ACTIONS</Text>
                            <OptionItem icon="star-outline" label="Ajouter aux favoris" onPress={() => {}} />
                            <OptionItem icon="search-outline" label="Rechercher dans la discussion" onPress={() => {}} />
                            <OptionItem icon="time-outline" label="Messages temporaires" onPress={() => {}} />
                            <OptionItem icon="lock-closed-outline" label="Chiffrer la discussion" onPress={() => {}} />
                            <OptionItem icon="share-social-outline" label="Partager le contact" onPress={() => {}} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    dismiss: { flex: 1 },
    container: {
        height: '85%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: spacing.lg,
        overflow: 'hidden',
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        opacity: 0.7,
    },
    scroll: {
        paddingBottom: 40,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionLabel: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins_500Medium',
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: spacing.sm,
    },
    themeScroll: {
        flexDirection: 'row',
        marginTop: spacing.sm,
    },
    themeCircle: {
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    themeColor: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFF',
        ...shadows.soft(false),
    },
    themeName: {
        fontSize: 10,
        fontFamily: 'Poppins_400Regular',
        marginTop: 6,
    }
});
