//src/components/common/CustomAlert.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, shadows, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  type?: 'info' | 'success' | 'error';
  buttonText?: string;
  confirmText?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  type = 'info',
  buttonText = 'Annuler',
  confirmText = 'Confirmer',
}: CustomAlertProps) {
  const { themeColors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!visible) return null;

  const getIndicatorColor = () => {
    switch (type) {
      case 'success':
        return colors.mint;
      case 'error':
        return colors.error;
      default:
        return colors.coral;
    }
  };

  const getConfirmBgColor = () => {
    if (type === 'error') return colors.error;
    if (type === 'success') return colors.mint;
    return colors.coral;
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertBox,
            { backgroundColor: themeColors.card, opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />

          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.buttonText, { color: themeColors.text }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {buttonText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: getConfirmBgColor() }]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.buttonText, { color: '#FFFFFF' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: type === 'error' ? colors.error : colors.coral },
                ]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.buttonText, { color: '#FFFFFF' }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {buttonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.medium(false),
  },
  indicator: {
    width: 44,
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  message: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13.5,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    ...shadows.soft(false),
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13.5,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});