// src/screens/LoginScreen.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import AuthInput from '../components/auth/AuthInput';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  const scrollRef = useRef<ScrollView>(null);

  const { login } = useAuth();
  const { themeColors } = useTheme();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setAlert({
        visible: true,
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs pour vous connecter.',
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
        title: 'Erreur de connexion',
        message: err.message || 'Identifiants incorrects. Veuillez réessayer.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.mainContainer}>
            <View style={styles.header}>
              <Text style={[styles.logoText, { color: themeColors.primary }]}>
                2MOTS
              </Text>
              <Text
                style={[styles.subtitle, { color: themeColors.textSecondary }]}
              >
                Le jeu de réflexion où chaque lien compte.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={[styles.formTitle, { color: themeColors.text }]}>
                Connexion
              </Text>

              <AuthInput
                label="Email ou Pseudo"
                placeholder="Entrez votre identifiant"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                onFocus={scrollToBottom}
              />

              <AuthInput
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChangeText={setPassword}
                isPassword
                onFocus={scrollToBottom}
              />

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text
                  style={[styles.registerText, { color: themeColors.textSecondary }]}
                >
                  Pas encore de compte ?{' '}
                  <Text
                    style={{ color: themeColors.primary, fontWeight: 'bold' }}
                  >
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainContainer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: '85%',
  },
  form: {
    width: '100%',
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  loginButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  registerText: {
    fontSize: 15,
  },
});

export default LoginScreen;