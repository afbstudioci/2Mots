// src/screens/ResetPasswordScreen.tsx
// ECRAN DE VALIDATION DE L'OTP ET DEFINITION DU NOUVEAU MOT DE PASSE
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

const ResetPasswordScreen = ({ route, navigation }: any) => {
  const { themeColors } = useTheme();
  const initialEmail = route.params?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleReset = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setAlert({ visible: true, title: 'Email requis', message: 'Veuillez renseigner votre email.', type: 'error' });
      return;
    }
    if (cleanOtp.length !== 6) {
      setAlert({ visible: true, title: 'Code invalide', message: 'Le code doit comporter 6 chiffres.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setAlert({ visible: true, title: 'Mot de passe trop court', message: 'Le mot de passe doit comporter au moins 8 caractères.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ visible: true, title: 'Mots de passe différents', message: 'Les mots de passe ne correspondent pas.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email: cleanEmail, otp: cleanOtp, newPassword });
      const msg = response.data?.message || 'Votre mot de passe a été réinitialisé avec succès.';
      setAlert({
        visible: true,
        title: 'Succès',
        message: msg,
        type: 'success',
        onCloseCallback: () => navigation.navigate('Login'),
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Le code est invalide ou a expiré.';
      setAlert({ visible: true, title: 'Échec de la validation', message: errMsg, type: 'error' });
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.mainContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.primary }]}>NOUVEAU MOT DE PASSE</Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Saisissez le code à 6 chiffres reçu par email ainsi que votre nouveau mot de passe.
              </Text>
            </View>

            <View style={styles.form}>
              {!initialEmail && (
                <AuthInput
                  label="Adresse Email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}

              <AuthInput
                label="Code de sécurité à 6 chiffres"
                placeholder="Ex: 123456"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />

              <AuthInput
                label="Nouveau mot de passe"
                placeholder="Au moins 8 caractères"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
              />

              <AuthInput
                label="Confirmer le mot de passe"
                placeholder="Répétez le nouveau mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />

              <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.85} style={styles.btnWrapper}>
                <LinearGradient colors={[colors.coral, '#FF8C66']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitButton}>
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Valider le mot de passe</Text>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginLeft: spacing.sm }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.resendLink}>
                <Text style={[styles.resendText, { color: themeColors.textSecondary }]}>
                  Vous n'avez pas reçu le code ?{' '}
                  <Text style={{ color: themeColors.primary, fontFamily: 'Poppins_700Bold' }}>Renvoyer</Text>
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
  backButton: { alignSelf: 'flex-start', padding: spacing.xs, marginBottom: spacing.md },
  header: { alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'Poppins_900Black', fontSize: 26, letterSpacing: 0.5 },
  subtitle: { fontFamily: 'Poppins_500Medium', fontSize: 13, lineHeight: 20, marginTop: 6 },
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
  submitButtonText: { fontFamily: 'Poppins_700Bold', color: '#FFF', fontSize: 16, letterSpacing: 0.5 },
  resendLink: { marginTop: 20, alignItems: 'center', paddingBottom: 10 },
  resendText: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
});

export default ResetPasswordScreen;
