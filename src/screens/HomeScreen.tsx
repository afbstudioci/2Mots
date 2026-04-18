import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, colors, spacing, borderRadius, shadows } from '../theme/theme';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>2Mots</Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.tagline}>Reflexion. Instinct. Rapidite.</Text>
        
        <TouchableOpacity 
          style={styles.playButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Game')}
        >
          <Text style={styles.playButtonText}>JOUER</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navBar}>
        <View style={styles.navIcon} />
        <View style={[styles.navIcon, { backgroundColor: colors.coral, width: 6, height: 6 }]} />
        <View style={styles.navIcon} />
        <View style={styles.navIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.nightBlue,
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  logo: {
    ...typography.titleLarge,
    color: colors.coral,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.sand,
    opacity: 0.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xl * 2,
  },
  playButton: {
    backgroundColor: colors.coral,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl * 3,
    borderRadius: borderRadius.xl,
    ...shadows.soft,
  },
  playButtonText: {
    ...typography.buttonPrimary,
    fontSize: 20,
    letterSpacing: 3,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  navIcon: {
    width: 5,
    height: 5,
    borderRadius: 50,
    backgroundColor: '#4A5568',
  },
});