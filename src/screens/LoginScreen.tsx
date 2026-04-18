//src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView 
} from 'react-native';
import { typography, colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '../components/common/CustomInput';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        setErrorMessage('');
        
        if (!loginIdentifier || !password) {
            setErrorMessage('Veuillez remplir tous les champs');
            return;
        }

        setIsSubmitting(true);
        try {
            await login({ login: loginIdentifier, password });
        } catch (error: any) {
            setErrorMessage(error.message || 'Identifiants incorrects');
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
                    <Text style={styles.title}>CONNEXION</Text>
                    <Text style={styles.subtitle}>Heureux de vous revoir</Text>

                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <CustomInput
                            value={loginIdentifier}
                            onChangeText={setLoginIdentifier}
                            placeholder="Pseudo ou Email"
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
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>{isSubmitting ? 'VERIFICATION...' : 'SE CONNECTER'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.registerLink} 
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.registerLinkText}>
                            Nouveau ici ? <Text style={styles.registerLinkHighlight}>Creer un compte</Text>
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
    registerLink: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    registerLinkText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: colors.sand,
        opacity: 0.8,
    },
    registerLinkHighlight: {
        color: colors.coral,
        fontFamily: 'Poppins_700Bold',
    },
});