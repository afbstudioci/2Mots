//src/components/home/PlayButton.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/theme';

interface PlayButtonProps {
    onPress: () => void;
}

const NUM_PARTICLES = 12;

const PlayButton: React.FC<PlayButtonProps> = ({ onPress }) => {
    const scalePressAnim = useRef(new Animated.Value(1)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

    // Creation des references pour les 12 particules du feu d'artifice
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

    const handlePressOut = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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

        // Delai pour laisser l'explosion se voir avant la transition
        setTimeout(() => {
            onPress();
        }, 300);
    };

    return (
        <View style={styles.container}>
            {/* Le systeme de particules en arriere plan */}
            {particles.map((particle, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.particle,
                        {
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
                        style={styles.playButtonWrapper}
                    >
                        <View style={styles.playButtonInner}>
                            <Text style={styles.playButtonText}>JOUER</Text>
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
        backgroundColor: colors.coral,
        shadowColor: colors.coral,
        shadowRadius: 10,
        shadowOpacity: 1,
        elevation: 10,
    },
    playButtonWrapper: {
        borderRadius: 100,
        shadowColor: colors.coral,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    playButtonInner: {
        backgroundColor: colors.coral,
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(247, 245, 240, 0.2)',
    },
    playButtonText: {
        fontFamily: 'Poppins_900Black',
        fontSize: 38,
        color: colors.nightBlue,
        letterSpacing: 3,
    },
});

export default PlayButton;