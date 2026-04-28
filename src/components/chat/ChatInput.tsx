//src/components/chat/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
    View, TextInput, TouchableOpacity, StyleSheet, Animated, 
    Text, Platform, PanResponder 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, colors, borderRadius, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
    onSend: (text: string) => void;
    onMediaPress: () => void;
    onStartRecording: () => void;
    onStopRecording: (cancel?: boolean) => void;
    isRecording: boolean;
    recordingTime: number;
    onTyping: () => void;
}

export default function ChatInput({ 
    onSend, 
    onMediaPress, 
    onStartRecording, 
    onStopRecording,
    isRecording,
    recordingTime,
    onTyping
}: ChatInputProps) {
    const { themeColors } = useTheme();
    const [text, setText] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    
    const micScale = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.4, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

    const handleMicPress = () => {
        if (!isRecording) {
            onStartRecording();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            onStopRecording(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText('');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
            {isRecording ? (
                <View style={styles.recordingContainer}>
                    <TouchableOpacity onPress={() => onStopRecording(true)} style={styles.recordActionBtn}>
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                    </TouchableOpacity>

                    <View style={styles.recordInfo}>
                        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                        <Text style={[styles.timer, { color: themeColors.text }]}>{formatTime(recordingTime)}</Text>
                    </View>

                    <TouchableOpacity onPress={() => onStopRecording(false)} style={styles.sendRecordBtn}>
                        <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.sendGradientSmall}>
                            <Ionicons name="send" size={20} color={colors.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.inputRow}>
                    <TouchableOpacity onPress={onMediaPress} style={styles.actionBtn}>
                        <Ionicons name="add" size={30} color={themeColors.textSecondary} />
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.overlayLight }]}
                        placeholder="Message..."
                        placeholderTextColor={themeColors.textSecondary}
                        value={text}
                        onChangeText={(t) => { setText(t); onTyping(); }}
                        multiline
                        blurOnSubmit={false}
                    />

                    {text.trim().length > 0 ? (
                        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                            <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.sendGradient}>
                                <Ionicons name="send" size={18} color={colors.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleMicPress} style={styles.actionBtn}>
                            <Ionicons name="mic" size={26} color={colors.coral} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing.md,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        padding: 6,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
        marginHorizontal: 8,
    },
    sendBtn: {
        marginLeft: 2,
    },
    sendGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: spacing.sm,
    },
    recordActionBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.coral + '10',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 25,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.error,
        marginRight: 10,
    },
    timer: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 1,
    },
    sendRecordBtn: {
        width: 44,
        height: 44,
    },
    sendGradientSmall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.soft(true),
    }
});
