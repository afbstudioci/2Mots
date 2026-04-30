//src/components/game/GameInputArea.tsx
import React, { useState, useImperativeHandle, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

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
    playHint: () => void;
    isAnimating: boolean;
    actionRef?: React.Ref<GameInputAreaRef>;
}

export default function GameInputArea({ 
    answer, setAnswer, submitAnswer, expectedType, clue, onHintPress, playHint, isAnimating, actionRef
}: GameInputAreaProps) {
    const { themeColors } = useTheme();
    const navigation = useNavigation<any>();
    
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

    const handleSubmission = () => {
        if (!answer.trim()) return;
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
                <View style={[styles.typePill, { backgroundColor: themeColors.overlayLight }]}>
                    <Ionicons name="information-circle" size={16} color={themeColors.text} />
                    <Text style={[styles.typeText, { color: themeColors.text }]}>
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
                {/* Nouveau : Bouton Lettre intégré directement à gauche */}
                <TouchableOpacity 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        playHint(); 
                        navigation.navigate('Shop');
                    }}
                    style={[styles.hintIconBtn, { backgroundColor: colors.mint + '15' }]}
                    activeOpacity={0.7}
                >
                    <View style={[styles.hintGlow, { backgroundColor: colors.mint + '20' }]} />
                    <MaterialCommunityIcons name="magic-staff" size={26} color={colors.mint} />
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={answer}
                    onChangeText={setAnswer}
                    onSubmitEditing={handleSubmission}
                    placeholder="Quel est le lien ?"
                    placeholderTextColor="rgba(26, 32, 44, 0.4)"
                    editable={!isAnimating}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="send"
                />
                
                <TouchableOpacity 
                    style={[
                        styles.sendButton, 
                        (!answer.trim() || isAnimating) && styles.sendButtonDisabled,
                        isError && { backgroundColor: colors.coral }
                    ]} 
                    onPress={handleSubmission} 
                    activeOpacity={0.8} 
                    disabled={isAnimating || !answer.trim()}
                >
                    <Ionicons 
                        name={isError ? "close" : "arrow-forward"} 
                        size={24} 
                        color={colors.white} 
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* L'indice logique mis en évidence */}
            {clue ? (
                <View style={[styles.logicalHintContainer, { backgroundColor: themeColors.overlayLight, borderColor: themeColors.overlayMedium }]}>
                    <Ionicons name="bulb" size={20} color={colors.coral} style={{ marginRight: spacing.sm }} />
                    <Text style={[styles.hintText, { color: themeColors.text }]}>{clue}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
    },
    typePill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.sm,
    },
    typeText: {
        ...typography.bodySmall,
        fontSize: 11,
        marginLeft: spacing.xs,
        fontWeight: '700',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        paddingLeft: spacing.sm,
        paddingRight: spacing.xs,
        height: 54,
        ...shadows.float(false),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputWrapperError: {
        borderColor: colors.coral,
    },
    hintIconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.mint + '30',
        marginRight: 4,
    },
    hintGlow: {
        position: 'absolute',
        width: 34,
        height: 34,
        borderRadius: 17,
        opacity: 0.5,
    },
    input: {
        flex: 1,
        ...typography.bodyMedium,
        fontSize: 14,
        color: colors.nightBlue,
        height: '100%',
        paddingHorizontal: spacing.sm,
    },
    sendButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.coral,
        borderRadius: borderRadius.xl,
    },
    sendButtonDisabled: {
        backgroundColor: colors.sand,
        opacity: 0.5,
    },
    logicalHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    hintText: {
        ...typography.bodySmall,
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    }
});