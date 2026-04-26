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
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import AuthInput from '../components/auth/AuthInput';
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';
import { borderRadius } from '../theme/theme';
import { useKeyboard } from '../hooks/useKeyboard';

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

  const { login } = useAuth();
  const { themeColors } = useTheme();
  
  // Utilisation de notre hook pour surveiller le clavier
  const { isKeyboardVisible } = useKeyboard();

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
      {loading && <ServerWakeUpLoader />}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.mainContainer}>
            
            {/* Le bloc header disparaît si le clavier est actif pour libérer la place */}
            {!isKeyboardVisible && (
              <View style={styles.header}>
                <Text style={[styles.logoText, { color: themeColors.primary }]}>
                  SE CONNECTER
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Le jeu de réflexion où chaque lien compte.
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <AuthInput
                label="Email ou Pseudo"
                placeholder="Entrez votre identifiant"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                // onFocus={scrollToInput} a été supprimé pour laisser faire le KeyboardAvoidingView
              />

              <AuthInput
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChangeText={setPassword}
                isPassword
              />

              <TouchableOpacity 
                onPress={() => {/* Navigation vers récupération */}}
                style={styles.forgotPassword}
              >
                <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={[styles.registerText, { color: themeColors.textSecondary }]}>
                  Pas encore de compte ?{' '}
                  <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>
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
  },
  mainContainer: {
    flex: 1,
    // minHeight supprimé pour ne pas forcer l'étirement vers le bas
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20, // Réduit pour mieux respirer
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
    lineHeight: 22,
    maxWidth: '85%',
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 55, // Hauteur affinée
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17, // Réduit légèrement
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20, // Réduit
    alignItems: 'center',
    paddingBottom: 20, // Évite la collision avec la barre de navigation du téléphone
  },
  registerText: {
    fontSize: 14, // Réduit légèrement
  },
});

export default LoginScreen;