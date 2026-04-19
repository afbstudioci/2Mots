//src/components/game/GameTimer.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors, borderRadius } from '../../theme/theme';

interface GameTimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  wordKey: string; 
}

const GameTimer: React.FC<GameTimerProps> = ({ duration, onTimeUp, isActive, wordKey }) => {
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progress.stopAnimation();
    
    if (isActive) {
      progress.setValue(1);
      Animated.timing(progress, {
        toValue: 0,
        duration: duration * 1000,
        easing: Easing.linear,
        useNativeDriver: false, 
      }).start(({ finished }) => {
        if (finished) {
          onTimeUp();
        }
      });
    } else {
      progress.setValue(1);
    }
  }, [isActive, duration, onTimeUp, wordKey]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [colors.error, colors.coral, colors.success]
  });

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { width, backgroundColor }]} />
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