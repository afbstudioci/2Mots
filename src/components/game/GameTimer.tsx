//src/components/game/GameTimer.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  interpolateColor, 
  runOnJS 
} from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme/theme';

interface GameTimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  wordKey: string; 
}

const GameTimer: React.FC<GameTimerProps> = ({ duration, onTimeUp, isActive, wordKey }) => {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      progress.value = 1;
      progress.value = withTiming(
        0,
        {
          duration: duration * 1000,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            runOnJS(onTimeUp)();
          }
        }
      );
    } else {
      progress.value = 1; 
    }
  }, [isActive, duration, onTimeUp, wordKey]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.3, 1],
      [colors.error, colors.coral, colors.success] 
    );

    return {
      width: `${progress.value * 100}%`,
      backgroundColor,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: 'rgba(247, 245, 240, 0.1)', 
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    height: '100%',
    borderRadius: borderRadius.xl,
  },
});

export default GameTimer;