//src/components/auth/ReferralModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ReferralModalProps {
  visible: boolean;
  initialCode?: string;
  onClose: (code?: string) => void;
}

export default function ReferralModal({ visible, initialCode = '', onClose }: ReferralModalProps) {
  const { themeColors } = useTheme();
  const [code, setCode] = useState(initialCode);
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode, visible]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.spring(translateYAnim, {
          toValue: -75,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }).start();
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateYAnim]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => onClose()}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.modalBox,
              {
                backgroundColor: themeColors.card,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.header}>
                <Ionicons name="gift" size={30} color={colors.white} />
                <Text style={styles.headerTitle}>CODE PARRAIN</Text>
              </LinearGradient>

              <View style={styles.body}>
                <Text style={[styles.message, { color: themeColors.text }]}>
                  As-tu un code d'un ami ?
                </Text>
                <Text style={[styles.subMessage, { color: themeColors.textSecondary }]}>
                  En entrant son code, tu reçois{' '}
                  <Text style={{ color: colors.coral, fontFamily: 'Poppins_700Bold' }}>
                    +200 Kevs bonus immédiatement
                  </Text>{' '}
                  (soit 300 Kevs pour bien démarrer) !
                </Text>

                <TextInput
                  style={[styles.input, { backgroundColor: themeColors.overlayLight, color: themeColors.text }]}
                  placeholder="EX: CODE-AMI"
                  placeholderTextColor={themeColors.textSecondary}
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  maxLength={12}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, !code.trim() && { opacity: 0.6 }]}
                  onPress={() => onClose(code.trim() || undefined)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.btnGradient}>
                    <Text style={styles.btnText}>VALIDER ET RECEVOIR 300 KEVS</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.skipBtn,
                    {
                      backgroundColor: themeColors.overlay,
                      borderColor: themeColors.border,
                    },
                  ]}
                  onPress={() => onClose()}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.skipText, { color: themeColors.text }]}>
                    Je n'ai pas de code promo
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '90%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium(false),
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.buttonPrimary,
    color: colors.white,
    fontSize: 17,
    marginTop: spacing.xs,
    letterSpacing: 2,
  },
  body: {
    padding: spacing.md,
    alignItems: 'center',
  },
  message: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 4,
  },
  subMessage: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  submitBtn: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Poppins_700Bold',
    color: colors.white,
    fontSize: 12.5,
    letterSpacing: 0.5,
  },
  skipBtn: {
    width: '100%',
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  skipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});