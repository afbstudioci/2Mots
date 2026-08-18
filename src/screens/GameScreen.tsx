//src/screens/GameScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing } from '../theme/theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GameHeader from '../components/game/GameHeader';
import GameTimer from '../components/game/GameTimer';
import GamePlayArea from '../components/game/GamePlayArea';
import GameChoicesArea from '../components/game/GameChoicesArea';
import SuccessRipple from '../components/game/SuccessRipple';
import GameLoading from '../components/game/GameLoading';
import GameEmpty from '../components/game/GameEmpty';
import CustomAlert from '../components/common/CustomAlert';
import { useGameLogic } from '../hooks/useGameLogic';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }: any) {
  const { themeColors } = useTheme();
  const {
    wordPairs,
    currentIndex,
    setCurrentIndex,
    timeLeft,
    selectedChoice,
    correctChoice,
    isCorrectState,
    isLoading,
    errorMessage,
    isChecking,
    eliminatedChoice,
    isHintUsed,
    handleUseHint,
    showNoKevsModal,
    setShowNoKevsModal,
    userLevel,
    currentXp,
    xpNeeded,
    userKevs,
    timeWon,
    setTimeWon,
    successTrigger,
    lastAccuracy,
    selectChoice,
    showLevelUpModal,
    setShowLevelUpModal,
  } = useGameLogic();

  const slideWordsAnim = useRef(new Animated.Value(0)).current;

  const startNextWordAnimation = () => {
    Animated.timing(slideWordsAnim, {
      toValue: -width,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 < wordPairs.length) {
          return prev + 1;
        }
        return 0;
      });
      slideWordsAnim.setValue(width);
      Animated.timing(slideWordsAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelect = (choice: string) => {
    selectChoice(choice, () => {
      startNextWordAnimation();
    });
  };

  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const panicAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orb1Anim, { toValue: 1, duration: 15000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(orb2Anim, { toValue: 1, duration: 20000, useNativeDriver: true })
    ).start();
  }, [orb1Anim, orb2Anim]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(panicAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(panicAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      panicAnim.stopAnimation();
      panicAnim.setValue(0);
    }
  }, [timeLeft, panicAnim]);

  if (isLoading) return <GameLoading />;

  if (errorMessage || wordPairs.length === 0) {
    return <GameEmpty message={errorMessage || 'Chargement impossible'} onBack={() => navigation.navigate('Home')} />;
  }

  const currentPair = wordPairs[currentIndex];

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      {/* Orbes d'arriere-plan */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: colors.coral,
              top: -100,
              left: -50,
              transform: [
                { translateY: orb1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 100, 0] }) },
                { scale: orb1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] }) },
              ],
              opacity: panicAnim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.18] }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: colors.mint,
              bottom: -150,
              right: -100,
              transform: [
                { translateY: orb2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -120, 0] }) },
                { scale: orb2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] }) },
              ],
              opacity: panicAnim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.12] }),
            },
          ]}
        />
      </View>

      {/* En-tete avec Niveau, XP et Solde de Kevs */}
      <GameHeader level={userLevel} currentXp={currentXp} xpNeeded={xpNeeded} kevs={userKevs} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chronometre */}
        <GameTimer
          timeLeft={timeLeft}
          maxTime={30}
          timeWon={timeWon}
          onTimeGainAnimationEnd={() => setTimeWon(0)}
        />

        {/* Zone des 2 Mots */}
        <View style={styles.playAreaWrapper}>
          <SuccessRipple trigger={successTrigger} accuracy={lastAccuracy} />
          <Animated.View style={{ width: '100%', transform: [{ translateX: slideWordsAnim }] }}>
            <GamePlayArea currentPair={currentPair} />
          </Animated.View>
        </View>

        {/* Zone des 3 Choix Multiples & Indice 50/50 Payant */}
        <GameChoicesArea
          options={currentPair?.options || []}
          selectedChoice={selectedChoice}
          correctChoice={correctChoice}
          isCorrectState={isCorrectState}
          onSelectChoice={handleSelect}
          isChecking={isChecking}
          expectedType={currentPair?.expectedType}
          clue={currentPair?.clue}
          eliminatedChoice={eliminatedChoice}
          isHintUsed={isHintUsed}
          onHintPress={handleUseHint}
        />
      </ScrollView>

      {/* Alerte Passage de Niveau */}
      <CustomAlert
        visible={showLevelUpModal}
        title="FELICITATIONS !"
        message={`Vous venez de franchir le niveau ${userLevel} ! Bravo pour vos performances.`}
        onClose={() => {
          setShowLevelUpModal(false);
          startNextWordAnimation();
        }}
        type="success"
        buttonText="Continuer"
      />

      {/* Alerte Kevs Insuffisants pour le 50/50 */}
      <CustomAlert
        visible={showNoKevsModal}
        title="KEVS INSUFFISANTS"
        message="Il vous faut au moins 5 Kevs pour utiliser le joker 50/50. Résolvez des énigmes ou accomplissez des missions pour en gagner !"
        onClose={() => setShowNoKevsModal(false)}
        type="error"
        buttonText="Compris"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  playAreaWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  orb: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
  },
});