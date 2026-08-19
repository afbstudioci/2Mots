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
  buttonText = 'Fermer',
  confirmText = 'Confirmer',
}: CustomAlertProps) {
  const { themeColors } = useTheme();
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
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.coral;
    }
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
                  style={[styles.button, styles.cancelBtn]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmBtn]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>{confirmText}</Text>
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
                <Text style={styles.buttonText}>{buttonText}</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertBox: {
    width: '100%',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.medium(false),
  },
  indicator: {
    width: 44,
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  message: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  cancelBtn: {
    backgroundColor: '#E53E3E',
  },
  confirmBtn: {
    backgroundColor: '#00C853',
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});