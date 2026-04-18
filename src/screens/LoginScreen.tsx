import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { typography, colors, spacing, borderRadius, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        setIsSubmitting(true);
        try {
            await login(username, password);
            navigation.replace('Home');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur de connexion au serveur';
            Alert.alert('Echec', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CONNEXION</Text>
            <Text style={styles.subtitle}>Entrez vos identifiants</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Pseudo ou Email"
                    placeholderTextColor="#4A5568"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mot de passe"
                    placeholderTextColor="#4A5568"
                    secureTextEntry
                />
            </View>

            <TouchableOpacity 
                style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isSubmitting}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{isSubmitting ? 'CHARGEMENT...' : 'ENTRER'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerLink} onPress={() => navigation.replace('Register')}>
                <Text style={styles.registerLinkText}>Pas de compte ? S'inscrire</Text>
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
        ...shadows.soft,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.buttonPrimary,
        letterSpacing: 2,
    },
    registerLink: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    registerLinkText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: colors.sand,
        opacity: 0.6,
    },
});