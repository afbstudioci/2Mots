//src/screens/ChatScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, KeyboardAvoidingView, Platform,
    Modal, View, TouchableOpacity, Text,
    Keyboard, Dimensions, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { colors, spacing, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ChatSettingsModal from '../components/chat/ChatSettingsModal';
import CustomAlert from '../components/common/CustomAlert';
import { useChat } from '../hooks/useChat';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useChatSounds } from '../hooks/useChatSounds';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Utilisation stricte de codes Unicode pour éviter les emojis visuels dans le code source
const REACTIONS_UNICODE = [
    '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE2E',
    '\uD83D\uDE22', '\uD83D\uDD25', '\uD83D\uDC4D'
];

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId, friendAvatar } = route.params;
    const { themeColors, isDark } = useTheme();
    const { user } = useAuth();
    const { messages, isLoading, isTyping, send, edit, remove, react, handleTyping } = useChat(friendId);
    const { isRecording, recordingTime, start, stop } = useAudioRecording();
    const { playSound } = useChatSounds();

    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [activeTheme, setActiveTheme] = useState('default');

    // Configuration de l'alerte personnalisée
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: () => { } });

    useEffect(() => {
        if (messages.length > 0) {
            const last = messages[0];
            const currentUserId = user?._id || user?.id;
            if (last.sender?._id?.toString() !== currentUserId?.toString()) {
                // playSound('receive');
            }
        }
    }, [messages.length]);

    const handleSendMedia = async (uri: string, type: 'image' | 'video' | 'audio') => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'upload';
            const ext = filename.split('.').pop() || (type === 'audio' ? 'm4a' : 'jpg');

            formData.append('file', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: type === 'audio' ? `audio/${ext}` : (type === 'video' ? 'video/mp4' : 'image/jpeg'),
                name: `upload.${ext}`
            } as any);
            formData.append('type', type);

            const response = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileUrl, duration } = response.data.data;
            send('', type, { fileUrl, duration });
        } catch (e) {
            console.error('[MEDIA] Erreur upload:', e);
            setAlertConfig({
                visible: true,
                title: "Erreur d'envoi",
                message: "Impossible d'envoyer le média sécurisé. Veuillez réessayer.",
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
        }
    };

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            quality: 0.7,
            allowsEditing: true
        });
        if (!result.canceled) {
            handleSendMedia(result.assets[0].uri, result.assets[0].type === 'video' ? 'video' : 'image');
        }
    };

    const handleStopRecording = async (cancel = false) => {
        const uri = await stop(cancel);
        if (uri && !cancel) handleSendMedia(uri, 'audio');
    };

    const handleLongPress = (item: any) => {
        setSelectedMessage(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Keyboard.dismiss();
    };

    const handleEditStart = () => {
        setEditValue(selectedMessage.text);
        setIsEditing(true);
        // On garde selectedMessage pour handleEditSave
    };

    const handleEditSave = () => {
        if (selectedMessage && editValue.trim() && editValue !== selectedMessage.text) {
            edit(selectedMessage._id, editValue);
        }
        setIsEditing(false);
        setEditValue('');
        setSelectedMessage(null);
    };

    const confirmDelete = () => {
        const msgId = selectedMessage._id;
        setAlertConfig({
            visible: true,
            title: "Suppression définitive",
            message: "Voulez-vous vraiment supprimer ce message pour les deux interlocuteurs ?",
            onConfirm: () => {
                remove(msgId);
                setAlertConfig(prev => ({ ...prev, visible: false }));
            }
        });
        setSelectedMessage(null);
    };

    const getThemeColors = () => {
        switch (activeTheme) {
            case 'sunset': return ['#FF7E5F', '#FEB47B'];
            case 'forest': return ['#134E5E', '#71B280'];
            case 'ocean': return ['#00C6FF', '#0072FF'];
            case 'luxury': return ['#1A1A1A', '#434343'];
            default: return isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#F1F5F9'];
        }
    };

    return (
        <ScreenWrapper style={{ flex: 1 }}>
            <LinearGradient colors={getThemeColors() as [string, string, ...string[]]} style={StyleSheet.absoluteFillObject} />

            <ChatHeader
                friendName={friendName}
                friendAvatar={friendAvatar}
                onBack={() => navigation.goBack()}
                onSettings={() => setShowSettings(true)}
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 50}
            >
                <MessageList
                    messages={messages}
                    isLoading={false}
                    friendName={friendName}
                    isTyping={isTyping}
                    onLongPress={handleLongPress}
                    onImagePress={() => { }}
                />

                <View style={[styles.inputWrapper, { borderTopColor: themeColors.overlayLight, backgroundColor: themeColors.surface }]}>
                    <ChatInput
                        onSend={(t) => send(t)}
                        onMediaPress={pickMedia}
                        onStartRecording={start}
                        onStopRecording={handleStopRecording}
                        isRecording={isRecording}
                        recordingTime={recordingTime}
                        onTyping={handleTyping}
                    />
                </View>

                {/* MODAL ACTIONS LONG-PRESS */}
                <Modal visible={!!selectedMessage} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedMessage(null)}>
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                        <View style={[styles.menuContainer, { backgroundColor: themeColors.surface }]}>
                            <View style={styles.reactionRow}>
                                {REACTIONS_UNICODE.map(emoji => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={styles.reactionBtn}
                                        onPress={() => { react(selectedMessage._id, emoji); setSelectedMessage(null); }}
                                    >
                                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.menuItem} onPress={() => setSelectedMessage(null)}>
                                <Ionicons name="arrow-undo-outline" size={20} color={themeColors.text} />
                                <Text style={[styles.menuText, { color: themeColors.text }]}>Répondre</Text>
                            </TouchableOpacity>

                            {(selectedMessage?.sender?._id || selectedMessage?.sender)?.toString() === (user?._id || user?.id)?.toString() && !selectedMessage?.isDeletedForEveryone && (
                                <TouchableOpacity style={styles.menuItem} onPress={handleEditStart}>
                                    <Ionicons name="create-outline" size={20} color={themeColors.text} />
                                    <Text style={[styles.menuText, { color: themeColors.text }]}>Modifier</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                                <Text style={[styles.menuText, { color: colors.error }]}>Supprimer pour tous</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* MODAL EDITION */}
                <Modal visible={isEditing} transparent animationType="fade">
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
                        style={{ flex: 1 }}
                    >
                        <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
                            <View style={[styles.editBox, { backgroundColor: themeColors.surface }]}>
                                <Text style={[styles.editTitle, { color: themeColors.text }]}>Modification</Text>
                                <TextInput
                                    style={[styles.editInput, { color: themeColors.text, backgroundColor: themeColors.card }]}
                                    value={editValue}
                                    onChangeText={setEditValue}
                                    multiline
                                    autoFocus
                                />
                                <View style={styles.editActions}>
                                    <TouchableOpacity onPress={() => setIsEditing(false)}>
                                        <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>Annuler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleEditSave} style={[styles.saveBtn, { backgroundColor: colors.coral }]}>
                                        <Text style={styles.saveBtnText}>Sauvegarder</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                <ChatSettingsModal
                    visible={showSettings}
                    onClose={() => setShowSettings(false)}
                    friendName={friendName}
                    isMuted={isMuted}
                    onMute={setIsMuted}
                    onBlock={() => { }}
                    onClearHistory={() => { }}
                    onThemeChange={setActiveTheme}
                />
            </KeyboardAvoidingView>

            {alertConfig.visible && (
                <CustomAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                    onConfirm={alertConfig.onConfirm}
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    menuContainer: { width: width * 0.85, borderRadius: 28, padding: spacing.md, ...shadows.medium(true) },
    reactionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
    reactionBtn: { padding: 8 },
    reactionEmoji: { fontSize: 28 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md },
    menuText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', marginLeft: 12 },
    inputWrapper: { borderTopWidth: 1 },
    editOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    editBox: { width: '100%', borderRadius: 24, padding: spacing.lg, ...shadows.medium(true) },
    editTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', marginBottom: spacing.md, textAlign: 'center' },
    editInput: { borderRadius: 16, padding: spacing.md, fontSize: 16, fontFamily: 'Poppins_400Regular', minHeight: 110, textAlignVertical: 'top' },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: spacing.lg },
    cancelText: { fontFamily: 'Poppins_600SemiBold', marginRight: spacing.xl },
    saveBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: 20 },
    saveBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold' }
});