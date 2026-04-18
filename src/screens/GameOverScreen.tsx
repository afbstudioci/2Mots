import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { typography, colors, spacing, borderRadius, shadows } from '../theme/theme';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GameOverScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameOver'>;

export default function GameOverScreen({ route, navigation }: { route: any, navigation: GameOverScreenNavigationProp }) {
  const { score, details } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>SESSION COMPLETE</Text>
        
        <Text style={styles.scoreLabel}>FINAL SCORE</Text>
        <Text style={styles.scoreValue}>{score}</Text>

        <View style={styles.detailsContainer}>
          {details.map((item: any, index: number) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.word}>{item.word}</Text>
              <Text style={styles.accuracy}>{item.accuracy}%</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.replayButton} 
          activeOpacity={0.8}
          onPress={() => navigation.replace('Game')}
        >
          <Text style={styles.replayText}>REJOUER</Text>
        </TouchableOpacity>
      </ScrollView>

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
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    color: colors.coral,
    fontSize: 16,
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontFamily: 'Poppins_400Regular',
    color: colors.sand,
    opacity: 0.5,
    fontSize: 14,
    letterSpacing: 2,
  },
  scoreValue: {
    ...typography.titleHuge,
    color: colors.sand,
    marginBottom: spacing.xl * 2,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#242B3A',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl * 2,
    ...shadows.soft,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  word: {
    fontFamily: 'Poppins_700Bold',
    color: colors.sand,
    fontSize: 16,
    flex: 1,
  },
  accuracy: {
    fontFamily: 'Poppins_800ExtraBold',
    color: colors.coral,
    fontSize: 16,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    color: colors.sand,
    opacity: 0.6,
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
    letterSpacing: 1,
  },
  replayButton: {
    backgroundColor: colors.coral,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 3,
    borderRadius: borderRadius.xl,
    ...shadows.soft,
  },
  replayText: {
    ...typography.buttonPrimary,
    letterSpacing: 2,
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