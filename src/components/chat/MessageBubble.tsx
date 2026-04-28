//src/components/chat/MessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import AudioBubble from './AudioBubble';

interface MessageBubbleProps {
    item: any;
    isMe: boolean;
    onLongPress: (item: any) => void;
    onImagePress: (url: string) => void;
    replyContext?: any;
}

export default function MessageBubble({ item, isMe, onLongPress, onImagePress, replyContext }: MessageBubbleProps) {
    const { themeColors } = useTheme();

    const renderContent = () => {
        if (item.isDeleted) {
            return (
                <Text style={[styles.bubbleText, styles.deletedText, { color: isMe ? 'rgba(255,255,255,0.6)' : themeColors.textSecondary }]}>
                    Ce message a été supprimé
                </Text>
            );
        }

        switch (item.type) {
            case 'image':
                return (
                    <TouchableOpacity onPress={() => onImagePress(item.fileUrl)} activeOpacity={0.9}>
                        <Image source={{ uri: item.fileUrl }} style={styles.bubbleImage} />
                    </TouchableOpacity>
                );
            case 'audio':
                return <AudioBubble uri={item.fileUrl} isMe={isMe} duration={item.duration} />;
            default:
                return (
                    <Text style={[styles.bubbleText, { color: isMe ? colors.white : themeColors.text }]}>
                        {item.text}
                    </Text>
                );
        }
    };

    return (
        <View style={[styles.container, isMe ? styles.myContainer : styles.friendContainer]}>
            <TouchableOpacity 
                onLongPress={() => !item.isDeleted && onLongPress(item)}
                activeOpacity={0.8}
                style={[
                    styles.bubble,
                    { 
                        backgroundColor: isMe ? colors.coral : themeColors.surface,
                        borderBottomRightRadius: isMe ? 4 : 20,
                        borderBottomLeftRadius: isMe ? 20 : 4,
                    },
                    !isMe && shadows.soft(false)
                ]}
            >
                {/* Reply Context */}
                {item.replyTo && (
                    <View style={[styles.replyBox, { backgroundColor: isMe ? 'rgba(0,0,0,0.1)' : themeColors.overlayLight }]}>
                        <View style={[styles.replyBar, { backgroundColor: colors.coral }]} />
                        <Text style={[styles.replyText, { color: isMe ? colors.white : themeColors.text }]} numberOfLines={2}>
                            {item.replyTo.text || 'Média'}
                        </Text>
                    </View>
                )}

                {renderContent()}

                <View style={styles.meta}>
                    {item.isEdited && !item.isDeleted && (
                        <Text style={[styles.edited, { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }]}>
                            Modifié
                        </Text>
                    )}
                    <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && (
                        <Ionicons 
                            name={item.read ? "checkmark-done" : "checkmark"} 
                            size={14} 
                            color={item.read ? colors.mint : 'rgba(255,255,255,0.6)'} 
                            style={styles.checkIcon} 
                        />
                    )}
                </View>

                {/* Reactions */}
                {item.reactions && item.reactions.length > 0 && (
                    <View style={[styles.reactionsContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                        {item.reactions.map((r: any, idx: number) => (
                            <Text key={idx} style={styles.reactionEmoji}>{r.emoji}</Text>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
    },
    myContainer: { justifyContent: 'flex-end' },
    friendContainer: { justifyContent: 'flex-start' },
    bubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 20,
        position: 'relative',
    },
    bubbleText: {
        fontSize: 15,
        fontFamily: 'Poppins_500Medium',
        lineHeight: 22,
    },
    deletedText: {
        fontStyle: 'italic',
        fontSize: 13,
    },
    bubbleImage: {
        width: 220,
        height: 220,
        borderRadius: 12,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    edited: {
        fontSize: 10,
        fontFamily: 'Poppins_400Regular',
        marginRight: 6,
    },
    time: {
        fontSize: 10,
        fontFamily: 'Poppins_400Regular',
    },
    checkIcon: {
        marginLeft: 4,
    },
    replyBox: {
        flexDirection: 'row',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    replyBar: {
        width: 3,
        height: '100%',
        marginRight: 8,
    },
    replyText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        opacity: 0.8,
    },
    reactionsContainer: {
        position: 'absolute',
        bottom: -15,
        right: 10,
        flexDirection: 'row',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        ...shadows.soft(false),
    },
    reactionEmoji: {
        fontSize: 12,
    },
});
