//src/components/auth/ReferralModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ReferralModalProps {
    visible: boolean;
    onClose: (code?: string) => void;
}

export default function ReferralModal({ visible, onClose }: ReferralModalProps) {
    const { themeColors } = useTheme();
    const [code, setCode] = useState('');

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => onClose()}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={[styles.modalBox, { backgroundColor: themeColors.card }]}>
                        <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.header}>
                            <Ionicons name="gift" size={32} color={colors.white} />
                            <Text style={styles.headerTitle}>CODE PROMO</Text>
                        </LinearGradient>

                        <View style={styles.body}>
                            <Text style={[styles.message, { color: themeColors.text }]}>
                                As-tu un code de parrainage ?
                            </Text>
                            <Text style={[styles.subMessage, { color: themeColors.textSecondary }]}>
                                En utilisant un code, tu gagneras <Text style={{ color: colors.coral, fontWeight: 'bold' }}>100 Kevs</Text> dès que tu atteindras le niveau 2 !
                            </Text>

                            <TextInput
                                style={[styles.input, { backgroundColor: themeColors.surface, color: themeColors.text }]}
                                placeholder="TON-CODE-ICI"
                                placeholderTextColor={themeColors.textSecondary}
                                value={code}
                                onChangeText={setCode}
                                autoCapitalize="characters"
                                maxLength={10}
                            />

                            <TouchableOpacity 
                                style={[styles.submitBtn, !code.trim() && { opacity: 0.6 }]} 
                                onPress={() => onClose(code.trim() || undefined)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={[colors.coral, '#FF8C66']} style={styles.btnGradient}>
                                    <Text style={styles.btnText}>VALIDER LE CODE</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.skipBtn} onPress={() => onClose()}>
                                <Text style={[styles.skipText, { color: themeColors.textSecondary }]}>
                                    Je n'ai pas de code
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    modalBox: {
        width: '100%',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.soft(false),
    },
    header: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.buttonPrimary,
        color: colors.white,
        fontSize: 18,
        marginTop: spacing.sm,
        letterSpacing: 2,
    },
    body: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    message: {
        ...typography.titleLarge,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subMessage: {
        ...typography.bodyMedium,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 20,
    },
    input: {
        width: '100%',
        height: 55,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
        letterSpacing: 3,
        marginBottom: spacing.lg,
    },
    submitBtn: {
        width: '100%',
        height: 55,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        ...typography.buttonPrimary,
        color: colors.white,
        fontSize: 14,
    },
    skipBtn: {
        padding: spacing.md,
    },
    skipText: {
        ...typography.bodySmall,
        textDecorationLine: 'underline',
    },
});
