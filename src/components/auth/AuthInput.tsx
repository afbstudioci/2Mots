//src/components/auth/AuthInput.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, colors, spacing } from '../../theme/theme';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isPassword,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  onFocus,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.surface,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.coral
              : themeColors.border,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: themeColors.text },
            Platform.OS === 'web' && ({ outlineStyle: 'none', outline: 'none' } as any),
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          underlineColorAndroid="transparent"
          selectionColor={colors.coral}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});

export default AuthInput;