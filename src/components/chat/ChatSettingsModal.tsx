//src/components/chat/ChatSettingsModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, colors, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface ChatSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  friendName: string;
  isMuted: boolean;
  onMute: (val: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isBlocked: boolean;
  onToggleBlock: () => void;
  onSearch: () => void;
  onThemeChange: (themeId: string) => void;
}

export default function ChatSettingsModal({
  visible,
  onClose,
  friendName,
  isMuted,
  onMute,
  isFavorite,
  onToggleFavorite,
  isBlocked,
  onToggleBlock,
  onSearch,
  onThemeChange,
}: ChatSettingsModalProps) {
  const { themeColors, isDark } = useTheme();

  const themes = [
    { id: 'default', color: isDark ? colors.nightBlue : '#FFFFFF', name: 'Défaut' },
    { id: 'sunset', color: '#FF7E5F', name: 'Coucher de soleil' },
    { id: 'forest', color: '#134E5E', name: 'Forêt' },
    { id: 'ocean', color: '#00D2FF', name: 'Océan' },
  ];

  const OptionItem = ({
    icon,
    label,
    onPress,
    color = themeColors.text,
    showSwitch = false,
    value = false,
    onToggle = () => {},
  }: any) => (
    <TouchableOpacity
      style={styles.option}
      onPress={showSwitch ? () => onToggle(!value) : onPress}
      activeOpacity={0.7}
    >
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
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              avec {friendName}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* PRÉFÉRENCES */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
                PRÉFÉRENCES
              </Text>
              <OptionItem
                icon="notifications-off-outline"
                label="Mettre en sourdine"
                showSwitch
                value={isMuted}
                onToggle={onMute}
              />
              <OptionItem
                icon={isFavorite ? 'star' : 'star-outline'}
                label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                color={isFavorite ? colors.coral : themeColors.text}
                onPress={onToggleFavorite}
              />
              <OptionItem
                icon="search-outline"
                label="Rechercher dans la discussion"
                onPress={() => {
                  onClose();
                  onSearch();
                }}
              />
            </View>

            {/* PERSONNALISATION */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
                PERSONNALISATION
              </Text>
              <Text style={[styles.label, { color: themeColors.text }]}>Arrière-plan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
                {themes.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.themeCircle}
                    onPress={() => onThemeChange(t.id)}
                  >
                    <View style={[styles.themeColor, { backgroundColor: t.color }]} />
                    <Text style={[styles.themeName, { color: themeColors.textSecondary }]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* SÉCURITÉ */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.error }]}>GESTION DU CONTACT</Text>
              <OptionItem
                icon="ban-outline"
                label={isBlocked ? "Débloquer l'utilisateur" : "Bloquer l'utilisateur"}
                color={colors.error}
                onPress={onToggleBlock}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  dismiss: { flex: 1 },
  container: {
    maxHeight: '80%',
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
    marginBottom: spacing.lg,
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
    paddingBottom: 30,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing.xs,
  },
  themeScroll: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  themeCircle: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  themeColor: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#FFF',
    ...shadows.soft(false),
  },
  themeName: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
});