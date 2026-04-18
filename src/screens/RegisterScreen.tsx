//src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView 
} from 'react-native';
import { typography, colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PasswordValidator from '../components/auth/PasswordValidator';
import CustomInput from '../components/common/CustomInput';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: { navigation: RegisterScreenNavigationProp }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        setErrorMessage('');
        
        if (!username || !email || !password) {
            setErrorMessage('Veuillez remplir tous les champs');
            return;
        }

        const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
        if (!isPasswordValid) {
            setErrorMessage('Le mot de passe ne respecte pas les conditions');
            return;
        }

        setIsSubmitting(true);
        try {
            await register({ username, email, password });
        } catch (error: any) {
            setErrorMessage(error.message || 'Erreur lors de l\'inscription');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSpacer} />
                    
                    <Text style={styles.title}>INSCRIPTION</Text>
                    <Text style={styles.subtitle}>Rejoignez 2Mots</Text>

                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <CustomInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Pseudo (3-20 caracteres)"
                            autoCapitalize="none"
                        />
                        <CustomInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <CustomInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Mot de passe"
                            secureTextEntry={!showPassword}
                            iconName={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            onIconPress={() => setShowPassword(!showPassword)}
                        />
                        
                        <PasswordValidator password={password} />
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                        onPress={handleRegister}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>{isSubmitting ? 'CHARGEMENT...' : 'CREER LE COMPTE'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.loginLink} 
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginLinkText}>
                            Deja un compte ? <Text style={styles.loginLinkHighlight}>Se connecter</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.nightBlue,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl * 2,
    },
    headerSpacer: {
        height: spacing.xl,
    },
    title: {
        ...typography.titleLarge,
        color: colors.coral,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: 'Poppins_400Regular',
        color: colors.sand,
        opacity: 0.5,
        marginBottom: spacing.xl * 2,
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.error,
        marginBottom: spacing.md,
    },
    errorText: {
        fontFamily: 'Poppins_500Medium',
        color: colors.error,
        fontSize: 14,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    button: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.buttonPrimary,
        letterSpacing: 1,
    },
    loginLink: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    loginLinkText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: colors.sand,
        opacity: 0.8,
    },
    loginLinkHighlight: {
        color: colors.coral,
        fontFamily: 'Poppins_700Bold',
    },
});