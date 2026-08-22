//src/components/common/UpdateModal.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

export interface UpdateModalProps {
  visible: boolean;
  type: 'store' | 'ota';
  title?: string;
  message?: string;
  isForced?: boolean;
  onUpdate: () => void;
  onDismiss?: () => void;
}

export default function UpdateModal({
  visible,
  type,
  title,
  message,
  isForced = false,
  onUpdate,
  onDismiss,
}: UpdateModalProps) {
  const { themeColors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 45, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [fadeAnim, scaleAnim, visible]);

  if (!visible) return null;

  const defaultTitle = type === 'ota' ? 'Mise à jour prête' : 'Mise à jour disponible';
  const defaultMessage =
    type === 'ota'
      ? 'Une mise à jour rapide a été téléchargée avec succès. Redémarrez l\'application pour en profiter.'
      : 'Une nouvelle version de votre application est disponible. Elle contient des améliorations importantes.';

  const actionText = type === 'ota' ? 'Redémarrer' : 'Mettre à jour';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={isForced ? () => {} : onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertBox,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
            shadows.float(isDark),
          ]}
        >
          {/* Badge Icône circulaire */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(74, 222, 128, 0.2)',
              },
            ]}
          >
            <Ionicons name="sync-circle-outline" size={32} color={colors.mint} />
          </View>

          {/* Titre et Message */}
          <Text style={[styles.title, { color: themeColors.text }]}>
            {title || defaultTitle}
          </Text>
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>
            {message || defaultMessage}
          </Text>

          {/* Boutons d'action */}
          <View style={styles.buttonRow}>
            {!isForced && onDismiss && (
              <TouchableOpacity
                style={[
                  styles.dismissButton,
                  {
                    backgroundColor: themeColors.overlay,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={onDismiss}
                activeOpacity={0.75}
              >
                <Text style={[styles.dismissText, { color: themeColors.textSecondary }]}>
                  Plus tard
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.updateButtonWrapper}
              onPress={onUpdate}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.coral, '#FF8C66']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.updateGradient}
              >
                <Text style={styles.updateText}>{actionText}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  message: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13.5,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  dismissButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dismissText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  updateButtonWrapper: {
    flex: 1.2,
    height: 48,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  updateGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  updateText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
