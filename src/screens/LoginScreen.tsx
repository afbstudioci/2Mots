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
import ServerWakeUpLoader from '../components/auth/ServerWakeUpLoader';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useAuth();
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

    const handleLogin = async () => {
        setErrorMessage('');
        
        if (!loginIdentifier || !password) {
            setErrorMessage('Veuillez remplir tous les champs');
            return;
        }

        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            await login({ login: loginIdentifier, password });
        } catch (error: any) {
            setErrorMessage(error.message || 'Identifiants incorrects');
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
                        <Text style={[styles.title, { color: themeColors.primary }]}>CONNEXION</Text>
                        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Heureux de vous revoir</Text>

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
                            style={styles.forgotPasswordLink}
                            onPress={() => {}}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.forgotPasswordText, { color: themeColors.textSecondary }]}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>SE CONNECTER</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.registerLink} 
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.registerLinkText, { color: themeColors.textSecondary }]}>
                                Nouveau ici ? <Text style={styles.registerLinkHighlight}>Créer un compte</Text>
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
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
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
    },
    registerLinkHighlight: {
        color: colors.coral,
        fontFamily: 'Poppins_700Bold',
    },
});