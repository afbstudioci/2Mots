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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import AuthInput from '../components/auth/AuthInput';
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';
import PasswordValidator from '../components/auth/PasswordValidator';
import { borderRadius, spacing } from '../theme/theme';
import { useKeyboard } from '../hooks/useKeyboard';

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
        message: 'Veuillez remplir tous les champs.',
        type: 'error',
      });
      return;
    }

    const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    if (!isPasswordValid) {
      setAlert({
        visible: true,
        title: 'Sécurité',
        message: 'Le mot de passe ne respecte pas les critères.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await register({ login, email, password });
      // On n'appelle plus navigation.navigate('Login') ici car l'utilisateur est auto-connecté
      setAlert({
        visible: true,
        title: 'Succès',
        message: 'Compte créé avec succès !',
        type: 'success',
      });
    } catch (err: any) {
      setAlert({
        visible: true,
        title: 'Erreur',
        message: err.message || 'Erreur lors de l\'inscription.',
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
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {!isKeyboardVisible && (
              <View style={styles.header}>
                <Text style={[styles.logoText, { color: themeColors.primary }]}>S'INSCRIRE</Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Rejoignez la communauté.
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <AuthInput
                label="Pseudo"
                placeholder="Votre pseudo"
                value={formData.login}
                onChangeText={(text) => setFormData({ ...formData, login: text })}
              />
              <AuthInput
                label="Email"
                placeholder="votre@email.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />
              <AuthInput
                label="Mot de passe"
                placeholder="Mot de passe sécurisé"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                isPassword
              />

              <PasswordValidator password={formData.password} />

              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: themeColors.primary }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>Créer mon compte</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                <Text style={[styles.loginLinkText, { color: themeColors.textSecondary }]}>
                  Déjà un compte ? <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>Se connecter</Text>
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
  mainContainer: { flex: 1, paddingHorizontal: 24, paddingVertical: 15, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  form: { width: '100%' },
  registerButton: { height: 55, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  loginLink: { marginTop: 15, alignItems: 'center', paddingBottom: 10 },
  loginLinkText: { fontSize: 14 }
});

export default RegisterScreen;