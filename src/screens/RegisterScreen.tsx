import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { typography, colors, spacing, borderRadius, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: { navigation: RegisterScreenNavigationProp }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Erreur', 'Le mot de passe doit faire au moins 8 caracteres');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(username, email, password);
            navigation.replace('Home');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
            Alert.alert('Echec', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>INSCRIPTION</Text>
            <Text style={styles.subtitle}>Rejoignez 2Mots</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Pseudo (3-20 caracteres)"
                    placeholderTextColor="#4A5568"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#4A5568"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mot de passe (8 car. min, 1 maj., 1 chiffre)"
                    placeholderTextColor="#4A5568"
                    secureTextEntry
                />
            </View>

            <TouchableOpacity 
                style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{isSubmitting ? 'CHARGEMENT...' : 'CREER LE COMPTE'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace('Login')}>
                <Text style={styles.loginLinkText}>Deja un compte ? Se connecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.nightBlue,
        paddingHorizontal: spacing.xl,
        justifyContent: 'center',
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
    inputContainer: {
        marginBottom: spacing.xl,
    },
    input: {
        backgroundColor: '#242B3A',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: colors.sand,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    button: {
        backgroundColor: colors.coral,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.soft,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.buttonPrimary,
        letterSpacing: 1,
    },
    loginLink: {
        alignItems: 'center',
    },
    loginLinkText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: colors.sand,
        opacity: 0.6,
    },
});