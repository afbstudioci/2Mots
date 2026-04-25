//src/components/common/CustomAlert.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'info' | 'success' | 'error';
    buttonText?: string;
}

export default function CustomAlert({ 
    visible, 
    title, 
    message, 
    onClose, 
    type = 'info', 
    buttonText = 'OK' 
}: CustomAlertProps) {
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
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
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
                <Animated.View style={[styles.alertBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    
                    <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(26, 32, 44, 0.85)', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    alertBox: {
        backgroundColor: colors.sand,
        width: '100%',
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.soft(false),
    },
    indicator: {
        width: 40,
        height: 6,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.titleLarge,
        fontSize: 24,
        color: colors.nightBlue,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.bodyMedium,
        color: colors.nightBlue,
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: spacing.xl,
    },
    button: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
        width: '100%',
        alignItems: 'center',
        ...shadows.soft(false),
    },
    buttonText: {
        ...typography.buttonPrimary,
        color: colors.white,
    }
});