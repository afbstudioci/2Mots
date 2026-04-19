import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, colors, spacing } from '../../theme/theme';

const ChainIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
);

export default function GameLoading() {
    const fadeSideWords = useRef(new Animated.Value(0)).current;
    const dropCenterWord = useRef(new Animated.Value(-30)).current;
    const fadeCenterWord = useRef(new Animated.Value(0)).current;
    const fadeChains = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const playAnimation = () => {
            Animated.sequence([
                // 1. Apparition de CLE et SERRURE
                Animated.timing(fadeSideWords, { toValue: 1, duration: 500, useNativeDriver: true }),
                // 2. Chute de PORTE au centre
                Animated.parallel([
                    Animated.timing(dropCenterWord, { toValue: 0, duration: 500, useNativeDriver: true }),
                    Animated.timing(fadeCenterWord, { toValue: 1, duration: 500, useNativeDriver: true }),
                ]),
                // 3. Les chaines apparaissent
                Animated.timing(fadeChains, { toValue: 1, duration: 400, useNativeDriver: true }),
                // 4. Pause pour admirer
                Animated.delay(1000),
                // 5. Tout disparait doucement pour boucler
                Animated.parallel([
                    Animated.timing(fadeSideWords, { toValue: 0, duration: 400, useNativeDriver: true }),
                    Animated.timing(fadeCenterWord, { toValue: 0, duration: 400, useNativeDriver: true }),
                    Animated.timing(fadeChains, { toValue: 0, duration: 400, useNativeDriver: true }),
                    Animated.timing(dropCenterWord, { toValue: -30, duration: 0, useNativeDriver: true })
                ])
            ]).start(() => playAnimation());
        };

        playAnimation();
        return () => fadeSideWords.stopAnimation();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.animationRow}>
                <Animated.View style={{ opacity: fadeSideWords }}>
                    <Text style={styles.word}>CLE</Text>
                </Animated.View>

                <Animated.View style={[styles.chainContainer, { opacity: fadeChains }]}>
                    <ChainIcon />
                </Animated.View>

                <Animated.View style={{ transform: [{ translateY: dropCenterWord }], opacity: fadeCenterWord }}>
                    <Text style={styles.centerWord}>PORTE</Text>
                </Animated.View>

                <Animated.View style={[styles.chainContainer, { opacity: fadeChains }]}>
                    <ChainIcon />
                </Animated.View>

                <Animated.View style={{ opacity: fadeSideWords }}>
                    <Text style={styles.word}>SERRURE</Text>
                </Animated.View>
            </View>
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
    animationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    word: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 16,
        color: colors.sand,
        letterSpacing: 2,
    },
    centerWord: {
        fontFamily: 'Poppins_900Black',
        fontSize: 20,
        color: colors.coral,
        letterSpacing: 2,
    },
    chainContainer: {
        marginHorizontal: spacing.sm,
    }
});