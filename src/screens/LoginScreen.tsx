//src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import AuthInput from '../components/auth/AuthInput';
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';
import { borderRadius, colors, spacing, typography } from '../theme/theme';
import { useKeyboard } from '../hooks/useKeyboard';

const LoginScreen = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const { login } = useAuth();
  const { themeColors } = useTheme();
  const { isKeyboardVisible } = useKeyboard();

  const handleLogin = async () => {
    if (!identifier || !password) {
      setAlert({
        visible: true,
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await login({ login: identifier, password });
    } catch (err: any) {
      setAlert({
        visible: true,
        title: 'Erreur',
        message: err.message || 'Identifiants incorrects.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {loading && <ServerWakeUpLoader />}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.mainContainer}>
            {!isKeyboardVisible && (
              <View style={styles.header}>
                <Text style={[styles.logoText, { color: themeColors.primary }]}>SE CONNECTER</Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Chaque lien compte.
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <AuthInput
                label="Pseudo ou Email"
                placeholder="Votre identifiant"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
              <AuthInput
                label="Mot de passe"
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={setPassword}
                isPassword
              />

              <TouchableOpacity onPress={() => {}} style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.coral, '#FF8C66']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: spacing.sm }} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={styles.registerLink}
              >
                <Text style={[styles.registerText, { color: themeColors.textSecondary }]}>
                  Pas encore de compte ?{' '}
                  <Text style={{ color: themeColors.primary, fontFamily: 'Poppins_700Bold' }}>
                    S'inscrire
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 15,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  logoText: {
    fontFamily: 'Poppins_900Black',
    fontSize: 34,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    marginTop: 4,
  },
  form: { width: '100%' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotPasswordText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  loginButton: {
    height: 58,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  loginButtonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  registerLink: { marginTop: 24, alignItems: 'center', paddingBottom: 10 },
  registerText: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
});

export default LoginScreen;