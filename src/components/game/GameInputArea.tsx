//src/components/game/GameInputArea.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface GameInputAreaProps {
    answer: string;
    setAnswer: (text: string) => void;
    submitAnswer: () => void;
    isSubmitting: boolean;
    isAnimating: boolean;
    morphInputAnim: Animated.Value;
}

export default function GameInputArea({ 
    answer, 
    setAnswer, 
    submitAnswer, 
    isSubmitting, 
    isAnimating, 
    morphInputAnim 
}: GameInputAreaProps) {
    
    const handleHint = () => {
        // La logique d'indice sera branchée ici si besoin
    };

    return (
        <Animated.View style={[
            styles.container, 
            { transform: [{ scale: morphInputAnim }] }
        ]}>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={answer}
                    onChangeText={setAnswer}
                    onSubmitEditing={submitAnswer}
                    placeholder="Quel est le lien ?"
                    placeholderTextColor="rgba(26, 32, 44, 0.4)"
                    editable={!isSubmitting && !isAnimating}
                    autoCorrect={false}
                    returnKeyType="done"
                />
                
                <TouchableOpacity 
                    style={styles.hintButton} 
                    onPress={handleHint}
                    activeOpacity={0.7}
                    disabled={isSubmitting || isAnimating}
                >
                    <Ionicons name="bulb" size={24} color={colors.coral} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
        backgroundColor: colors.sand,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        paddingLeft: spacing.lg,
        paddingRight: spacing.xs,
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
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 127, 80, 0.1)', 
        borderRadius: borderRadius.xl,
        marginLeft: spacing.sm,
    }
});