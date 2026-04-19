//src/components/game/GameLoading.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, colors, spacing } from '../../theme/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function GameLoading() {
    const cardTranslateX = useRef(new Animated.Value(40)).current; // Ecart de depart
    const lineDrawAnim = useRef(new Animated.Value(100)).current;
    const shockwaveScale = useRef(new Animated.Value(0)).current;
    const shockwaveOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const playConnection = () => {
            Animated.sequence([
                // 1. Les cartes sont attirees l'une vers l'autre
                Animated.timing(cardTranslateX, { 
                    toValue: 0, 
                    duration: 600, 
                    easing: Easing.out(Easing.back(1.5)), 
                    useNativeDriver: true 
                }),
                // 2. La chaine se dessine a toute vitesse
                Animated.timing(lineDrawAnim, { 
                    toValue: 0, 
                    duration: 300, 
                    easing: Easing.linear, 
                    useNativeDriver: false 
                }),
                // 3. Explosion de l'onde de choc (Shockwave)
                Animated.parallel([
                    Animated.timing(shockwaveScale, { toValue: 3, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                    Animated.timing(shockwaveOpacity, { toValue: 0.8, duration: 100, useNativeDriver: true })
                ]),
                Animated.timing(shockwaveOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                // 4. Pause pour admirer
                Animated.delay(600),
                // 5. Reset global invisible
                Animated.parallel([
                    Animated.timing(cardTranslateX, { toValue: 40, duration: 300, useNativeDriver: true }),
                    Animated.timing(lineDrawAnim, { toValue: 100, duration: 0, useNativeDriver: false }),
                    Animated.timing(shockwaveScale, { toValue: 0, duration: 0, useNativeDriver: true }),
                ])
            ]).start(() => playConnection());
        };

        playConnection();
    }, []);

    return (
        <View style={styles.container}>
            
            {/* L'Onde de choc centrale */}
            <Animated.View style={[styles.shockwave, { 
                transform: [{ scale: shockwaveScale }],
                opacity: shockwaveOpacity
            }]} />

            <View style={styles.connectionBox}>
                <Animated.View style={[styles.wordCard, { transform: [{ translateX: cardTranslateX }] }]}>
                    <Text style={styles.word}>IDÉE</Text>
                </Animated.View>

                {/* La chaine qui relie les cartes */}
                <View style={styles.svgContainer}>
                    <Svg width="60" height="20" viewBox="0 0 60 20">
                        <AnimatedPath
                            d="M 5 10 L 55 10"
                            stroke={colors.coral}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="100"
                            strokeDashoffset={lineDrawAnim}
                        />
                    </Svg>
                </View>

                {/* Note : -1 multiplier pour aller dans l'autre sens */}
                <Animated.View style={[styles.wordCard, { 
                    transform: [{ 
                        translateX: cardTranslateX.interpolate({ inputRange: [0, 40], outputRange: [0, -40] }) 
                    }] 
                }]}>
                    <Text style={styles.word}>LIEN</Text>
                </Animated.View>
            </View>

            <Text style={styles.loadingText}>Connexion logique en cours...</Text>
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
    shockwave: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.coral,
        backgroundColor: 'rgba(255, 111, 97, 0.1)',
    },
    connectionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    wordCard: {
        backgroundColor: colors.nightBlue,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(247, 245, 240, 0.2)',
        shadowColor: colors.nightBlue,
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 5,
    },
    word: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 16,
        color: colors.sand,
        letterSpacing: 2,
    },
    svgContainer: {
        width: 60,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5, // Passe derriere les cartes pour donner l'illusion d'attache
    },
    loadingText: {
        ...typography.bodyMedium,
        color: colors.sand,
        opacity: 0.6,
        marginTop: spacing.xl,
        letterSpacing: 1,
    }
});