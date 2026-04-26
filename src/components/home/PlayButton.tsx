//src/components/home/PlayButton.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../hooks/useFeedback';
import { spacing, typography } from '../../theme/theme';

interface PlayButtonProps {
    onPress: () => void;
}

const NUM_PARTICLES = 12;

const PlayButton: React.FC<PlayButtonProps> = ({ onPress }) => {
    const { themeColors } = useTheme();
    const { triggerVibration } = useFeedback();

    const scalePressAnim = useRef(new Animated.Value(1)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

    const particles = useRef(
        Array.from({ length: NUM_PARTICLES }).map(() => ({
            translateXY: new Animated.ValueXY({ x: 0, y: 0 }),
            opacity: new Animated.Value(0),
            scale: new Animated.Value(0.5)
        }))
    ).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, {
                    toValue: 1.04,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(breatheAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const fireParticles = () => {
        const animations = particles.map((particle, index) => {
            particle.translateXY.setValue({ x: 0, y: 0 });
            particle.opacity.setValue(1);
            particle.scale.setValue(0.5);

            const angle = (index * 360) / NUM_PARTICLES;
            const distance = 100 + Math.random() * 40;
            const rad = (angle * Math.PI) / 180;
            
            const toX = Math.cos(rad) * distance;
            const toY = Math.sin(rad) * distance;

            return Animated.parallel([
                Animated.timing(particle.translateXY, {
                    toValue: { x: toX, y: toY },
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.scale, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                    toValue: 0,
                    duration: 600,
                    delay: 200,
                    useNativeDriver: true,
                })
            ]);
        });

        Animated.parallel(animations).start();
    };

    const handlePressIn = () => {
        breatheAnim.stopAnimation();
        Animated.spring(scalePressAnim, {
            toValue: 0.90,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        // CORRECTION : Utilisation de notre moteur pour respecter les paramètres
        triggerVibration(Haptics.ImpactFeedbackStyle.Heavy);
        
        fireParticles();
        
        Animated.spring(scalePressAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(breatheAnim, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
                    Animated.timing(breatheAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
                ])
            ).start();
        });

        setTimeout(() => {
            onPress();
        }, 300);
    };

    return (
        <View style={styles.container}>
            {/* Particules synchronisées sur la couleur primaire du thème */}
            {particles.map((particle, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.particle,
                        {
                            backgroundColor: themeColors.primary,
                            shadowColor: themeColors.primary,
                            opacity: particle.opacity,
                            transform: [
                                { translateX: particle.translateXY.x },
                                { translateY: particle.translateXY.y },
                                { scale: particle.scale }
                            ]
                        }
                    ]}
                />
            ))}

            <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
                <Animated.View style={{ transform: [{ scale: scalePressAnim }] }}>
                    <Pressable
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        style={[styles.playButtonWrapper, { shadowColor: themeColors.primary }]}
                    >
                        <View style={[styles.playButtonInner, { 
                            backgroundColor: themeColors.primary,
                            borderColor: 'rgba(255, 255, 255, 0.2)' 
                        }]}>
                            {/* Le texte prend la couleur du fond pour un look découpé moderne */}
                            <Text style={[styles.playButtonText, { color: themeColors.background }]}>JOUER</Text>
                        </View>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowRadius: 10,
        shadowOpacity: 1,
        elevation: 10,
    },
    playButtonWrapper: {
        borderRadius: 100,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    playButtonInner: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
    },
    playButtonText: {
        fontFamily: 'Poppins_900Black',
        fontSize: 38,
        letterSpacing: 3,
    },
});

export default PlayButton;