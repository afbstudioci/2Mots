//src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
    KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, 
    Modal, Animated, PanResponder, Keyboard
} from 'react-native';
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
import AudioBubble from '../components/chat/AudioBubble';

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId, friendAvatar } = route.params;
    const { user } = useAuth();
    const { themeColors, isDarkMode } = useTheme();
    const { sendMessage, onMessageReceived } = useSocket();
    const { updateUnreadCount } = useData();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    // Audio Recording States
    const recordingRef = useRef<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<any>(null);
    const [isCancelRequested, setIsCancelRequested] = useState(false);
    
    // Media Preview
    const [pendingAsset, setPendingAsset] = useState<any | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    
    const [showMenu, setShowMenu] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!friendId) {
            Alert.alert("Erreur", "Ami non trouvé");
            navigation.goBack();
            return;
        }
        fetchHistory();
        markAsRead();
        
        const off = onMessageReceived((msg) => {
            const senderId = msg.sender?._id || msg.sender;
            if (senderId.toString() === friendId.toString()) {
                setMessages(prev => [...prev, msg]);
                markAsRead();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        });

        return () => {
            if (off) off();
            cleanupAudio();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [friendId]);

    const fetchHistory = async () => {
        try {
            const response = await api.get(`/chat/history/${friendId}`);
            setMessages(response.data.data || []);
        } catch (e) {
            console.log("History error", e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.post(`/chat/read/${friendId}`);
            updateUnreadCount();
        } catch (e) {
            console.log("Error marking as read", e);
        }
    };

    const cleanupAudio = async () => {
        if (recordingRef.current) {
            try {
                const status = await recordingRef.current.getStatusAsync();
                if (status.isRecording) {
                    await recordingRef.current.stopAndUnloadAsync();
                }
            } catch (e) {}
            recordingRef.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // --- AUDIO PAN RESPONDER (Hold to record, swipe to cancel) ---
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startRecording();
            },
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dy > 50) { // Swipe down to cancel
                    if (!isCancelRequested) {
                        setIsCancelRequested(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                } else {
                    setIsCancelRequested(false);
                }
            },
            onPanResponderRelease: () => {
                stopRecording();
            },
            onPanResponderTerminate: () => {
                stopRecording(true);
            }
        })
    ).current;

    const startRecording = async () => {
        try {
            await cleanupAudio();
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') return;

            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recordingRef.current = recording;
            setIsRecording(true);
            setIsCancelRequested(false);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async (forcedCancel = false) => {
        if (!recordingRef.current) return;
        const shouldCancel = isCancelRequested || forcedCancel;
        
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const status = await recordingRef.current.getStatusAsync();
            if (status.isRecording) {
                await recordingRef.current.stopAndUnloadAsync();
            }
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            
            if (!shouldCancel && uri) {
                handleSendMedia(uri, 'audio');
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
        } catch (e) {
            console.error("Stop recording error", e);
        }
    };

    const handleSendText = () => {
        if (!inputText.trim()) return;
        const msgData = { recipientId: friendId, text: inputText.trim(), type: 'text' };
        sendMessage(msgData);
        setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            sender: { _id: user?.id, login: user?.login, avatar: user?.avatar },
            text: inputText.trim(),
            type: 'text',
            status: 'sent',
            createdAt: new Date().toISOString()
        }]);
        setInputText('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSendMedia = async (uri: string, type: 'image' | 'video' | 'audio') => {
        setIsUploading(true);
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
            sendMessage({ recipientId: friendId, type, fileUrl, duration });
            setMessages(prev => [...prev, {
                _id: Date.now().toString(),
                sender: { _id: user?.id },
                type,
                fileUrl,
                duration,
                status: 'sent',
                createdAt: new Date().toISOString()
            }]);
        } catch (e) {
            Alert.alert("Erreur", "Impossible d'envoyer le média.");
        } finally {
            setIsUploading(false);
        }
    };

    const pickMedia = async (useCamera = false) => {
        const result = useCamera 
            ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });

        if (!result.canceled) setPendingAsset(result.assets[0]);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const clearChat = async () => {
        Alert.alert("Effacer la discussion", "Veux-tu vraiment supprimer tous les messages ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Effacer", style: "destructive", onPress: async () => {
                try {
                    await api.delete(`/chat/clear/${friendId}`);
                    setMessages([]);
                    setShowMenu(false);
                } catch (e) { Alert.alert("Erreur", "Impossible d'effacer."); }
            }}
        ]);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header Premium */}
                <View style={[styles.header, { borderBottomColor: themeColors.border, backgroundColor: themeColors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    
                    <View style={styles.headerMain}>
                        {friendAvatar ? (
                            <Image source={{ uri: friendAvatar }} style={styles.headerAvatar} />
                        ) : (
                            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: themeColors.surface }]}>
                                <Text style={styles.headerAvatarText}>{friendName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={styles.headerInfo}>
                            <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>{friendName}</Text>
                            <Text style={[styles.headerStatus, { color: colors.mint }]}>en ligne</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.headerBtn}>
                        <Ionicons name="ellipsis-vertical" size={22} color={themeColors.text} />
                    </TouchableOpacity>

                    {showMenu && (
                        <View style={[styles.menu, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                            <TouchableOpacity onPress={clearChat} style={styles.menuItem}>
                                <Ionicons name="trash-outline" size={18} color={colors.error} />
                                <Text style={[styles.menuText, { color: colors.error }]}>Effacer discussion</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.menuItem}>
                                <Ionicons name="ban-outline" size={18} color={themeColors.text} />
                                <Text style={[styles.menuText, { color: themeColors.text }]}>Bloquer l'ami</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Liste des Messages */}
                {isLoadingHistory ? (
                    <View style={styles.center}><ActivityIndicator color={colors.coral} /></View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id || item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <MessageBubble 
                                item={item} 
                                isMe={(item.sender?._id || item.sender) === user?.id} 
                                themeColors={themeColors} 
                                friendAvatar={friendAvatar}
                                onImagePress={(url: string) => setFullScreenImage(url)}
                            />
                        )}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                {/* Input Area */}
                <View style={[styles.inputArea, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
                    {isRecording ? (
                        <View style={styles.recordingOverlay}>
                            <View style={styles.recordingInfo}>
                                <Ionicons name="mic" size={24} color={isCancelRequested ? colors.error : colors.coral} />
                                <Text style={[styles.recordingTimer, { color: themeColors.text }]}>{formatDuration(recordingTime)}</Text>
                                <Text style={[styles.recordingHint, { color: isCancelRequested ? colors.error : themeColors.textSecondary }]}>
                                    {isCancelRequested ? "Relâcher pour annuler" : "Glisser vers le bas pour annuler"}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.inputRow}>
                            <TouchableOpacity onPress={() => pickMedia(false)} style={styles.actionBtn}>
                                <Ionicons name="image-outline" size={24} color={themeColors.textSecondary} />
                            </TouchableOpacity>
                            <View style={[styles.inputBox, { backgroundColor: themeColors.background }]}>
                                <TextInput
                                    style={[styles.input, { color: themeColors.text }]}
                                    placeholder="Écris un message..."
                                    placeholderTextColor={themeColors.textSecondary}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                />
                            </View>
                            {inputText.length > 0 ? (
                                <TouchableOpacity onPress={handleSendText} style={[styles.roundBtn, { backgroundColor: colors.coral }]}>
                                    <Ionicons name="send" size={18} color="#FFF" />
                                </TouchableOpacity>
                            ) : (
                                <View {...panResponder.panHandlers} style={[styles.roundBtn, { backgroundColor: colors.coral }]}>
                                    <Ionicons name="mic" size={22} color="#FFF" />
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Modals */}
                <Modal visible={!!pendingAsset} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.previewModal, { backgroundColor: themeColors.card }]}>
                            <Image source={{ uri: pendingAsset?.uri }} style={styles.previewImg} />
                            <View style={styles.previewActions}>
                                <TouchableOpacity onPress={() => setPendingAsset(null)} style={styles.modalBtn}><Text style={styles.modalBtnText}>Annuler</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => { handleSendMedia(pendingAsset.uri, pendingAsset.type === 'video' ? 'video' : 'image'); setPendingAsset(null); }} style={[styles.modalBtn, styles.modalBtnPrimary]}><Text style={styles.modalBtnTextWhite}>Envoyer</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={!!fullScreenImage} transparent animationType="fade">
                    <TouchableOpacity activeOpacity={1} onPress={() => setFullScreenImage(null)} style={styles.fullScreenOverlay}>
                        <Image source={{ uri: fullScreenImage! }} style={styles.fullScreenImg} resizeMode="contain" />
                        <TouchableOpacity style={styles.closeFull} onPress={() => setFullScreenImage(null)}>
                            <Ionicons name="close" size={32} color="#FFF" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const MessageBubble = ({ item, isMe, themeColors, friendAvatar, onImagePress }: any) => (
    <View style={[styles.bubbleWrap, isMe ? styles.myBubbleWrap : styles.friendBubbleWrap]}>
        {!isMe && (
            <View style={styles.bubbleAvatarWrap}>
                {friendAvatar ? <Image source={{ uri: friendAvatar }} style={styles.bubbleAvatar} /> : <View style={[styles.bubbleAvatarPlaceholder, { backgroundColor: themeColors.surface }]}><Text style={styles.bubbleAvatarInitial}>{item.sender?.login?.charAt(0)}</Text></View>}
            </View>
        )}
        <View style={[styles.bubble, { backgroundColor: isMe ? colors.coral : themeColors.card }, isMe ? styles.myBubble : styles.friendBubble]}>
            {item.type === 'image' ? (
                <TouchableOpacity onPress={() => onImagePress(item.fileUrl)}>
                    <Image source={{ uri: item.fileUrl }} style={styles.bubbleImg} />
                </TouchableOpacity>
            ) : item.type === 'audio' ? (
                <AudioBubble uri={item.fileUrl} isMe={isMe} duration={item.duration} />
            ) : item.type === 'video' ? (
                <View style={styles.videoBubble}><Ionicons name="play-circle" size={48} color="#FFF" /></View>
            ) : (
                <Text style={[styles.messageText, { color: isMe ? colors.white : themeColors.text }]}>{item.text}</Text>
            )}
            <View style={styles.bubbleFooter}>
                <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {isMe && <Ionicons name={item.read ? "checkmark-done" : "checkmark"} size={14} color={item.read ? "#34D399" : "rgba(255,255,255,0.7)"} style={{ marginLeft: 4 }} />}
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, zIndex: 100 },
    headerBtn: { padding: spacing.xs },
    headerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
    headerAvatar: { width: 38, height: 38, borderRadius: 19 },
    headerAvatarPlaceholder: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    headerAvatarText: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: colors.coral },
    headerInfo: { marginLeft: spacing.md, flex: 1 },
    headerTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
    headerStatus: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
    menu: { position: 'absolute', top: 60, right: 10, borderRadius: borderRadius.lg, padding: spacing.sm, borderWidth: 1, ...shadows.medium(false) },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, minWidth: 160 },
    menuText: { marginLeft: spacing.sm, fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
    bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.md, width: '100%' },
    myBubbleWrap: { justifyContent: 'flex-end' },
    friendBubbleWrap: { justifyContent: 'flex-start' },
    bubbleAvatarWrap: { marginRight: 8, marginBottom: 4 },
    bubbleAvatar: { width: 26, height: 26, borderRadius: 13 },
    bubbleAvatarPlaceholder: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    bubbleAvatarInitial: { fontSize: 12, fontWeight: 'bold', color: colors.coral },
    bubble: { maxWidth: '75%', padding: 12, borderRadius: 18 },
    myBubble: { borderBottomRightRadius: 4 },
    friendBubble: { borderBottomLeftRadius: 4 },
    bubbleImg: { width: 200, height: 200, borderRadius: 12 },
    videoBubble: { width: 200, height: 120, backgroundColor: '#000', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    messageText: { fontSize: 15, lineHeight: 21, fontFamily: 'Poppins_500Medium' },
    bubbleFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    timeText: { fontSize: 9, fontFamily: 'Poppins_400Regular' },
    inputArea: { padding: spacing.md, borderTopWidth: 1 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { padding: spacing.sm },
    inputBox: { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 8 },
    input: { flex: 1, maxHeight: 100, fontSize: 14, fontFamily: 'Poppins_500Medium' },
    roundBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    recordingOverlay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
    recordingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    recordingTimer: { fontSize: 16, fontFamily: 'Poppins_700Bold', marginHorizontal: 12 },
    recordingHint: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: spacing.xl },
    previewModal: { borderRadius: 24, padding: spacing.md },
    previewImg: { width: '100%', height: 350, borderRadius: 16 },
    previewActions: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md },
    modalBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
    modalBtnPrimary: { backgroundColor: colors.coral },
    modalBtnText: { fontFamily: 'Poppins_700Bold', color: colors.white },
    modalBtnTextWhite: { fontFamily: 'Poppins_700Bold', color: '#FFF' },
    fullScreenOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    fullScreenImg: { width: '100%', height: '100%' },
    closeFull: { position: 'absolute', top: 50, right: 20 },
});
