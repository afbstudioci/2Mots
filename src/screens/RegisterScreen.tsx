import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '../components/common/CustomInput';
import PasswordValidator from '../components/auth/PasswordValidator';
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: { navigation: RegisterScreenNavigationProp }) {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register } = useAuth();
    const { themeColors } = useTheme();

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const keyboardEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const keyboardSubscription = Keyboard.addListener(keyboardEvent, () => {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        return () => {
            keyboardSubscription.remove();
        };
    }, []);

    const handleRegister = async () => {
        setErrorMessage('');
        
        if (!loginIdentifier || !email || !password) {
            setErrorMessage('Veuillez remplir tous les champs');
            return;
        }

        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            await register({ login: loginIdentifier, email, password });
        } catch (error: any) {
            setErrorMessage(error.message || "Erreur lors de l'inscription");
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: themeColors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {isSubmitting && <ServerWakeUpLoader />}

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={[styles.title, { color: themeColors.primary }]}>INSCRIPTION</Text>
                        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Rejoignez l'aventure 2Mots</Text>

                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputContainer}>
                            <CustomInput
                                value={loginIdentifier}
                                onChangeText={setLoginIdentifier}
                                placeholder="Pseudo"
                                autoCapitalize="none"
                            />
                            <CustomInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
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
                            <Text style={styles.buttonText}>S'INSCRIRE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.loginLinkText, { color: themeColors.textSecondary }]}>
                                Déjà un compte ? <Text style={styles.loginLinkHighlight}>Se connecter</Text>
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl * 2,
    },
    title: {
        ...typography.titleLarge,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: 'Poppins_400Regular',
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
        marginBottom: spacing.xs,
    },
    button: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginTop: spacing.lg,
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
    },
    loginLinkHighlight: {
        color: colors.coral,
        fontFamily: 'Poppins_700Bold',
    },
});