//src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { spacing, borderRadius, typography, colors, shadows } from '../theme/theme';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId, friendAvatar } = route.params;
    const { user } = useAuth();
    const { themeColors } = useTheme();
    const { sendMessage, onMessageReceived } = useSocket();
    const { updateUnreadCount } = useData();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    // Audio Recording
    const recordingRef = useRef<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    
    // Media Preview
    const [pendingAsset, setPendingAsset] = useState<any | null>(null);
    
    const flatListRef = useRef<FlatList>(null);

    // 1. Charger l'historique et marquer comme lu
    useEffect(() => {
        fetchHistory();
        markAsRead();
        
        // Écouter les nouveaux messages
        const off = onMessageReceived((msg) => {
            if (msg.sender._id === friendId || msg.sender === friendId) {
                setMessages(prev => [...prev, msg]);
                markAsRead(); // Marquer comme lu si on est déjà sur le chat
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        });

        return () => {
            if (off) off();
            // Libérer l'audio si on quitte pendant l'enregistrement
            cleanupAudio();
        };
    }, [friendId]);

    const fetchHistory = async () => {
        try {
            const response = await api.get(`/chat/history/${friendId}`);
            setMessages(response.data.data);
        } catch (e) {
            console.log("History error", e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.post(`/chat/read/${friendId}`);
            updateUnreadCount(); // Mettre à jour le badge global
        } catch (e) {
            console.log("Error marking as read", e);
        }
    };

    const cleanupAudio = async () => {
        if (recordingRef.current) {
            try {
                await recordingRef.current.stopAndUnloadAsync();
            } catch (e) {}
            recordingRef.current = null;
        }
    };

    // 2. Envoyer un message texte
    const handleSendText = () => {
        if (!inputText.trim()) return;
        
        const msgData = {
            recipientId: friendId,
            text: inputText.trim(),
            type: 'text'
        };
        
        sendMessage(msgData);
        
        // Optimistic UI update
        const optimisticMsg = {
            _id: Date.now().toString(),
            sender: { _id: user?.id, login: user?.login, avatar: user?.avatar },
            text: inputText.trim(),
            type: 'text',
            status: 'sent',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // 3. Gestion des Médias
    const pickMedia = async (useCamera = false) => {
        const permission = useCamera 
            ? await ImagePicker.requestCameraPermissionsAsync() 
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
            
        if (!permission.granted) return;

        const result = useCamera 
            ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });

        if (!result.canceled) {
            setPendingAsset(result.assets[0]);
        }
    };

    const uploadAndSendMedia = async () => {
        if (!pendingAsset) return;
        const asset = pendingAsset;
        setPendingAsset(null);
        setIsUploading(true);
        
        try {
            const formData = new FormData();
            const type = asset.type === 'video' ? 'video' : 'image';
            
            formData.append('file', {
                uri: asset.uri,
                type: type === 'video' ? 'video/mp4' : 'image/jpeg',
                name: type === 'video' ? 'upload.mp4' : 'upload.jpg'
            } as any);
            formData.append('type', type);

            const response = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileUrl, fileId, duration } = response.data.data;
            
            sendMessage({
                recipientId: friendId,
                type: type,
                fileUrl,
                fileId,
                duration: duration || asset.duration
            });

            setMessages(prev => [...prev, {
                _id: Date.now().toString(),
                sender: { _id: user?.id },
                type,
                fileUrl,
                status: 'sent',
                createdAt: new Date().toISOString()
            }]);
        } catch (e) {
            Alert.alert("Erreur", "Erreur lors de l'envoi du média");
        } finally {
            setIsUploading(false);
        }
    };

    // 4. Gestion de l'Audio
    const startRecording = async () => {
        try {
            // S'assurer qu'aucune session n'est en cours
            await cleanupAudio();

            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recordingRef.current = recording;
            setIsRecording(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert("Microphone", "Impossible de démarrer l'enregistrement.");
        }
    };

    const stopRecording = async () => {
        if (!recordingRef.current) return;
        setIsRecording(false);
        
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            
            if (uri) {
                // Pour l'audio on envoie directement (ou on peut aussi ajouter une preview si besoin)
                const asset = { uri, type: 'audio' };
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', { uri, type: 'audio/m4a', name: 'audio.m4a' } as any);
                formData.append('type', 'audio');
                
                const response = await api.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const { fileUrl, duration } = response.data.data;
                sendMessage({ recipientId: friendId, type: 'audio', fileUrl, duration });
                setMessages(prev => [...prev, { _id: Date.now().toString(), sender: { _id: user?.id }, type: 'audio', fileUrl, duration, status: 'sent', createdAt: new Date().toISOString() }]);
            }
        } catch (e) {
            console.error("Stop recording error", e);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerAvatarContainer}>
                        {friendAvatar ? (
                            <Image source={{ uri: friendAvatar }} style={styles.headerAvatar} />
                        ) : (
                            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: themeColors.surface }]}>
                                <Text style={[styles.headerAvatarText, { color: colors.coral }]}>{friendName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.friendName, { color: themeColors.text }]}>{friendName}</Text>
                        <Text style={[styles.status, { color: colors.mint }]}>en ligne</Text>
                    </View>
                    <TouchableOpacity style={styles.headerAction}>
                        <Ionicons name="ellipsis-vertical" size={22} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Liste des Messages */}
                {isLoadingHistory ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={colors.coral} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id || item.id}
                        contentContainerStyle={styles.messageList}
                        renderItem={({ item }) => (
                            <MessageBubble 
                                item={item} 
                                isMe={item.sender._id === user?.id || item.sender === user?.id} 
                                themeColors={themeColors} 
                                friendAvatar={friendAvatar}
                                friendName={friendName}
                            />
                        )}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                {/* Barre d'Outils et Input */}
                <View style={[styles.inputArea, { backgroundColor: themeColors.background, borderTopColor: themeColors.border }]}>
                    {isUploading && (
                        <View style={styles.uploadProgress}>
                            <ActivityIndicator size="small" color={colors.coral} />
                            <Text style={[styles.uploadText, { color: themeColors.textSecondary }]}>Envoi du média...</Text>
                        </View>
                    )}
                    
                    <View style={styles.inputRow}>
                        <TouchableOpacity onPress={() => pickMedia(false)} style={styles.iconButton}>
                            <Ionicons name="image" size={24} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => pickMedia(true)} style={styles.iconButton}>
                            <Ionicons name="camera" size={24} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                        
                        <View style={[styles.inputWrapper, { backgroundColor: themeColors.card }]}>
                            <TextInput
                                style={[styles.input, { color: themeColors.text }]}
                                placeholder="Message..."
                                placeholderTextColor={themeColors.textSecondary}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                        </View>

                        {inputText.length > 0 ? (
                            <TouchableOpacity onPress={handleSendText} style={[styles.sendButton, { backgroundColor: colors.coral }]}>
                                <Ionicons name="send" size={18} color={colors.white} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                onPressIn={startRecording} 
                                onPressOut={stopRecording}
                                style={[styles.micButton, { backgroundColor: isRecording ? colors.coral : themeColors.card }]}
                            >
                                <Ionicons name="mic" size={24} color={isRecording ? colors.white : themeColors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Modal de Prévisualisation Média */}
                <Modal visible={!!pendingAsset} transparent animationType="fade">
                    <View style={styles.previewOverlay}>
                        <View style={[styles.previewContainer, { backgroundColor: themeColors.card }]}>
                            <Image source={{ uri: pendingAsset?.uri }} style={styles.previewImage} resizeMode="contain" />
                            <View style={styles.previewActions}>
                                <TouchableOpacity onPress={() => setPendingAsset(null)} style={styles.previewCancel}>
                                    <Text style={styles.previewCancelText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={uploadAndSendMedia} style={styles.previewSend}>
                                    <Ionicons name="send" size={20} color="#FFF" />
                                    <Text style={styles.previewSendText}>Envoyer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const MessageBubble = ({ item, isMe, themeColors, friendAvatar, friendName }: any) => {
    return (
        <View style={[
            styles.bubbleContainer,
            isMe ? styles.myBubbleContainer : styles.friendBubbleContainer
        ]}>
            {!isMe && (
                <View style={styles.bubbleAvatarContainer}>
                    {friendAvatar ? (
                        <Image source={{ uri: friendAvatar }} style={styles.bubbleAvatar} />
                    ) : (
                        <View style={[styles.bubbleAvatarPlaceholder, { backgroundColor: themeColors.surface }]}>
                            <Text style={styles.bubbleAvatarText}>{friendName.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                </View>
            )}
            <View style={[
                styles.bubble,
                { backgroundColor: isMe ? colors.coral : themeColors.card },
                isMe ? styles.myBubble : styles.friendBubble
            ]}>
                {item.type === 'image' ? (
                    <Image source={{ uri: item.fileUrl }} style={styles.bubbleImage} resizeMode="cover" />
                ) : item.type === 'video' ? (
                    <View style={styles.videoPlaceholder}>
                        <Ionicons name="play-circle" size={48} color={colors.white} />
                    </View>
                ) : item.type === 'audio' ? (
                    <View style={styles.audioRow}>
                        <Ionicons name="play" size={20} color={isMe ? colors.white : colors.coral} />
                        <View style={[styles.audioWave, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }]} />
                        <Text style={[styles.audioDuration, { color: isMe ? colors.white : themeColors.textSecondary }]}>
                            {Math.floor(item.duration || 0)}s
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.messageText, { color: isMe ? colors.white : themeColors.text }]}>
                        {item.text}
                    </Text>
                )}
                <View style={styles.bubbleFooter}>
                    <Text style={[
                        styles.timestamp,
                        { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && (
                        <Ionicons 
                            name={item.read || item.status === 'read' ? "checkmark-done" : "checkmark"} 
                            size={14} 
                            color={item.read || item.status === 'read' ? "#34D399" : "rgba(255,255,255,0.7)"} 
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 0.5 },
    backButton: { padding: spacing.xs },
    headerAvatarContainer: { marginLeft: spacing.sm },
    headerAvatar: { width: 36, height: 36, borderRadius: 18 },
    headerAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    headerAvatarText: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
    headerInfo: { flex: 1, marginLeft: spacing.md },
    friendName: { ...typography.bodyMedium, fontWeight: 'bold' },
    status: { ...typography.bodySmall, fontSize: 11 },
    headerAction: { padding: spacing.xs },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageList: { padding: spacing.lg, paddingBottom: spacing.xxl },
    bubbleContainer: { marginBottom: spacing.md, width: '100%', flexDirection: 'row', alignItems: 'flex-end' },
    myBubbleContainer: { justifyContent: 'flex-end' },
    friendBubbleContainer: { justifyContent: 'flex-start' },
    bubbleAvatarContainer: { marginRight: 8, marginBottom: 4 },
    bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
    bubbleAvatarPlaceholder: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    bubbleAvatarText: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: colors.coral },
    bubble: { maxWidth: '75%', padding: spacing.md, borderRadius: 20 },
    myBubble: { borderBottomRightRadius: 4 },
    friendBubble: { borderBottomLeftRadius: 4 },
    bubbleImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 4 },
    videoPlaceholder: { width: 200, height: 120, backgroundColor: '#000', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    audioRow: { flexDirection: 'row', alignItems: 'center', width: 150 },
    audioWave: { flex: 1, height: 2, marginHorizontal: 8, borderRadius: 1 },
    audioDuration: { fontSize: 10, fontWeight: 'bold' },
    messageText: { ...typography.bodySmall, fontSize: 15, lineHeight: 20 },
    bubbleFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    timestamp: { ...typography.bodySmall, fontSize: 9 },
    inputArea: { padding: spacing.md, borderTopWidth: 0.5 },
    uploadProgress: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
    uploadText: { fontSize: 11, marginLeft: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 8 },
    inputWrapper: { flex: 1, borderRadius: 25, paddingHorizontal: spacing.md, paddingVertical: 8, marginHorizontal: 4 },
    input: { flex: 1, maxHeight: 100, ...typography.bodySmall, fontSize: 14, paddingVertical: 4 },
    sendButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
    micButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
    // Preview Styles
    previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    previewContainer: { width: '100%', borderRadius: 20, overflow: 'hidden', padding: spacing.md },
    previewImage: { width: '100%', height: 400, borderRadius: 12 },
    previewActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
    previewCancel: { padding: spacing.md, flex: 1, alignItems: 'center' },
    previewCancelText: { color: colors.white, fontFamily: 'Poppins_600SemiBold' },
    previewSend: { backgroundColor: colors.coral, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 30, flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    previewSendText: { color: '#FFF', fontFamily: 'Poppins_700Bold', marginLeft: 8 }
});
