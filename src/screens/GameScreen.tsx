import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { typography, colors, spacing, borderRadius, shadows } from '../theme/theme';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export default function GameScreen({ navigation }: { navigation: GameScreenNavigationProp }) {
  const [userInput, setUserInput] = useState('');

  // Simule la fin de partie
  const handleFakeSubmit = () => {
    navigation.replace('GameOver', {
      score: 2450,
      details: [
        { word: 'ARBRE', accuracy: 100, label: 'PERFECT MATCH' },
        { word: 'LIVRE', accuracy: 85, label: 'HIGH ACCURACY' },
        { word: 'RACINE', accuracy: 92, label: 'EXCELLENT' },
      ]
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Niveau */}
      <View style={styles.header}>
        <Text style={styles.levelText}>NIVEAU 12</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '65%' }]} />
        </View>
        <Text style={styles.progressPercent}>65%</Text>
      </View>

      {/* Mots et Icones */}
      <View style={styles.wordsContainer}>
        <View style={styles.wordCard}>
          <View style={styles.iconPlaceholder}><Text style={styles.iconText}>ICON</Text></View>
          <Text style={styles.wordText}>ARBRE</Text>
        </View>
        <View style={styles.wordCard}>
          <View style={styles.iconPlaceholder}><Text style={styles.iconText}>ICON</Text></View>
          <Text style={styles.wordText}>LIVRE</Text>
        </View>
      </View>

      {/* Saisie */}
      <View style={styles.inputContainer}>
        <Text style={styles.questionText}>Quel est le lien ?</Text>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Tapez votre reponse..."
          placeholderTextColor="#4A5568"
          onSubmitEditing={handleFakeSubmit}
        />
      </View>

      {/* Indice */}
      <TouchableOpacity style={styles.hintButton}>
        <Text style={styles.hintText}>Indice logique</Text>
      </TouchableOpacity>

      {/* Nav Bar */}
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
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.xl * 2,
  },
  levelText: {
    fontFamily: 'Poppins_700Bold',
    color: colors.sand,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#2D3748',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.coral,
  },
  progressPercent: {
    fontFamily: 'Poppins_500Medium',
    color: colors.coral,
    fontSize: 12,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  wordsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl * 3,
  },
  wordCard: {
    flex: 1,
    backgroundColor: '#242B3A',
    marginHorizontal: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.soft,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#2D3748',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#4A5568',
  },
  wordText: {
    ...typography.titleLarge,
    fontSize: 22,
    color: colors.sand,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  questionText: {
    fontFamily: 'Poppins_500Medium',
    color: colors.sand,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: '#242B3A',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: colors.sand,
    ...shadows.soft,
  },
  hintButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#4A5568',
    borderRadius: borderRadius.md,
  },
  hintText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: colors.sand,
    opacity: 0.7,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.lg,
    marginTop: 'auto',
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