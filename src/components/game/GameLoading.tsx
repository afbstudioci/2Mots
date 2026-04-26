import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, colors, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function GameLoading() {
    const { themeColors } = useTheme();
    
    // Animation de rotation de l'icône
    const rotateAnim = useRef(new Animated.Value(0)).current;
    
    // Animations de "ripple" (vagues radar)
    const ripple1 = useRef(new Animated.Value(0)).current;
    const ripple2 = useRef(new Animated.Value(0)).current;
    const ripple3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Rotation infinie de l'icône
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();

        // Fonction pour lancer une vague
        const startRipple = (anim: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 2500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true
                    })
                ])
            ).start();
        };

        // Lancement décalé des vagues
        startRipple(ripple1, 0);
        startRipple(ripple2, 800);
        startRipple(ripple3, 1600);

    }, []);

    const createRippleStyle = (anim: Animated.Value) => {
        return {
            transform: [{
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 3] // Grandit jusqu'à 3 fois la taille
                })
            }],
            opacity: anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.3, 0] // S'estompe au fur et à mesure
            })
        };
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            
            <View style={styles.animationWrapper}>
                
                {/* Les 3 vagues radar */}
                <Animated.View style={[styles.rippleRing, createRippleStyle(ripple1), { borderColor: colors.coral }]} />
                <Animated.View style={[styles.rippleRing, createRippleStyle(ripple2), { borderColor: colors.mint }]} />
                <Animated.View style={[styles.rippleRing, createRippleStyle(ripple3), { borderColor: colors.coral }]} />

                {/* Icône Centrale qui tourne */}
                <Animated.View style={{ 
                    transform: [{ 
                        rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) 
                    }] 
                }}>
                    <Ionicons name="aperture-outline" size={64} color={themeColors.text} />
                </Animated.View>
                
            </View>

            <Text style={[styles.loadingText, { color: themeColors.text }]}>CONNEXION LOGIQUE...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animationWrapper: {
        width: 150,
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rippleRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
    },
    loadingText: {
        ...typography.bodyMedium,
        fontFamily: 'Poppins_700Bold',
        opacity: 0.6,
        marginTop: spacing.xl * 3,
        letterSpacing: 3,
    }
});