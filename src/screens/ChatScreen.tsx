//src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ChatSettingsModal from '../components/chat/ChatSettingsModal';
import CustomAlert from '../components/common/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { colors, spacing, shadows } from '../theme/theme';
import api from '../services/api';

const { width } = Dimensions.get('window');
const REACTIONS_UNICODE = ['❤️', '😂', '🔥', '👏', '😮', '😢'];

const THEMES_MAP: Record<string, { bg: string; bar: string }> = {
  default: { bg: '#1A202C', bar: '#222B38' },
  sunset: { bg: '#2D1B22', bar: '#3A242C' },
  forest: { bg: '#112224', bar: '#172E31' },
  ocean: { bg: '#0F2438', bar: '#14314A' },
};

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { friendId, friendName, friendAvatar } = route.params;

  const { themeColors, isDark } = useTheme();
  const { user } = useAuth();
  const {
    messages,
    isTyping,
    send,
    edit,
    remove,
    react,
    handleTyping,
  } = useChat(friendId);

  const { isRecording, recordingTime, start, stop } = useAudioRecording();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [chatTheme, setChatTheme] = useState('default');

  // Nouveaux états fonctionnels
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    // Charger les préférences locales du chat
    const loadPreferences = async () => {
      try {
        const [mutedRaw, favRaw, blockRaw, themeRaw] = await Promise.all([
          AsyncStorage.getItem(`@twomots_muted_${friendId}`),
          AsyncStorage.getItem(`@twomots_favorite_${friendId}`),
          AsyncStorage.getItem(`@twomots_blocked_${friendId}`),
          AsyncStorage.getItem(`@twomots_theme_${friendId}`),
        ]);
        if (mutedRaw) setIsMuted(JSON.parse(mutedRaw));
        if (favRaw) setIsFavorite(JSON.parse(favRaw));
        if (blockRaw) setIsBlocked(JSON.parse(blockRaw));
        if (themeRaw) setChatTheme(themeRaw);
      } catch {}
    };
    loadPreferences();
  }, [friendId]);

  const handleToggleMute = async (val: boolean) => {
    setIsMuted(val);
    await AsyncStorage.setItem(`@twomots_muted_${friendId}`, JSON.stringify(val));
  };

  const handleToggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    await AsyncStorage.setItem(`@twomots_favorite_${friendId}`, JSON.stringify(next));

    // Mettre à jour la liste globale des favoris pour MessagesScreen
    try {
      const rawFavs = await AsyncStorage.getItem('@twomots_favorite_chats');
      let list: string[] = rawFavs ? JSON.parse(rawFavs) : [];
      if (next && !list.includes(friendId)) list.push(friendId);
      else if (!next) list = list.filter((id) => id !== friendId);
      await AsyncStorage.setItem('@twomots_favorite_chats', JSON.stringify(list));
    } catch {}
  };

  const handleToggleBlock = () => {
    const willBlock = !isBlocked;
    setAlertConfig({
      visible: true,
      title: willBlock ? "Bloquer l'utilisateur ?" : "Débloquer l'utilisateur ?",
      message: willBlock
        ? `${friendName} ne pourra plus vous envoyer de messages.`
        : `Vous pourrez de nouveau échanger avec ${friendName}.`,
      onConfirm: async () => {
        setIsBlocked(willBlock);
        await AsyncStorage.setItem(`@twomots_blocked_${friendId}`, JSON.stringify(willBlock));
        setShowSettings(false);
      },
    });
  };

  const handleClearHistory = () => {
    setAlertConfig({
      visible: true,
      title: "Effacer l'historique ?",
      message: 'Tous les messages échangés seront définitivement supprimés.',
      onConfirm: async () => {
        try {
          await api.delete(`/chat/history/${friendId}`);
        } catch {}
        setShowSettings(false);
        navigation.goBack();
      },
    });
  };

  const handleThemeChange = async (themeId: string) => {
    setChatTheme(themeId);
    await AsyncStorage.setItem(`@twomots_theme_${friendId}`, themeId);
  };

  const handleStopRecording = async (cancel = false) => {
    const uri = await stop(cancel);
    if (uri && !cancel && !isBlocked) {
      send('', 'audio', { mediaUrl: uri });
    }
  };

  const handleLongPress = (msg: any) => {
    if (isBlocked) return;
    setSelectedMessage(msg);
  };

  const handleEditStart = () => {
    setEditValue(selectedMessage?.text || '');
    setIsEditing(true);
    setSelectedMessage(null);
  };

  const handleEditSave = () => {
    if (editValue.trim() && selectedMessage) {
      edit(selectedMessage._id, editValue.trim());
      setIsEditing(false);
      setSelectedMessage(null);
    }
  };

  const confirmDelete = () => {
    if (selectedMessage) {
      remove(selectedMessage._id);
      setSelectedMessage(null);
    }
  };

  const currentTheme = THEMES_MAP[chatTheme] || {
    bg: themeColors.background,
    bar: themeColors.surface,
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.text?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : messages;

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: currentTheme.bg }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatHeader
          friendName={friendName}
          friendAvatar={friendAvatar}
          onBack={() => navigation.goBack()}
          onSettings={() => setShowSettings(true)}
        />

        {/* Barre de recherche dans le chat */}
        {isSearching && (
          <View style={[styles.searchBar, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="search-outline" size={18} color={themeColors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="Rechercher dans la discussion..."
              placeholderTextColor={themeColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
            >
              <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <MessageList
            messages={filteredMessages}
            isLoading={false}
            friendName={friendName}
            isTyping={isTyping}
            onLongPress={handleLongPress}
            onImagePress={() => {}}
          />
        </View>

        {/* Message Utilisateur Bloqué OU Barre de saisie flottante */}
        {isBlocked ? (
          <View style={[styles.blockedContainer, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="ban-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={[styles.blockedText, { color: themeColors.textSecondary }]}>
              Vous avez bloqué cet utilisateur.
            </Text>
            <TouchableOpacity onPress={handleToggleBlock} style={styles.unblockLink}>
              <Text style={{ color: colors.coral, fontFamily: 'Poppins_700Bold', fontSize: 13 }}>
                Débloquer
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ChatInput
            onSend={(t) => send(t)}
            onStartRecording={start}
            onStopRecording={handleStopRecording}
            isRecording={isRecording}
            recordingTime={recordingTime}
            onTyping={handleTyping}
            customBackgroundColor={currentTheme.bar}
          />
        )}

        {/* Modal Réactions / Actions sur un message */}
        <Modal visible={!!selectedMessage} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedMessage(null)}
          >
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
            <View style={[styles.menuContainer, { backgroundColor: themeColors.surface }]}>
              <View style={styles.reactionRow}>
                {REACTIONS_UNICODE.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.reactionBtn}
                    onPress={() => {
                      react(selectedMessage._id, emoji);
                      setSelectedMessage(null);
                    }}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(selectedMessage?.sender?._id || selectedMessage?.sender)?.toString() ===
                (user?._id || user?.id)?.toString() &&
                !selectedMessage?.isDeletedForEveryone && (
                  <TouchableOpacity style={styles.menuItem} onPress={handleEditStart}>
                    <Ionicons name="create-outline" size={20} color={themeColors.text} />
                    <Text style={[styles.menuText, { color: themeColors.text }]}>Modifier</Text>
                  </TouchableOpacity>
                )}

              <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.menuText, { color: colors.error }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Édition de message */}
        <Modal visible={isEditing} transparent animationType="fade">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
              <View style={[styles.editBox, { backgroundColor: themeColors.surface }]}>
                <Text style={[styles.editTitle, { color: themeColors.text }]}>Modifier le message</Text>
                <TextInput
                  style={[
                    styles.editInput,
                    { color: themeColors.text, backgroundColor: themeColors.card },
                  ]}
                  value={editValue}
                  onChangeText={setEditValue}
                  multiline
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => setIsEditing(false)}>
                    <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEditSave}
                    style={[styles.saveBtn, { backgroundColor: colors.coral }]}
                  >
                    <Text style={styles.saveBtnText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Modal Paramètres du Chat */}
        <ChatSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          friendName={friendName}
          isMuted={isMuted}
          onMute={handleToggleMute}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          isBlocked={isBlocked}
          onToggleBlock={handleToggleBlock}
          onClearHistory={handleClearHistory}
          onSearch={() => setIsSearching(true)}
          onThemeChange={handleThemeChange}
        />
      </KeyboardAvoidingView>

      {alertConfig.visible && (
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onConfirm={alertConfig.onConfirm}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    paddingVertical: 4,
  },
  blockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 24,
  },
  blockedText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  unblockLink: {
    marginLeft: 10,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuContainer: {
    width: width * 0.85,
    borderRadius: 28,
    padding: spacing.md,
    ...shadows.medium(true),
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  reactionBtn: { padding: 6 },
  reactionEmoji: { fontSize: 26 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  menuText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', marginLeft: 12 },
  editOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  editBox: { width: '100%', borderRadius: 24, padding: spacing.lg, ...shadows.medium(true) },
  editTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  editInput: {
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelText: { fontFamily: 'Poppins_600SemiBold', marginRight: spacing.xl },
  saveBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: 20 },
  saveBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold' },
});