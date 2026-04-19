import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

const MESSAGES = [
    "Reveil du serveur...",
    "Echauffement des processeurs...",
    "Preparation de vos defis...",
    "Connexion securisee...",
    "Presque la...",
];

const ServerWakeUpLoader = () => {
    const { themeColors } = useTheme();
    const [messageIndex, setMessageIndex] = useState(0);
    
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Logique d'intelligence : Rotation des messages
    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [fadeAnim]);

    // Animation de pulsation Premium
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <Modal transparent animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: themeColors.card }]}>
                    
                    {/* Indicateur Visuel Anime */}
                    <View style={styles.animationContainer}>
                        <Animated.View style={[
                            styles.pulseCircle, 
                            { transform: [{ scale: pulseAnim }], borderColor: colors.coral }
                        ]} />
                        <View style={[styles.dot, { backgroundColor: colors.coral }]} />
                    </View>

                    <Animated.Text style={[
                        styles.title, 
                        { color: themeColors.text, opacity: fadeAnim }
                    ]}>
                        {MESSAGES[messageIndex]}
                    </Animated.Text>
                    
                    <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                        Le serveur demarre sa session
                    </Text>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(11, 19, 43, 0.9)', // Bleu Nuit profond translucide
    },
    container: {
        width: '85%',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    animationContainer: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    pulseCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        position: 'absolute',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    title: {
        ...typography.bodyMedium,
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 20,
        textAlign: 'center',
        height: 30,
    },
    subtitle: {
        ...typography.bodyMedium,
        textAlign: 'center',
        marginTop: spacing.xs,
        fontSize: 14,
        opacity: 0.6,
    },
});

export default ServerWakeUpLoader;