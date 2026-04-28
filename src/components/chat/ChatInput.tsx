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

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                onStartRecording();
                Animated.spring(micScale, { toValue: 1.6, friction: 4, useNativeDriver: true }).start();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            },
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy < -60 && !isLocked) {
                    setIsLocked(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }
                if (gesture.dx < -100) {
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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                        <Text style={[styles.timer, { color: themeColors.text }]}>{formatTime(recordingTime)}</Text>
                    </View>

                    {isLocked ? (
                        <View style={styles.lockedControls}>
                            <TouchableOpacity onPress={() => onStopRecording(true)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>ANNULER</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onStopRecording(false)} style={styles.sendRecordBtn}>
                                <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.sendGradientSmall}>
                                    <Ionicons name="send" size={18} color={colors.white} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Animated.View style={[styles.slideContainer, { transform: [{ translateX: slideAnim }] }]}>
                            <Ionicons name="chevron-back" size={16} color={themeColors.textSecondary} />
                            <Text style={[styles.slideText, { color: themeColors.textSecondary }]}>Glisser pour annuler</Text>
                        </Animated.View>
                    )}

                    {!isLocked && (
                        <Animated.View style={[styles.micActive, { transform: [{ scale: micScale }] }]}>
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
                        blurOnSubmit={false}
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
        height: 50,
    },
    recordInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.error,
        marginRight: 10,
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
        marginLeft: 6,
    },
    lockedControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancelBtn: {
        padding: 10,
        marginRight: 10,
    },
    cancelText: {
        color: colors.error,
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    sendRecordBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    sendGradientSmall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micActive: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.coral + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    }
});
