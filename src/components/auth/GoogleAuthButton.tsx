//src/components/auth/GoogleAuthButton.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/googleAuth';
import { borderRadius, shadows } from '../../theme/theme';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
  title?: string;
  mode?: 'login' | 'register';
}

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

export default function GoogleAuthButton({
  onSuccess,
  onError,
  title = 'Continuer avec Google',
  mode = 'login',
}: GoogleAuthButtonProps) {
  const { themeColors, isDark } = useTheme();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result: any = await signInWithGoogle();

      if (!result || result.cancelled) {
        setLoading(false);
        return;
      }

      if (result.email) {
        await loginWithGoogle({
          email: result.email,
          name: result.name,
          profilePicture: result.profilePicture,
          idToken: result.idToken,
          mode,
        });

        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      if (onError) {
        onError(err.message || 'Connexion Google interrompue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDark ? themeColors.surface : '#FFFFFF',
          borderColor: isDark ? themeColors.border : '#E2E8F0',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={themeColors.text} />
      ) : (
        <View style={styles.content}>
          <GoogleIcon />
          <Text style={[styles.text, { color: themeColors.text }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginVertical: 10,
    width: '100%',
    ...shadows.soft(false),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
});