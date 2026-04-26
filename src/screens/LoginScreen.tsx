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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import AuthInput from '../components/auth/AuthInput';
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';
import { borderRadius } from '../theme/theme';
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                style={[styles.loginButton, { backgroundColor: themeColors.primary }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
                <Text style={[styles.registerText, { color: themeColors.textSecondary }]}>
                  Pas encore de compte ? <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>S'inscrire</Text>
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
  mainContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 15 },
  header: { alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  form: { width: '100%' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { fontSize: 13, fontWeight: '600' },
  loginButton: { height: 55, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  registerLink: { marginTop: 20, alignItems: 'center', paddingBottom: 10 },
  registerText: { fontSize: 14 }
});

export default LoginScreen;