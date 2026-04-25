//src/screens/RegisterScreen.tsx
import React, { useState, useRef } from 'react';
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
import { borderRadius } from '../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
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

  const scrollToInput = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleRegister = async () => {
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      setAlert({
        visible: true,
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs pour créer votre compte.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await register({ username, email, password });
      setAlert({
        visible: true,
        title: 'Compte créé',
        message: 'Votre compte a été créé avec succès ! Connectez-vous dès maintenant.',
        type: 'success',
      });
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err: any) {
      setAlert({
        visible: true,
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue lors de l\'inscription.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
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
                S'INSCRIRE
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Rejoignez la communauté et commencez à lier les mots.
              </Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Pseudo"
                placeholder="Choisissez un pseudo"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                onFocus={scrollToInput}
              />

              <AuthInput
                label="Email"
                placeholder="Votre adresse email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                onFocus={scrollToInput}
              />

              <AuthInput
                label="Mot de passe"
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                isPassword
                onFocus={scrollToInput}
              />

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
                  <Text style={styles.registerButtonText}>Créer mon compte</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={[styles.loginLinkText, { color: themeColors.textSecondary }]}>
                  Déjà un compte ?{' '}
                  <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>
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
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    height: 60,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  loginLinkText: {
    fontSize: 15,
  },
});

export default RegisterScreen;