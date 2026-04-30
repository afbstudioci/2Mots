import React, { useState, useRef, useEffect } from 'react';
// v1.1 - Correction du layout et du clavier
import {
    View, TextInput, TouchableOpacity, StyleSheet, Animated, Text, Keyboard, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, colors, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const insets = useSafeAreaInsets();
    const [text, setText] = useState('');
    const bottomPadding = useRef(new Animated.Value(Math.max(insets.bottom, spacing.md))).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, () => {
            Animated.timing(bottomPadding, {
                toValue: 20, // 2cm au-dessus du clavier
                duration: 250,
                useNativeDriver: false
            }).start();
        });

        const hideSub = Keyboard.addListener(hideEvent, () => {
            Animated.timing(bottomPadding, {
                toValue: Math.max(insets.bottom, spacing.md),
                duration: 250,
                useNativeDriver: false
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [insets.bottom]);

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
                    Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
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
        <Animated.View style={[
            styles.container,
            {
                backgroundColor: themeColors.surface,
                paddingBottom: bottomPadding
            }
        ]}>
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
                        <Ionicons name="add-circle" size={32} color={themeColors.textSecondary} />
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
                            <Ionicons name="mic" size={28} color={colors.coral} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
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
        paddingTop: 12,
        paddingBottom: 12,
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
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.coral + '10',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 30,
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
        letterSpacing: 1.5,
    },
    sendRecordBtn: {
        width: 46,
        height: 46,
    },
    sendGradientSmall: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium(true),
    }
});