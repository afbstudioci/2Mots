//src/components/chat/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
    View, TextInput, TouchableOpacity, StyleSheet, Animated, 
    Text, Platform, PanResponder 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, colors, borderRadius } from '../../theme/theme';
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

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                onStartRecording();
                Animated.spring(micScale, { toValue: 1.5, useNativeDriver: true }).start();
            },
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy < -60 && !isLocked) {
                    setIsLocked(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                if (gesture.dx < -100) {
                    // Visual feedback for cancellation
                    slideAnim.setValue(gesture.dx);
                }
            },
            onPanResponderRelease: (_, gesture) => {
                Animated.spring(micScale, { toValue: 1, useNativeDriver: true }).start();
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
                
                if (!isLocked) {
                    if (gesture.dx < -100) onStopRecording(true);
                    else onStopRecording(false);
                }
            }
        })
    ).current;

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText('');
        }
    };

    useEffect(() => {
        if (!isRecording) {
            setIsLocked(false);
            slideAnim.setValue(0);
        }
    }, [isRecording]);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
            {isRecording ? (
                <View style={styles.recordingContainer}>
                    <View style={styles.recordInfo}>
                        <Animated.View style={[styles.dot, { opacity: new Animated.Value(1) }]} />
                        <Text style={[styles.timer, { color: themeColors.text }]}>{formatTime(recordingTime)}</Text>
                    </View>

                    {isLocked ? (
                        <View style={styles.lockedControls}>
                            <TouchableOpacity onPress={() => onStopRecording(true)}>
                                <Text style={styles.cancelText}>ANNULER</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onStopRecording(false)} style={styles.sendRecordBtn}>
                                <Ionicons name="send" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Animated.View style={[styles.slideContainer, { transform: [{ translateX: slideAnim }] }]}>
                            <Ionicons name="chevron-back" size={16} color={themeColors.textSecondary} />
                            <Text style={[styles.slideText, { color: themeColors.textSecondary }]}>Glisser pour annuler</Text>
                        </Animated.View>
                    )}

                    {!isLocked && (
                        <Animated.View style={{ transform: [{ scale: micScale }] }}>
                            <Ionicons name="mic" size={28} color={colors.coral} />
                        </Animated.View>
                    )}
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
                    />

                    {text.trim().length > 0 ? (
                        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                            <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.sendGradient}>
                                <Ionicons name="send" size={18} color={colors.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity {...panResponder.panHandlers} style={styles.actionBtn}>
                            <Ionicons name="mic" size={26} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? 30 : spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        padding: 8,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
        marginHorizontal: 4,
    },
    sendBtn: {
        marginLeft: 4,
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
        height: 50,
        paddingHorizontal: 8,
    },
    recordInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.error,
        marginRight: 8,
    },
    timer: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    slideContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    slideText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        marginLeft: 4,
    },
    lockedControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancelText: {
        color: colors.error,
        fontFamily: 'Poppins_700Bold',
        fontSize: 14,
        marginRight: 20,
    },
    sendRecordBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.coral,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
