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
import { colors, spacing } from '../theme/theme';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { useChat } from '../hooks/useChat';
import { useAudioRecording } from '../hooks/useAudioRecording';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId, friendAvatar } = route.params;
    const { themeColors, isDark } = useTheme();
    const { messages, isLoading, isTyping, send, edit, remove, react, handleTyping } = useChat(friendId);
    const { isRecording, recordingTime, start, stop } = useAudioRecording();

    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    const handleSendMedia = async (uri: string, type: 'image' | 'video' | 'audio') => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                type: type === 'audio' ? 'audio/m4a' : (type === 'video' ? 'video/mp4' : 'image/jpeg'),
                name: `upload.${type === 'audio' ? 'm4a' : (type === 'video' ? 'mp4' : 'jpg')}`
            } as any);
            formData.append('type', type);

            const response = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileUrl, duration } = response.data.data;
            send('', type, { fileUrl, duration });
        } catch (e) {
            Alert.alert("Erreur", "Impossible d'envoyer le média.");
        }
    };

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });
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
        Keyboard.dismiss();
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

                <ChatInput 
                    onSend={(t) => send(t)}
                    onMediaPress={pickMedia}
                    onStartRecording={start}
                    onStopRecording={handleStopRecording}
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    onTyping={handleTyping}
                />

                {/* Context Menu Modal */}
                <Modal visible={!!selectedMessage} transparent animationType="fade">
                    <TouchableOpacity 
                        style={styles.modalOverlay} 
                        activeOpacity={1} 
                        onPress={() => setSelectedMessage(null)}
                    >
                        <View style={[styles.menuContainer, { backgroundColor: themeColors.surface }]}>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { react(selectedMessage._id, '❤️'); setSelectedMessage(null); }}>
                                <Text style={styles.menuText}>Réagir ❤️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setSelectedMessage(null); }}>
                                <Text style={styles.menuText}>Répondre</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { remove(selectedMessage._id); setSelectedMessage(null); }}>
                                <Text style={[styles.menuText, { color: colors.error }]}>Supprimer</Text>
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
        width: width * 0.7,
        borderRadius: 20,
        padding: spacing.md,
        overflow: 'hidden',
    },
    menuItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    menuText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center',
    },
});
