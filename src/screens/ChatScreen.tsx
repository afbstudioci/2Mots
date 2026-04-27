//src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
    KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, 
    Modal, Animated, PanResponder, Keyboard, Dimensions, LayoutAnimation
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

const { width, height } = Dimensions.get('window');

export default function ChatScreen({ route, navigation }: any) {
    const { friendName, friendId, friendAvatar } = route.params;
    const { user } = useAuth();
    const { themeColors, isDark } = useTheme();
    const { sendMessage, onMessageReceived } = useSocket();
    const { updateUnreadCount } = useData();
    
    // Inverted List: l'index 0 est le message le plus récent (en bas)
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    // Recording Logic
    const recordingRef = useRef<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<any>(null);
    
    // Animations
    const micScale = useRef(new Animated.Value(1)).current;
    const recordingAnim = useRef(new Animated.Value(0)).current;
    const slideCancelAnim = useRef(new Animated.Value(0)).current;
    
    // Media
    const [pendingAsset, setPendingAsset] = useState<any | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        if (!friendId) { navigation.goBack(); return; }
        fetchHistory();
        markAsRead();
        
        const off = onMessageReceived((msg) => {
            const senderId = msg.sender?._id || msg.sender;
            if (senderId.toString() === friendId.toString()) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setMessages(prev => [msg, ...prev]); // Inverted list
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
            // On inverse l'historique car la liste est Inverted
            const history = response.data.data || [];
            setMessages([...history].reverse());
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
        } catch (e) { console.log("Error marking as read", e); }
    };

    const cleanupAudio = async () => {
        if (recordingRef.current) {
            try {
                const status = await recordingRef.current.getStatusAsync();
                if (status.isRecording) await recordingRef.current.stopAndUnloadAsync();
            } catch (e) {}
            recordingRef.current = null;
        }
        setIsRecording(false);
        setIsLocked(false);
        setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
        Animated.spring(micScale, { toValue: 1, useNativeDriver: true }).start();
        Animated.timing(recordingAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    };

    // --- RECORDING INTERACTION ---
    const startRecording = async () => {
        try {
            await cleanupAudio();
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') return;

            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recordingRef.current = recording;
            
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            
            Animated.parallel([
                Animated.spring(micScale, { toValue: 1.5, friction: 4, useNativeDriver: true }),
                Animated.timing(recordingAnim, { toValue: 1, duration: 300, useNativeDriver: true })
            ]).start();
            
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (err) { console.error('Failed to start recording', err); }
    };

    const stopAndSendRecording = async (cancel = false) => {
        if (!recordingRef.current) return;
        const uri = recordingRef.current.getURI();
        await cleanupAudio();
        
        if (!cancel && uri) {
            handleSendMedia(uri, 'audio');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => startRecording(),
            onPanResponderMove: (evt, gestureState) => {
                // Swipe up to lock
                if (gestureState.dy < -60) {
                    if (!isLocked) {
                        setIsLocked(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                }
                // Swipe left to cancel
                if (gestureState.dx < -100) {
                    stopAndSendRecording(true);
                }
                slideCancelAnim.setValue(gestureState.dx);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (!isLocked) {
                    if (gestureState.dx < -100) stopAndSendRecording(true);
                    else stopAndSendRecording();
                }
                Animated.spring(slideCancelAnim, { toValue: 0, useNativeDriver: true }).start();
            },
            onPanResponderTerminate: () => stopAndSendRecording(true)
        })
    ).current;

    const handleSendText = () => {
        if (!inputText.trim()) return;
        const text = inputText.trim();
        sendMessage({ recipientId: friendId, text, type: 'text' });
        
        const newMsg = {
            _id: Date.now().toString(),
            sender: { _id: user?.id, login: user?.login, avatar: user?.avatar },
            text, type: 'text', status: 'sent', createdAt: new Date().toISOString()
        };
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => [newMsg, ...prev]);
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
            
            const newMsg = {
                _id: Date.now().toString(),
                sender: { _id: user?.id },
                type, fileUrl, duration, status: 'sent', createdAt: new Date().toISOString()
            };
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => [newMsg, ...prev]);
        } catch (e) {
            Alert.alert("Erreur", "Impossible d'envoyer le média.");
        } finally { setIsUploading(false); }
    };

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });
        if (!result.canceled) setPendingAsset(result.assets[0]);
    };

    const handleClearChat = async () => {
        Alert.alert("Effacer", "Vider toute la discussion ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Vider", style: "destructive", onPress: async () => {
                try {
                    await api.delete(`/chat/clear/${friendId}`);
                    setMessages([]);
                    setShowMenu(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (e) { Alert.alert("Erreur", "Action impossible"); }
            }}
        ]);
    };

    const handleBlockFriend = async () => {
        Alert.alert("Bloquer", `Voulez-vous bloquer ${friendName} ?`, [
            { text: "Annuler", style: "cancel" },
            { text: "Bloquer", style: "destructive", onPress: async () => {
                try {
                    await api.post(`/friends/block/${friendId}`);
                    navigation.goBack();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                } catch (e) { Alert.alert("Erreur", "Action impossible"); }
            }}
        ]);
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Ajusté pour le ScreenWrapper
            >
                {/* Background Gradient */}
                <LinearGradient 
                    colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#F1F5F9']} 
                    style={StyleSheet.absoluteFillObject} 
                />

                {/* Invisible Overlay to close menu */}
                {showMenu && (
                    <TouchableOpacity 
                        style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]} 
                        activeOpacity={1} 
                        onPress={() => setShowMenu(false)}
                    />
                )}

                {/* Custom Header */}
                <View style={[styles.header, { borderBottomColor: themeColors.overlayLight, zIndex: 1001 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <Ionicons name="chevron-back" size={28} color={themeColors.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.headerMain} activeOpacity={0.7}>
                        {friendAvatar ? (
                            <Image source={{ uri: friendAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.coral + '20' }]}>
                                <Text style={styles.avatarInitial}>{friendName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ marginLeft: 12 }}>
                            <Text style={[styles.headerTitle, { color: themeColors.text }]}>{friendName}</Text>
                            <Text style={styles.headerStatus}>• En ligne</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.headerIcon}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={themeColors.text} />
                    </TouchableOpacity>

                    {showMenu && (
                        <Animated.View style={[styles.menu, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                            <TouchableOpacity onPress={handleClearChat} style={styles.menuItem}>
                                <Ionicons name="trash-outline" size={18} color={colors.error} />
                                <Text style={[styles.menuText, { color: colors.error }]}>Vider le chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleBlockFriend} style={styles.menuItem}>
                                <Ionicons name="ban-outline" size={18} color={themeColors.text} />
                                <Text style={[styles.menuText, { color: themeColors.text }]}>Bloquer l'ami</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                {/* Messages List - INVERTED */}
                <FlatList
                    data={messages}
                    inverted
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <ChatBubble 
                            item={item} 
                            isMe={(item.sender?._id || item.sender) === user?.id} 
                            onImagePress={(url: string) => setFullScreenImage(url)}
                        />
                    )}
                    ListHeaderComponent={() => isUploading ? <ActivityIndicator color={colors.coral} style={{ margin: 10 }} /> : null}
                    ListFooterComponent={() => isLoadingHistory ? <ActivityIndicator color={colors.coral} style={{ margin: 20 }} /> : null}
                    keyboardShouldPersistTaps="handled"
                />

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: themeColors.surface }]}>
                        {isRecording ? (
                            <View style={styles.recordingRow}>
                                <Animated.View style={[styles.recordDot, { opacity: recordingAnim }]} />
                                <Text style={[styles.recordTime, { color: themeColors.text }]}>{formatTime(recordingTime)}</Text>
                                
                                {isLocked ? (
                                    <View style={styles.lockedRow}>
                                        <TouchableOpacity onPress={() => stopAndSendRecording(true)}>
                                            <Text style={{ color: colors.error, fontFamily: 'Poppins_700Bold' }}>ANNULER</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => stopAndSendRecording()}
                                            style={styles.sendRecordBtn}
                                        >
                                            <Ionicons name="send" size={20} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Animated.View style={[styles.cancelRow, { transform: [{ translateX: slideCancelAnim }] }]}>
                                        <Ionicons name="chevron-back" size={16} color={themeColors.textSecondary} />
                                        <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>Glisser pour annuler</Text>
                                    </Animated.View>
                                )}

                                {!isLocked && (
                                    <Animated.View style={[styles.micPulse, { transform: [{ scale: micScale }] }]}>
                                        <Ionicons name="mic" size={28} color={colors.coral} />
                                    </Animated.View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.inputRow}>
                                <TouchableOpacity onPress={pickMedia} style={styles.inputIcon}>
                                    <Ionicons name="add" size={30} color={themeColors.textSecondary} />
                                </TouchableOpacity>
                                
                                <TextInput 
                                    style={[styles.textInput, { color: themeColors.text, backgroundColor: themeColors.overlayLight }]}
                                    placeholder="Message..."
                                    placeholderTextColor={themeColors.textSecondary}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                />

                                {inputText.trim().length > 0 ? (
                                    <TouchableOpacity onPress={handleSendText} style={styles.sendBtn}>
                                        <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.sendGradient}>
                                            <Ionicons name="send" size={18} color="#FFF" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity {...panResponder.panHandlers} style={styles.micBtn}>
                                        <Ionicons name="mic" size={24} color={themeColors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                {/* Modals */}
                <Modal visible={!!pendingAsset} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.previewCard, { backgroundColor: themeColors.surface }]}>
                            <Image source={{ uri: pendingAsset?.uri }} style={styles.previewImage} />
                            <View style={styles.previewFooter}>
                                <TouchableOpacity onPress={() => setPendingAsset(null)} style={styles.previewCancel}>
                                    <Text style={{ color: themeColors.textSecondary, fontFamily: 'Poppins_700Bold' }}>ANNULER</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => { handleSendMedia(pendingAsset.uri, pendingAsset.type === 'video' ? 'video' : 'image'); setPendingAsset(null); }}
                                    style={styles.previewSend}
                                >
                                    <Text style={{ color: '#FFF', fontFamily: 'Poppins_700Bold' }}>ENVOYER</Text>
                                </TouchableOpacity>
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

const ChatBubble = ({ item, isMe, onImagePress }: any) => {
    const { themeColors } = useTheme();
    return (
        <View style={[styles.bubbleContainer, isMe ? styles.myBubble : styles.friendBubble]}>
            <View style={[
                styles.bubbleContent, 
                { 
                    backgroundColor: isMe ? colors.coral : themeColors.surface,
                    borderBottomRightRadius: isMe ? 4 : 20,
                    borderBottomLeftRadius: isMe ? 20 : 4,
                },
                !isMe && shadows.soft(false)
            ]}>
                {item.type === 'image' ? (
                    <TouchableOpacity onPress={() => onImagePress(item.fileUrl)}>
                        <Image source={{ uri: item.fileUrl }} style={styles.bubbleImage} />
                    </TouchableOpacity>
                ) : item.type === 'audio' ? (
                    <AudioBubble uri={item.fileUrl} isMe={isMe} duration={item.duration} />
                ) : (
                    <Text style={[styles.bubbleText, { color: isMe ? '#FFF' : themeColors.text }]}>
                        {item.text}
                    </Text>
                )}
                
                <View style={styles.bubbleMeta}>
                    <Text style={[styles.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && (
                        <Ionicons 
                            name={item.read ? "checkmark-done" : "checkmark"} 
                            size={14} 
                            color={item.read ? "#4ADE80" : "rgba(255,255,255,0.6)"} 
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
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderBottomWidth: 1,
        backgroundColor: 'transparent',
    },
    headerIcon: { padding: 8 },
    headerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: colors.coral },
    headerTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold' },
    headerStatus: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: colors.mint, marginTop: -2 },
    
    menu: { position: 'absolute', top: 60, right: 16, borderRadius: 16, padding: 8, borderWidth: 1, zIndex: 1000, ...shadows.float(false) },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, minWidth: 180 },
    menuText: { marginLeft: 12, fontSize: 14, fontFamily: 'Poppins_600SemiBold' },

    listContent: { padding: spacing.md },
    bubbleContainer: { marginVertical: 4, width: '100%', flexDirection: 'row' },
    myBubble: { justifyContent: 'flex-end' },
    friendBubble: { justifyContent: 'flex-start' },
    bubbleContent: { maxWidth: '80%', padding: 12, borderRadius: 20 },
    bubbleText: { fontSize: 15, fontFamily: 'Poppins_500Medium', lineHeight: 22 },
    bubbleImage: { width: 220, height: 220, borderRadius: 12 },
    bubbleMeta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    bubbleTime: { fontSize: 10, fontFamily: 'Poppins_400Regular' },

    inputContainer: { padding: spacing.sm, paddingBottom: Platform.OS === 'ios' ? 25 : spacing.sm },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    inputIcon: { padding: 8 },
    textInput: { 
        flex: 1, 
        borderRadius: 24, 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        maxHeight: 100, 
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
    },
    sendBtn: { marginLeft: 8 },
    sendGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    micBtn: { padding: 10, marginLeft: 4 },

    recordingRow: { flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 16 },
    recordDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error, marginRight: 10 },
    recordTime: { fontSize: 18, fontFamily: 'Poppins_700Bold', flex: 1 },
    cancelRow: { flexDirection: 'row', alignItems: 'center' },
    cancelText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', marginLeft: 4 },
    micPulse: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.coral + '20', justifyContent: 'center', alignItems: 'center', marginLeft: 20 },
    lockedRow: { flexDirection: 'row', alignItems: 'center' },
    sendRecordBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.coral, justifyContent: 'center', alignItems: 'center', marginLeft: 20 },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
    previewCard: { borderRadius: 24, padding: 16, overflow: 'hidden' },
    previewImage: { width: '100%', height: 400, borderRadius: 16 },
    previewFooter: { flexDirection: 'row', marginTop: 20, gap: 12 },
    previewCancel: { flex: 1, padding: 16, alignItems: 'center' },
    previewSend: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: colors.coral, borderRadius: 12 },

    fullScreenOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    fullScreenImg: { width: '100%', height: '100%' },
    closeFull: { position: 'absolute', top: 50, right: 20 },
});
