//src/screens/GameScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing } from '../theme/theme';
import { useAudioContext } from '../context/AudioContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GameHeader from '../components/game/GameHeader';
import GameTimer from '../components/game/GameTimer';
import GamePlayArea from '../components/game/GamePlayArea';
import GameChoicesArea from '../components/game/GameChoicesArea';
import SuccessRipple from '../components/game/SuccessRipple';
import GameLoading from '../components/game/GameLoading';
import GameEmpty from '../components/game/GameEmpty';
import CustomAlert from '../components/common/CustomAlert';
import GameOverLimitModal from '../components/game/GameOverLimitModal';
import KevyChestModal from '../components/game/KevyChestModal';
import { useGameLogic } from '../hooks/useGameLogic';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }: any) {
  const { themeColors } = useTheme();
  const { playBgm, stopBgm } = useAudioContext();
  const {
    wordPairs,
    currentIndex,
    setCurrentIndex,
    timeLeft,
    maxTime,
    selectedChoice,
    correctChoice,
    isCorrectState,
    isFastCombo,
    isLoading,
    errorMessage,
    isChecking,
    eliminatedChoices,
    isHintUsed,
    handleUseHint,
    handleUseTimeFreeze,
    handleUseSuperClue,
    handleUseSecondChance,
    isTimeFrozen,
    timeFreezeCount,
    superClueCount,
    secondChanceCount,
    showNoKevsModal,
    setShowNoKevsModal,
    userLevel,
    currentXp,
    xpNeeded,
    userKevs,
    kevyKeys,
    showKevyChest,
    handleCloseKevyChest,
    timeWon,
    setTimeWon,
    successTrigger,
    lastAccuracy,
    selectChoice,
    showLevelUpModal,
    handleCloseLevelUp,
    errorLimitData,
    setErrorLimitData,
    triggerGameOver,
  } = useGameLogic();

  useEffect(() => {
    playBgm();
    return () => {
      stopBgm();
    };
  }, []);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startNextWordAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex((prev) => prev + 1);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      ]).start();
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
    Animated.loop(Animated.timing(orb1Anim, { toValue: 1, duration: 15000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(orb2Anim, { toValue: 1, duration: 20000, useNativeDriver: true })).start();
  }, [orb1Anim, orb2Anim]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !showLevelUpModal && !errorLimitData?.visible) {
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
  }, [timeLeft, panicAnim, showLevelUpModal, errorLimitData?.visible]);

  const currentPair = wordPairs[currentIndex];

  if (isLoading || (!currentPair && wordPairs.length > 0 && currentIndex < wordPairs.length)) return <GameLoading />;

  if (errorMessage || wordPairs.length === 0) {
    return <GameEmpty message={errorMessage || 'Chargement impossible'} onBack={() => navigation.navigate('Home')} />;
  }

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: isTimeFrozen ? '#38BDF8' : colors.coral,
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

      <GameHeader level={userLevel} currentXp={currentXp} xpNeeded={xpNeeded} kevs={userKevs} kevyKeys={kevyKeys} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GameTimer
          timeLeft={timeLeft}
          maxTime={maxTime || 30}
          timeWon={timeWon}
          isFastCombo={isFastCombo}
          onTimeGainAnimationEnd={() => setTimeWon(0)}
        />

        <View style={styles.playAreaWrapper}>
          <SuccessRipple trigger={successTrigger} accuracy={lastAccuracy} />
          <Animated.View
            style={{
              width: '100%',
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <GamePlayArea currentPair={currentPair} />
          </Animated.View>
        </View>

        <GameChoicesArea
          options={currentPair?.options || []}
          selectedChoice={selectedChoice}
          correctChoice={correctChoice}
          isCorrectState={isCorrectState}
          onSelectChoice={handleSelect}
          isChecking={isChecking}
          expectedType={currentPair?.expectedType}
          clue={currentPair?.clue}
          eliminatedChoices={eliminatedChoices}
          isHintUsed={isHintUsed}
          onHintPress={handleUseHint}
          onTimeFreezePress={handleUseTimeFreeze}
          onSuperCluePress={handleUseSuperClue}
          isTimeFrozen={isTimeFrozen}
          timeFreezeCount={timeFreezeCount}
          superClueCount={superClueCount}
        />
      </ScrollView>

      <CustomAlert
        visible={showLevelUpModal}
        title="FELICITATIONS !"
        message={`Vous venez de franchir le niveau ${userLevel} ! Bravo pour vos performances.`}
        onClose={() => {
          handleCloseLevelUp();
          startNextWordAnimation();
        }}
        type="success"
        buttonText="Continuer"
      />

      <CustomAlert
        visible={showNoKevsModal}
        title="KEVS INSUFFISANTS"
        message="Vous n'avez pas assez de Kevs pour cette action. Gagnez-en en résolvant des énigmes !"
        onClose={() => setShowNoKevsModal(false)}
        type="error"
        buttonText="Compris"
      />

      <GameOverLimitModal
        visible={Boolean(errorLimitData?.visible)}
        errorCount={errorLimitData?.count || 3}
        secondChanceCount={secondChanceCount}
        userKevs={userKevs}
        onConfirm={() => {
          const r = errorLimitData?.reason;
          setErrorLimitData(null);
          triggerGameOver(r);
        }}
        onUseSecondChance={() => handleUseSecondChance(startNextWordAnimation)}
      />

      <KevyChestModal
        visible={showKevyChest}
        onClose={handleCloseKevyChest}
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