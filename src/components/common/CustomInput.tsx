//src/components/common/CustomInput.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  onIconPress?: () => void;
}

export default function CustomInput({ iconName, onIconPress, style, ...props }: CustomInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { outlineStyle: 'none' } as any, style]}
        selectionColor={colors.coral}
        cursorColor={colors.coral}
        placeholderTextColor="#4A5568"
        underlineColorAndroid="transparent" // Tue definitivement la ligne bleue Android
        autoCorrect={false}
        {...props}
      />
      {iconName && (
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onIconPress} 
          disabled={!onIconPress}
          activeOpacity={0.7}
        >
          <Ionicons name={iconName} size={22} color="#4A5568" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242B3A',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: colors.sand,
    minHeight: 55, // Garantit que le texte ne deborde pas
  },
  iconButton: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});