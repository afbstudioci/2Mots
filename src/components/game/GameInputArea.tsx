import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface GameInputAreaProps {
    answer: string;
    setAnswer: (text: string) => void;
    submitAnswer: () => void;
    expectedType: string;
    clue: string;
    onHintPress: () => void;
    isAnimating: boolean;
}

export default function GameInputArea({ 
    answer, setAnswer, submitAnswer, expectedType, clue, onHintPress, isAnimating
}: GameInputAreaProps) {
    
    const [hintUsed, setHintUsed] = useState(false);

    const handleHint = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Vibration forte
        if (!hintUsed) setHintUsed(true);
        onHintPress();
    };

    const formatExpectedType = (type: string) => {
        if (!type) return "";
        const lower = type.toLowerCase();
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const article = vowels.includes(lower.charAt(0)) ? "une" : "un";
        return `${article} ${lower}`;
    };

    return (
        <View style={styles.container}>
            {/* Indication de la nature du mot (Pilule visible) */}
            {expectedType ? (
                <View style={styles.typePill}>
                    <Ionicons name="information-circle" size={16} color={colors.nightBlue} />
                    <Text style={styles.typeText}>
                        La solution est {formatExpectedType(expectedType)}
                    </Text>
                </View>
            ) : null}

            {/* Zone de saisie + Bouton Envoyer */}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={answer}
                    onChangeText={setAnswer}
                    onSubmitEditing={submitAnswer}
                    placeholder="Quel est le lien ?"
                    placeholderTextColor="rgba(26, 32, 44, 0.4)"
                    editable={!isAnimating}
                    autoCorrect={false}
                    returnKeyType="done"
                />
                
                <TouchableOpacity style={styles.sendButton} onPress={submitAnswer} activeOpacity={0.8} disabled={isAnimating}>
                    <Ionicons name="arrow-forward" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Bouton Indice Logique (Style Carte) */}
            <TouchableOpacity style={styles.hintCard} onPress={handleHint} activeOpacity={0.7} disabled={isAnimating}>
                <Ionicons name="bulb" size={22} color={colors.coral} />
                <Text style={styles.hintText}>
                    {hintUsed && clue ? clue : "Indice logique"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl, // Remonté et sécurisé pour le clavier
    },
    typePill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
    },
    typeText: {
        ...typography.bodySmall,
        color: colors.white,
        marginLeft: spacing.xs,
        fontWeight: '700',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        paddingLeft: spacing.lg,
        paddingRight: spacing.xs,
        height: 60,
        ...shadows.float(),
    },
    input: {
        flex: 1,
        ...typography.bodyMedium,
        color: colors.nightBlue,
        height: '100%',
    },
    sendButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.coral,
        borderRadius: borderRadius.xl,
    },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    hintText: {
        ...typography.bodySmall,
        color: colors.white,
        marginLeft: spacing.sm,
        fontWeight: '600',
    }
});