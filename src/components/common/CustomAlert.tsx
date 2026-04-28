//src/components/common/CustomAlert.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
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
    confirmText = 'Confirmer'
}: CustomAlertProps) {
    const { themeColors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            fadeAnim.setValue(0); scaleAnim.setValue(0.9);
        }
    }, [visible]);

    if (!visible) return null;

    const getIndicatorColor = () => {
        switch (type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            default: return colors.coral;
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.alertBox, { backgroundColor: themeColors.card, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
                    
                    <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: themeColors.text }]}>{message}</Text>
                    
                    <View style={styles.buttonRow}>
                        {onConfirm ? (
                            <>
                                <TouchableOpacity style={[styles.button, styles.cancelBtn, { borderColor: themeColors.overlayLight }]} onPress={onClose} activeOpacity={0.8}>
                                    <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>{buttonText}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm} activeOpacity={0.8}>
                                    <Text style={styles.buttonText}>{confirmText}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
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
        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
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
        width: 40,
        height: 6,
        borderRadius: 3,
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
        textAlign: 'center',
        opacity: 0.8,
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
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        ...shadows.soft(false),
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    confirmBtn: {
        backgroundColor: colors.coral,
    },
    buttonText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 15,
        color: '#FFF',
    }
});