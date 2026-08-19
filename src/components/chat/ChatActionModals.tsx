//src/components/chat/ChatActionModals.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, shadows } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface ChatActionModalsProps {
  selectedMessage: any;
  onCloseMessageModal: () => void;
  isMyMsg: boolean;
  onEditStart: () => void;
  onRemoveForMe: () => void;
  onRemoveForEveryone: () => void;
  isEditing: boolean;
  editValue: string;
  onChangeEditValue: (text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export default function ChatActionModals({
  selectedMessage,
  onCloseMessageModal,
  isMyMsg,
  onEditStart,
  onRemoveForMe,
  onRemoveForEveryone,
  isEditing,
  editValue,
  onChangeEditValue,
  onCancelEdit,
  onSaveEdit,
}: ChatActionModalsProps) {
  const { themeColors } = useTheme();

  return (
    <>
      <Modal visible={!!selectedMessage} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onCloseMessageModal}>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
          <View style={[styles.menuContainer, { backgroundColor: themeColors.surface }]}>
            {isMyMsg && !selectedMessage?.isDeletedForEveryone && (
              <TouchableOpacity style={styles.menuItem} onPress={onEditStart}>
                <Ionicons name="create-outline" size={20} color={themeColors.text} />
                <Text style={[styles.menuText, { color: themeColors.text }]}>Modifier</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={onRemoveForMe}>
              <Ionicons name="trash-outline" size={20} color={themeColors.text} />
              <Text style={[styles.menuText, { color: themeColors.text }]}>Supprimer pour moi</Text>
            </TouchableOpacity>

            {isMyMsg && !selectedMessage?.isDeletedForEveryone && (
              <TouchableOpacity style={styles.menuItem} onPress={onRemoveForEveryone}>
                <Ionicons name="trash" size={20} color={colors.error} />
                <Text style={[styles.menuText, { color: colors.error }]}>Supprimer pour tous</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isEditing} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
            <View style={[styles.editBox, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.editTitle, { color: themeColors.text }]}>Modifier le message</Text>
              <TextInput
                style={[styles.editInput, { color: themeColors.text, backgroundColor: themeColors.card }]}
                value={editValue}
                onChangeText={onChangeEditValue}
                multiline
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={onCancelEdit}>
                  <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSaveEdit} style={[styles.saveBtn, { backgroundColor: colors.coral }]}>
                  <Text style={styles.saveBtnText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: width * 0.85, borderRadius: 24, padding: spacing.md, ...shadows.medium(true) },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.md },
  menuText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', marginLeft: 12 },
  editOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  editBox: { width: '100%', borderRadius: 24, padding: spacing.lg, ...shadows.medium(true) },
  editTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', marginBottom: spacing.md, textAlign: 'center' },
  editInput: { borderRadius: 16, padding: spacing.md, fontSize: 15, fontFamily: 'Poppins_400Regular', minHeight: 100, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: spacing.md },
  cancelText: { fontFamily: 'Poppins_600SemiBold', marginRight: spacing.xl },
  saveBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: 20 },
  saveBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold' },
});