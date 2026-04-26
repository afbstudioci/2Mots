//src/components/game/GameLoading.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, colors, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function GameLoading() {
    const { themeColors } = useTheme();
    const rotate1 = useRef(new Animated.Value(0)).current;
    const rotate2 = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotate1, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
        ).start();

        Animated.loop(
            Animated.timing(rotate2, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            
            <View style={styles.animationWrapper}>
                {/* Lueur centrale */}
                <Animated.View style={[styles.glow, { transform: [{ scale: scaleAnim }], backgroundColor: colors.coral }]} />

                {/* Anneaux mystiques */}
                <Animated.View style={[
                    styles.ring, 
                    { 
                        borderColor: colors.mint, 
                        transform: [
                            { rotateX: '60deg' },
                            { rotateZ: rotate1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
                        ]
                    }
                ]} />
                <Animated.View style={[
                    styles.ring, 
                    { 
                        borderColor: colors.coral, 
                        transform: [
                            { rotateY: '60deg' },
                            { rotateZ: rotate2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) }
                        ]
                    }
                ]} />

                <Ionicons name="sparkles" size={32} color={colors.white} style={styles.icon} />
            </View>

            <Text style={[styles.loadingText, { color: themeColors.text }]}>Création de l'Arène...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.nightBlue,
    },
    animationWrapper: {
        width: 150,
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        opacity: 0.3,
        shadowColor: colors.coral,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },
    ring: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
    },
    icon: {
        position: 'absolute',
        zIndex: 10,
    },
    loadingText: {
        ...typography.bodyMedium,
        fontFamily: 'Poppins_700Bold',
        opacity: 0.8,
        marginTop: spacing.xl * 2,
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});