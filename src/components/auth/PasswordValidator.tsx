//src/components/auth/PasswordValidator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/theme';

interface PasswordValidatorProps {
    password: string;
}

export default function PasswordValidator({ password }: PasswordValidatorProps) {
    const rules = [
        { id: 'length', label: 'Au moins 8 caracteres', isValid: password.length >= 8 },
        { id: 'uppercase', label: 'Au moins une majuscule', isValid: /[A-Z]/.test(password) },
        { id: 'number', label: 'Au moins un chiffre', isValid: /[0-9]/.test(password) },
    ];

    // Ne s'affiche que si l'utilisateur a commence a taper
    if (password.length === 0) return null;

    return (
        <View style={styles.container}>
            {rules.map((rule) => (
                <View key={rule.id} style={styles.ruleRow}>
                    <View style={[styles.indicator, rule.isValid ? styles.indicatorValid : styles.indicatorInvalid]} />
                    <Text style={[styles.ruleText, rule.isValid && styles.ruleTextValid]}>
                        {rule.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.xs,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    indicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.5,
        marginRight: spacing.sm,
    },
    indicatorValid: {
        borderColor: colors.success,
        backgroundColor: colors.success,
    },
    indicatorInvalid: {
        borderColor: '#4A5568',
        backgroundColor: 'transparent',
    },
    ruleText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#4A5568',
    },
    ruleTextValid: {
        color: colors.success,
    },
});