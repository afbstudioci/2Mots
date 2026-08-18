//src/components/auth/PasswordValidator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

interface PasswordValidatorProps {
  password: string;
}

export default function PasswordValidator({ password }: PasswordValidatorProps) {
  const { themeColors } = useTheme();

  const rules = [
    { id: 'length', label: '8 caractères min.', isValid: password.length >= 8 },
    { id: 'uppercase', label: '1 majuscule', isValid: /[A-Z]/.test(password) },
    { id: 'number', label: '1 chiffre', isValid: /[0-9]/.test(password) },
  ];

  if (!password || password.length === 0) return null;

  return (
    <View style={styles.container}>
      {rules.map((rule) => (
        <View
          key={rule.id}
          style={[
            styles.ruleBadge,
            {
              backgroundColor: rule.isValid
                ? 'rgba(0, 210, 106, 0.12)'
                : themeColors.surface,
              borderColor: rule.isValid
                ? colors.success
                : themeColors.border,
            },
          ]}
        >
          <Ionicons
            name={rule.isValid ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={rule.isValid ? colors.success : themeColors.textSecondary}
            style={styles.icon}
          />
          <Text
            style={[
              styles.ruleText,
              {
                color: rule.isValid ? colors.success : themeColors.textSecondary,
                fontWeight: rule.isValid ? '700' : '500',
              },
            ]}
          >
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  ruleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  ruleText: {
    fontSize: 12,
  },
});