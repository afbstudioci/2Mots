//src/screens/ChatScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ChatSettingsModal from '../components/chat/ChatSettingsModal';
import ChatActionModals from '../components/chat/ChatActionModals';
import CustomAlert from '../components/common/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { colors, spacing } from '../theme/theme';

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { friendId, friendName, friendAvatar } = route.params;

  const { themeColors, isDark } = useTheme();
  const { user } = useAuth();
  const { messages, isTyping, send, edit, remove, removeForMe, handleTyping } = useChat(friendId);
  const { isRecording, recordingTime, start, stop } = useAudioRecording();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [chatTheme, setChatTheme] = useState('default');

  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  useEffect(() => {
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

  const handleToggleBlock = () => {
    setShowSettings(false);
    const willBlock = !isBlocked;
    setTimeout(() => {
      setAlertConfig({
        visible: true,
        title: willBlock ? 'Bloquer cet utilisateur ?' : 'Débloquer cet utilisateur ?',
        message: willBlock ? `${friendName} ne pourra plus vous écrire.` : `Vous pourrez de nouveau échanger avec ${friendName}.`,
        buttonText: 'Annuler',
        confirmText: 'Confirmer',
        onConfirm: async () => {
          setIsBlocked(willBlock);
          await AsyncStorage.setItem(`@twomots_blocked_${friendId}`, JSON.stringify(willBlock));
          setAlertConfig((prev) => ({ ...prev, visible: false }));
        },
      });
    }, 150);
  };

  const handleStopRecording = async (cancel = false) => {
    const uri = await stop(cancel);
    if (uri && !cancel && !isBlocked) send('', 'audio', { mediaUrl: uri });
  };

  const THEMES_MAP: Record<string, { bg: string; bar: string }> = {
    default: { bg: themeColors.background, bar: themeColors.surface },
    sunset: { bg: isDark ? '#2D1B22' : '#FFF0EB', bar: isDark ? '#3A242C' : '#FFE4DC' },
    forest: { bg: isDark ? '#112224' : '#EBF5F0', bar: isDark ? '#172E31' : '#DDEEE6' },
    ocean: { bg: isDark ? '#0F2438' : '#EBF4FF', bar: isDark ? '#14314A' : '#DCEBFE' },
  };

  const currentTheme = THEMES_MAP[chatTheme] || { bg: themeColors.background, bar: themeColors.surface };
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : messages;

  const isMyMsg = (selectedMessage?.sender?._id || selectedMessage?.sender)?.toString() === (user?._id || user?.id)?.toString();

  return (
    <ScreenWrapper style={{ backgroundColor: currentTheme.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatHeader
          friendName={friendName}
          friendAvatar={friendAvatar}
          onBack={() => navigation.goBack()}
          onSettings={() => setShowSettings(true)}
        />

        {isSearching && (
          <View style={[styles.searchBar, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="search-outline" size={18} color={themeColors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="Rechercher..."
              placeholderTextColor={themeColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
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
            onLongPress={(msg) => !isBlocked && setSelectedMessage(msg)}
            onImagePress={() => {}}
          />
        </View>

        {isBlocked ? (
          <View style={[styles.blockedContainer, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="ban-outline" size={18} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={[styles.blockedText, { color: themeColors.textSecondary }]}>
              Utilisateur bloqué.
            </Text>
            <TouchableOpacity onPress={handleToggleBlock} style={styles.unblockLink}>
              <Text style={{ color: colors.coral, fontFamily: 'Poppins_700Bold', fontSize: 13 }}>Débloquer</Text>
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

        <ChatActionModals
          selectedMessage={selectedMessage}
          onCloseMessageModal={() => setSelectedMessage(null)}
          isMyMsg={isMyMsg}
          onEditStart={() => { setEditValue(selectedMessage?.text || ''); setIsEditing(true); setSelectedMessage(null); }}
          onRemoveForMe={() => { if (selectedMessage) removeForMe(selectedMessage._id); setSelectedMessage(null); }}
          onRemoveForEveryone={() => { if (selectedMessage) remove(selectedMessage._id); setSelectedMessage(null); }}
          isEditing={isEditing}
          editValue={editValue}
          onChangeEditValue={setEditValue}
          onCancelEdit={() => setIsEditing(false)}
          onSaveEdit={() => { if (editValue.trim() && selectedMessage) { edit(selectedMessage._id, editValue.trim()); setIsEditing(false); setSelectedMessage(null); } }}
        />

        <ChatSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          friendName={friendName}
          isMuted={isMuted}
          onMute={(val) => { setIsMuted(val); AsyncStorage.setItem(`@twomots_muted_${friendId}`, JSON.stringify(val)); }}
          isFavorite={isFavorite}
          onToggleFavorite={async () => {
            const next = !isFavorite;
            setIsFavorite(next);
            await AsyncStorage.setItem(`@twomots_favorite_${friendId}`, JSON.stringify(next));
          }}
          isBlocked={isBlocked}
          onToggleBlock={handleToggleBlock}
          onSearch={() => setIsSearching(true)}
          onThemeChange={(themeId) => { setChatTheme(themeId); AsyncStorage.setItem(`@twomots_theme_${friendId}`, themeId); }}
        />
      </KeyboardAvoidingView>

      {alertConfig.visible && (
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
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 8, marginHorizontal: spacing.md, marginTop: spacing.xs, borderRadius: 20 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: 'Poppins_500Medium', fontSize: 14, paddingVertical: 4 },
  blockedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.md, marginBottom: spacing.lg, padding: spacing.md, borderRadius: 24 },
  blockedText: { fontSize: 13, fontFamily: 'Poppins_500Medium' },
  unblockLink: { marginLeft: 10 },
});