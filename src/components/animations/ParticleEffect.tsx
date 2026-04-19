// src/components/animations/ParticleEffect.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/theme';

export default function ParticleEffect({ onFinish }: { onFinish: () => void }) {
    const particles = Array.from({ length: 8 });
    const anims = useRef(particles.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = anims.map((anim, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            return Animated.parallel([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]);
        });

        Animated.parallel(animations).start(() => onFinish());
    }, []);

    return (
        <View style={styles.container}>
            {particles.map((_, i) => {
                const angle = (i * 45) * (Math.PI / 180);
                const translateX = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 100] });
                const translateY = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * 100] });
                const opacity = anims[i].interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });

                return (
                    <Animated.View 
                        key={i} 
                        style={[
                            styles.particle, 
                            { 
                                backgroundColor: colors.coral,
                                opacity,
                                transform: [{ translateX }, { translateY }] 
                            }
                        ]} 
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    particle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
    },
});