//src/components/duel/DuelSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../theme/theme';

export const DuelSkeleton: React.FC = () => {
  const { themeColors } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View
          key={key}
          style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
        >
          <Animated.View
            style={[
              styles.avatarSkeleton,
              { backgroundColor: themeColors.overlayLight, opacity: opacityAnim },
            ]}
          />
          <View style={styles.infoSkeleton}>
            <Animated.View
              style={[
                styles.lineLong,
                { backgroundColor: themeColors.overlayLight, opacity: opacityAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.lineShort,
                { backgroundColor: themeColors.overlayLight, opacity: opacityAnim },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.buttonSkeleton,
              { backgroundColor: themeColors.overlayLight, opacity: opacityAnim },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  avatarSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
  },
  infoSkeleton: {
    flex: 1,
    gap: 8,
  },
  lineLong: {
    width: '60%',
    height: 14,
    borderRadius: 7,
  },
  lineShort: {
    width: '35%',
    height: 10,
    borderRadius: 5,
  },
  buttonSkeleton: {
    width: 80,
    height: 34,
    borderRadius: borderRadius.sm,
  },
});
