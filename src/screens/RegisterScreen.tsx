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
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import AuthInput from '../components/auth/AuthInput';
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';
import PasswordValidator from '../components/auth/PasswordValidator';
import { borderRadius } from '../theme/theme';
import { useKeyboard } from '../hooks/useKeyboard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    login: '', 
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
  
  const { isKeyboardVisible } = useKeyboard();

  const handleRegister = async () => {
    const { login, email, password } = formData;

    if (!login || !email || !password) {
      setAlert({
        visible: true,
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs pour créer votre compte.',
        type: 'error',
      });
      return;
    }

    const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    if (!isPasswordValid) {
      setAlert({
        visible: true,
        title: 'Sécurité du mot de passe',
        message: 'Votre mot de passe ne respecte pas tous les critères de sécurité affichés.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await register({ login, email, password });
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
      {loading && <ServerWakeUpLoader />}

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
            
            {!isKeyboardVisible && (
              <View style={styles.header}>
                <Text style={[styles.logoText, { color: themeColors.primary }]}>
                  S'INSCRIRE
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Rejoignez la communauté et commencez à lier les mots.
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <AuthInput
                label="Pseudo"
                placeholder="Choisissez un pseudo"
                value={formData.login}
                onChangeText={(text) => setFormData({ ...formData, login: text })}
              />

              <AuthInput
                label="Email"
                placeholder="Votre adresse email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />

              <AuthInput
                label="Mot de passe"
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                isPassword
              />

              <PasswordValidator password={formData.password} />

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>Créer mon compte</Text>
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
    paddingVertical: 20, // Réduit pour donner de la marge en haut et en bas
    justifyContent: 'center', // Centre parfaitement le contenu
  },
  header: {
    alignItems: 'center',
    marginBottom: 24, // Réduit
    marginTop: 10, // Réduit
  },
  logoText: {
    fontSize: 34, // Légèrement réduit pour respirer
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14, // Réduit
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    height: 55, // Hauteur affinée
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
    fontSize: 17, // Réduit légèrement
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20, // Évite la collision avec la barre de navigation du téléphone
  },
  loginLinkText: {
    fontSize: 14,
  },
});

export default RegisterScreen;