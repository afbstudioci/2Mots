//src/screens/ChatScreen.tsx
import React, { useState } from 'react';
import { 
    StyleSheet, KeyboardAvoidingView, Platform, 
    Alert, Modal, View, TouchableOpacity, Text, 
    Keyboard, Dimensions 
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
import { useChat } from '../hooks/useChat';
import { useAudioRecording } from '../hooks/useAudioRecording';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId, friendAvatar } = route.params;
    const { themeColors, isDark } = useTheme();
    const { user } = useAuth();
    const { messages, isLoading, isTyping, send, edit, remove, react, handleTyping } = useChat(friendId);
    const { isRecording, recordingTime, start, stop } = useAudioRecording();

    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

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
            console.error('[MEDIA] Upload error:', e);
            Alert.alert("Erreur", "Impossible d'envoyer le média.");
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
        if (uri) handleSendMedia(uri, 'audio');
    };

    const handleLongPress = (item: any) => {
        setSelectedMessage(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Keyboard.dismiss();
    };

    return (
        <ScreenWrapper style={{ flex: 1 }}>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <LinearGradient 
                    colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#F1F5F9']} 
                    style={StyleSheet.absoluteFillObject} 
                />

                <ChatHeader 
                    friendName={friendName} 
                    friendAvatar={friendAvatar} 
                    onBack={() => navigation.goBack()}
                    onSettings={() => {}}
                />

                <MessageList 
                    messages={messages}
                    isLoading={isLoading}
                    friendName={friendName}
                    isTyping={isTyping}
                    onLongPress={handleLongPress}
                    onImagePress={setFullScreenImage}
                />

                <View style={[styles.inputWrapper, { borderTopColor: themeColors.overlayLight }]}>
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

                {/* Context Menu Modal with Blur-like effect */}
                <Modal visible={!!selectedMessage} transparent animationType="fade">
                    <TouchableOpacity 
                        style={styles.modalOverlay} 
                        activeOpacity={1} 
                        onPress={() => setSelectedMessage(null)}
                    >
                        <View style={[styles.menuContainer, { backgroundColor: themeColors.surface }, shadows.float(isDark)]}>
                            <View style={styles.menuHeader}>
                                <Text style={[styles.menuTitle, { color: themeColors.text }]}>Actions</Text>
                            </View>
                            
                            <View style={styles.reactionRow}>
                                {['❤️', '😂', '😮', '😢', '🔥', '👍'].map(emoji => (
                                    <TouchableOpacity 
                                        key={emoji} 
                                        style={styles.reactionBtn}
                                        onPress={() => { react(selectedMessage._id, emoji); setSelectedMessage(null); }}
                                    >
                                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.menuItem} onPress={() => { setSelectedMessage(null); }}>
                                <Ionicons name="arrow-undo-outline" size={20} color={themeColors.text} />
                                <Text style={[styles.menuText, { color: themeColors.text }]}>Répondre</Text>
                            </TouchableOpacity>

                            {selectedMessage?.sender?._id === user?.id && !selectedMessage.isDeleted && (
                                <TouchableOpacity style={styles.menuItem} onPress={() => { setIsEditing(true); setSelectedMessage(null); }}>
                                    <Ionicons name="create-outline" size={20} color={themeColors.text} />
                                    <Text style={[styles.menuText, { color: themeColors.text }]}>Modifier</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.menuItem} onPress={() => { remove(selectedMessage._id); setSelectedMessage(null); }}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                                <Text style={[styles.menuText, { color: colors.error }]}>Supprimer pour tous</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        width: width * 0.85,
        borderRadius: 24,
        padding: spacing.md,
    },
    menuHeader: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    menuTitle: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
        opacity: 0.5,
    },
    reactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    reactionBtn: {
        padding: 8,
    },
    reactionEmoji: {
        fontSize: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: spacing.md,
        borderRadius: 12,
    },
    menuText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        marginLeft: 12,
    },
    inputWrapper: {
        borderTopWidth: 1,
    }
});
