//src/components/auth/AuthInput.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: string;
  isPassword?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  secureTextEntry,
  isPassword,
  ...props
}) => {
  const { themeColors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  // Détermine si on doit masquer le texte
  const isTextSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: themeColors.surface }]}>
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          placeholderTextColor={themeColors.textSecondary}
          secureTextEntry={isTextSecure}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: 20, // Bords très arrondis
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default AuthInput;