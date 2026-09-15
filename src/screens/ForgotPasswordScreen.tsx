// src/screens/ForgotPasswordScreen.tsx
// ECRAN DE DEMANDE DE CODE OTP (MOT DE PASSE OUBLIE)
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import AuthInput from '../components/auth/AuthInput';
import CustomAlert from '../components/common/CustomAlert';
import api from '../services/api';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { themeColors } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
    onCloseCallback?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const handleSendCode = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setAlert({
        visible: true,
        title: 'Email invalide',
        message: 'Veuillez saisir une adresse email valide.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: cleanEmail });
      const msg =
        response.data?.message ||
        'Si cette adresse est enregistrée, un email contenant votre code de sécurité vient d\'être envoyé.';

      setAlert({
        visible: true,
        title: 'Code de sécurité envoyé',
        message: `${msg} Pensez à vérifier vos courriers indésirables (spams).`,
        type: 'success',
        onCloseCallback: () => {
          navigation.navigate('ResetPassword', { email: cleanEmail });
        },
      });
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Impossible de traiter la demande pour le moment.';
      setAlert({
        visible: true,
        title: 'Échec de la demande',
        message: errMsg,
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.primary }]}>
                MOT DE PASSE OUBLIÉ
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Saisissez votre adresse email. Nous vous enverrons un code de validation temporaire à 6 chiffres.
              </Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Adresse Email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={loading}
                activeOpacity={0.85}
                style={styles.btnWrapper}
              >
                <LinearGradient
                  colors={[colors.coral, '#FF8C66']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Envoyer le code</Text>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#FFF"
                        style={{ marginLeft: spacing.sm }}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.loginLink}
              >
                <Text style={[styles.loginLinkText, { color: themeColors.textSecondary }]}>
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Text style={{ color: themeColors.primary, fontFamily: 'Poppins_700Bold' }}>
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
        onClose={() => {
          const callback = alert.onCloseCallback;
          setAlert({ ...alert, visible: false, onCloseCallback: undefined });
          if (callback) callback();
        }}
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
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Poppins_900Black',
    fontSize: 28,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  form: { width: '100%' },
  btnWrapper: { marginTop: spacing.md },
  submitButton: {
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
  submitButtonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loginLink: { marginTop: 24, alignItems: 'center', paddingBottom: 10 },
  loginLinkText: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
});

export default ForgotPasswordScreen;
