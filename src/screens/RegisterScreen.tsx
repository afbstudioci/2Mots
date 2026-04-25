// src/screens/RegisterScreen.tsx
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
import PasswordValidator from '../components/auth/PasswordValidator';
import AuthInput from '../components/auth/AuthInput';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [loginState, setLoginState] = useState('');
  const [email, setEmail] = useState('');
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

  const { register } = useAuth();
  const { themeColors } = useTheme();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const handleRegister = async () => {
    if (!loginState || !email || !password) {
      setAlert({
        visible: true,
        title: 'Champs incomplets',
        message: 'Veuillez remplir tous les champs pour créer votre compte.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await register({ login: loginState, email, password });
    } catch (err: any) {
      setAlert({
        visible: true,
        title: "Erreur d'inscription",
        message:
          err.message ||
          'Une erreur est survenue lors de la création du compte.',
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
              <Text style={[styles.title, { color: themeColors.text }]}>
                Créer un compte
              </Text>
              <Text
                style={[styles.subtitle, { color: themeColors.textSecondary }]}
              >
                Rejoignez la communauté et défiez votre logique.
              </Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Pseudo"
                placeholder="Comment doit-on vous appeler ?"
                value={loginState}
                onChangeText={setLoginState}
                autoCapitalize="none"
                onFocus={scrollToBottom}
              />

              <AuthInput
                label="Adresse Email"
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={scrollToBottom}
              />

              <AuthInput
                label="Mot de passe"
                placeholder="Choisissez un mot de passe robuste"
                value={password}
                onChangeText={setPassword}
                isPassword
                onFocus={scrollToBottom}
              />

              <View style={styles.validatorContainer}>
                <PasswordValidator password={password} />
              </View>

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>S'inscrire</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text
                  style={[
                    styles.loginLinkText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Déjà un compte ?{' '}
                  <Text
                    style={{ color: themeColors.primary, fontWeight: 'bold' }}
                  >
                    Se connecter
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
    minHeight: SCREEN_HEIGHT * 0.85,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  validatorContainer: {
    marginBottom: 20,
    marginTop: -8,
  },
  registerButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  loginLinkText: {
    fontSize: 15,
  },
});

export default RegisterScreen;