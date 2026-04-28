//src/components/chat/MessageList.tsx
import React from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import MessageBubble from './MessageBubble';
import { colors, spacing } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface MessageListProps {
    messages: any[];
    isLoading: boolean;
    onLongPress: (item: any) => void;
    onImagePress: (url: string) => void;
    isTyping?: boolean;
    friendName: string;
}

export default function MessageList({ 
    messages, 
    isLoading, 
    onLongPress, 
    onImagePress,
    isTyping,
    friendName
}: MessageListProps) {
    const { user } = useAuth();
    const { themeColors } = useTheme();

    if (isLoading && messages.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.coral} />
            </View>
        );
    }

    return (
        <FlatList
            data={messages}
            inverted
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <MessageBubble 
                    item={item} 
                    isMe={(item.sender?._id || item.sender) === user?.id}
                    onLongPress={onLongPress}
                    onImagePress={onImagePress}
                />
            )}
            ListHeaderComponent={() => isTyping ? (
                <View style={styles.typingContainer}>
                    <Text style={[styles.typingText, { color: themeColors.textSecondary }]}>
                        {friendName} est en train d'écrire...
                    </Text>
                </View>
            ) : null}
            keyboardShouldPersistTaps="handled"
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: spacing.md,
    },
    typingContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    typingText: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        fontStyle: 'italic',
    },
});
