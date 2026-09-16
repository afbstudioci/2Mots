// src/components/home/HomePlaySection.tsx
// SECTION BOUTON JOUER ET HALOS PULSATILES (ACCUEIL)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme/theme';

interface HomePlaySectionProps {
  halo1Anim: Animated.Value;
  halo2Anim: Animated.Value;
  halo3Anim: Animated.Value;
  breathAnim: Animated.Value;
  scalePressAnim: Animated.Value;
  onPlayPress: () => void;
}

export const HomePlaySection: React.FC<HomePlaySectionProps> = ({
  halo1Anim,
  halo2Anim,
  halo3Anim,
  breathAnim,
  scalePressAnim,
  onPlayPress,
}) => {
  return (
    <>
      {[halo1Anim, halo2Anim, halo3Anim].map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.halo,
            {
              transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
              opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.35, 0] }),
            },
          ]}
        />
      ))}

      <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
        <Animated.View style={{ transform: [{ scale: scalePressAnim }] }}>
          <Pressable
            onPressIn={() => Animated.spring(scalePressAnim, { toValue: 0.94, useNativeDriver: true }).start()}
            onPressOut={() =>
              Animated.spring(scalePressAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start()
            }
            onPress={onPlayPress}
          >
            <LinearGradient
              colors={[colors.coral, '#FF8C66']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButton}
            >
              <View style={styles.playButtonContent}>
                <Ionicons name="play" size={30} color="#FFFFFF" style={styles.playIcon} />
                <Text style={[styles.playButtonText, { color: '#FFFFFF' }]}>JOUER</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.coral,
    zIndex: 0,
    marginTop: 60,
  },
  playButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: 48,
    borderRadius: 30,
    zIndex: 10,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 60,
  },
  playButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  playIcon: { marginRight: spacing.sm },
  playButtonText: { fontFamily: 'Poppins_900Black', fontSize: 32, letterSpacing: 2 },
});
