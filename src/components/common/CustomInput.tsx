//src/components/common/CustomInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onHintPress: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function CustomInput({ 
    value, 
    onChangeText, 
    onSubmit, 
    onHintPress, 
    placeholder = "Quel est le lien ?",
    disabled = false
}: CustomInputProps) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                placeholder={placeholder}
                placeholderTextColor="rgba(26, 32, 44, 0.4)"
                editable={!disabled}
                autoCorrect={false}
                returnKeyType="done"
            />
            
            <TouchableOpacity 
                style={styles.hintButton} 
                onPress={onHintPress}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <Ionicons name="bulb" size={24} color={colors.coral} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        marginHorizontal: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        height: 60,
        ...shadows.soft(false),
    },
    input: {
        flex: 1,
        ...typography.bodyMedium,
        color: colors.nightBlue,
        height: '100%',
    },
    hintButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 127, 80, 0.1)', // Corail très transparent
        borderRadius: borderRadius.xl,
    }
});