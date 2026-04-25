//src/components/game/GameInputArea.tsx
import React, { useState, useImperativeHandle, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, Animated } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface GameInputAreaRef {
    triggerShake: () => void;
}

interface GameInputAreaProps {
    answer: string;
    setAnswer: (text: string) => void;
    submitAnswer: () => void;
    expectedType: string;
    clue: string;
    onHintPress: () => void;
    isAnimating: boolean;
    actionRef?: React.Ref<GameInputAreaRef>;
}

export default function GameInputArea({ 
    answer, setAnswer, submitAnswer, expectedType, clue, onHintPress, isAnimating, actionRef
}: GameInputAreaProps) {
    
    const [hintUsed, setHintUsed] = useState(false);
    const [isError, setIsError] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useImperativeHandle(actionRef, () => ({
        triggerShake: () => {
            setIsError(true);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
            ]).start(() => {
                setTimeout(() => setIsError(false), 500);
            });
        }
    }));

    const handleHint = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (!hintUsed) setHintUsed(true);
        onHintPress();
    };

    const handleSubmission = () => {
        Keyboard.dismiss();
        submitAnswer();
    };

    const formatExpectedType = (type: string) => {
        if (!type) return "";
        const lower = type.toLowerCase().trim();
        const feminineTypes = ["préposition", "conjonction", "déterminant"];
        const article = feminineTypes.some(t => lower.includes(t)) ? "une" : "un";
        return `${article} ${lower}`;
    };

    return (
        <View style={styles.container}>
            {expectedType ? (
                <View style={styles.typePill}>
                    <Ionicons name="information-circle" size={16} color={colors.nightBlue} />
                    <Text style={styles.typeText}>
                        La solution est {formatExpectedType(expectedType)}
                    </Text>
                </View>
            ) : null}

            <Animated.View 
                style={[
                    styles.inputWrapper, 
                    { transform: [{ translateX: shakeAnim }] },
                    isError && styles.inputWrapperError
                ]}
            >
                <TextInput
                    style={styles.input}
                    value={answer}
                    onChangeText={setAnswer}
                    onSubmitEditing={handleSubmission}
                    placeholder="Quel est le lien ?"
                    placeholderTextColor="rgba(26, 32, 44, 0.4)"
                    editable={!isAnimating}
                    autoCorrect={false}
                    returnKeyType="send"
                />
                
                <TouchableOpacity 
                    style={[
                        styles.sendButton, 
                        isAnimating && styles.sendButtonDisabled,
                        isError && { backgroundColor: colors.coral }
                    ]} 
                    onPress={handleSubmission} 
                    activeOpacity={0.8} 
                    disabled={isAnimating}
                >
                    <Ionicons 
                        name={isError ? "close" : "arrow-forward"} 
                        size={24} 
                        color={colors.white} 
                    />
                </TouchableOpacity>
            </Animated.View>

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
        paddingBottom: spacing.xl,
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
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputWrapperError: {
        borderColor: colors.coral,
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
    sendButtonDisabled: {
        backgroundColor: colors.sand,
        opacity: 0.5,
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