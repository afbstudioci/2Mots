//src/components/game/GameInputArea.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import CustomInput from '../common/CustomInput';
import { typography, colors, spacing, borderRadius } from '../../theme/theme';

interface GameInputAreaProps {
    answer: string;
    setAnswer: (val: string) => void;
    submitAnswer: () => void;
    isSubmitting: boolean;
    isAnimating: boolean;
    morphInputAnim: Animated.Value;
}

export default function GameInputArea({ 
    answer, setAnswer, submitAnswer, isSubmitting, isAnimating, morphInputAnim 
}: GameInputAreaProps) {
    return (
        <View style={styles.inputArea}>
            <Animated.View style={[styles.morphContainer, { transform: [{ scale: morphInputAnim }] }]}>
                <View style={styles.inputWrapper}>
                    <CustomInput
                        value={answer}
                        onChangeText={setAnswer}
                        placeholder="Quel est le lien ?"
                        autoCapitalize="none"
                        autoFocus={true}
                        returnKeyType="send"
                        onSubmitEditing={submitAnswer}
                        editable={!isAnimating && !isSubmitting}
                    />
                </View>
                
                <TouchableOpacity 
                    style={[styles.button, (!answer.trim() || isSubmitting || isAnimating) && styles.buttonDisabled]} 
                    onPress={submitAnswer}
                    disabled={!answer.trim() || isSubmitting || isAnimating}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? '...' : 'GO'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputArea: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl * 2 },
    morphContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(244, 238, 224, 0.05)', borderRadius: borderRadius.xl,
        padding: spacing.xs,
    },
    inputWrapper: { flex: 1, paddingRight: spacing.xs },
    button: { 
        backgroundColor: colors.coral, paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center'
    },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { ...typography.buttonPrimary, fontSize: 16 },
});