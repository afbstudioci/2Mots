//src/components/chat/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, colors, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStartRecording: () => void;
  onStopRecording: (cancel?: boolean) => void;
  isRecording: boolean;
  recordingTime: number;
  onTyping: () => void;
  customBackgroundColor?: string;
}

export default function ChatInput({
  onSend,
  onStartRecording,
  onStopRecording,
  isRecording,
  recordingTime,
  onTyping,
  customBackgroundColor,
}: ChatInputProps) {
  const { themeColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const bottomMargin = useRef(new Animated.Value(Math.max(insets.bottom + 8, 14))).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      Animated.timing(bottomMargin, {
        toValue: 12,
        duration: 220,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(bottomMargin, {
        toValue: Math.max(insets.bottom + 8, 14),
        duration: 220,
        useNativeDriver: false,
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
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleMicPress = () => {
    if (!isRecording) {
      onStartRecording();
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const barBg = customBackgroundColor || themeColors.surface;

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          backgroundColor: barBg,
          borderColor: isDark ? themeColors.overlayLight : 'rgba(0,0,0,0.06)',
          marginBottom: bottomMargin,
        },
        shadows.medium(isDark),
      ]}
    >
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <TouchableOpacity onPress={() => onStopRecording(true)} style={styles.recordActionBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>

          <View style={styles.recordInfo}>
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Text style={[styles.timer, { color: themeColors.text }]}>{formatTime(recordingTime)}</Text>
          </View>

          <TouchableOpacity onPress={() => onStopRecording(false)} style={styles.sendRecordBtn}>
            <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.sendGradientSmall}>
              <Ionicons name="send" size={18} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Message..."
            placeholderTextColor={themeColors.textSecondary}
            value={text}
            onChangeText={(t) => {
              setText(t);
              onTyping();
            }}
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
            <TouchableOpacity onPress={handleMicPress} style={styles.micBtn}>
              <View style={[styles.micCircle, { backgroundColor: colors.coral + '15' }]}>
                <Ionicons name="mic" size={22} color={colors.coral} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    marginHorizontal: spacing.md,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 110,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 4,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtn: {
    marginLeft: 4,
  },
  micCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: spacing.xs,
  },
  recordActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coral + '10',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  timer: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },
  sendRecordBtn: {
    width: 38,
    height: 38,
  },
  sendGradientSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});