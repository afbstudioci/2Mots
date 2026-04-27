//src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { spacing, borderRadius, typography, colors } from '../theme/theme';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId } = route.params;
    const { user } = useAuth();
    const { themeColors } = useTheme();
    const { sendMessage, onMessageReceived } = useSocket();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    // Audio Recording
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    
    const flatListRef = useRef<FlatList>(null);

    // 1. Charger l'historique au montage
    useEffect(() => {
        fetchHistory();
        
        // Écouter les nouveaux messages
        onMessageReceived((msg) => {
            if (msg.sender._id === friendId || msg.sender === friendId) {
                setMessages(prev => [...prev, msg]);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        });
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
            id: Date.now().toString(),
            sender: { _id: user?.id, login: user?.login, avatar: user?.avatar },
            text: inputText.trim(),
            type: 'text',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // 3. Gestion des Médias (Images/Vidéos)
    const pickMedia = async (useCamera = false) => {
        const permission = useCamera 
            ? await ImagePicker.requestCameraPermissionsAsync() 
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
            
        if (!permission.granted) return;

        const result = useCamera 
            ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });

        if (!result.canceled) {
            uploadAndSendMedia(result.assets[0]);
        }
    };

    const uploadAndSendMedia = async (asset: any) => {
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

            // Update local
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: { _id: user?.id },
                type,
                fileUrl,
                createdAt: new Date().toISOString()
            }]);
        } catch (e) {
            Alert.alert("Erreur", "Erreur lors de l'envoi du média");
        } finally {
            setIsUploading(false);
        }
    };

    // 4. Gestion de l'Audio (Vocal)
    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        
        if (uri) {
            uploadAndSendMedia({ uri, type: 'audio' });
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
                    <View style={styles.headerInfo}>
                        <Text style={[styles.friendName, { color: themeColors.text }]}>{friendName}</Text>
                        <Text style={[styles.status, { color: colors.mint }]}>en ligne</Text>
                    </View>
                    <TouchableOpacity style={styles.headerAction}>
                        <Ionicons name="flash" size={22} color={colors.coral} />
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
                        keyExtractor={(item) => item.id || item._id}
                        contentContainerStyle={styles.messageList}
                        renderItem={({ item }) => (
                            <MessageBubble item={item} isMe={item.sender._id === user?.id || item.sender === user?.id} themeColors={themeColors} />
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
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const MessageBubble = ({ item, isMe, themeColors }: any) => {
    return (
        <View style={[
            styles.bubbleContainer,
            isMe ? styles.myBubbleContainer : styles.friendBubbleContainer
        ]}>
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
                <Text style={[
                    styles.timestamp,
                    { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }
                ]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 0.5 },
    backButton: { padding: spacing.xs },
    headerInfo: { flex: 1, marginLeft: spacing.md },
    friendName: { ...typography.bodyMedium, fontWeight: 'bold' },
    status: { ...typography.bodySmall, fontSize: 11 },
    headerAction: { padding: spacing.xs },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageList: { padding: spacing.lg, paddingBottom: spacing.xxl },
    bubbleContainer: { marginBottom: spacing.md, width: '100%', flexDirection: 'row' },
    myBubbleContainer: { justifyContent: 'flex-end' },
    friendBubbleContainer: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '75%', padding: spacing.md, borderRadius: 20 },
    myBubble: { borderBottomRightRadius: 4 },
    friendBubble: { borderBottomLeftRadius: 4 },
    bubbleImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 4 },
    videoPlaceholder: { width: 200, height: 120, backgroundColor: '#000', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    audioRow: { flexDirection: 'row', alignItems: 'center', width: 150 },
    audioWave: { flex: 1, height: 2, marginHorizontal: 8, borderRadius: 1 },
    audioDuration: { fontSize: 10, fontWeight: 'bold' },
    messageText: { ...typography.bodySmall, fontSize: 15, lineHeight: 20 },
    timestamp: { ...typography.bodySmall, fontSize: 9, alignSelf: 'flex-end', marginTop: 4 },
    inputArea: { padding: spacing.md, borderTopWidth: 0.5 },
    uploadProgress: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
    uploadText: { fontSize: 11, marginLeft: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 8 },
    inputWrapper: { flex: 1, borderRadius: 25, paddingHorizontal: spacing.md, paddingVertical: 8, marginHorizontal: 4 },
    input: { flex: 1, maxHeight: 100, ...typography.bodySmall, fontSize: 14, paddingVertical: 4 },
    sendButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
    micButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
});
