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

    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
            const day = dayNames[date.getDay()];
            const hour = date.getHours().toString().padStart(2, '0');
            const minute = date.getMinutes().toString().padStart(2, '0');
            return `${day} ${hour}h${minute}`;
        } else {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hour = date.getHours().toString().padStart(2, '0');
            const minute = date.getMinutes().toString().padStart(2, '0');
            return `${day}-${month}-${year} à ${hour}h${minute}`;
        }
    };

    const renderContent = () => {
        if (item?.isDeleted) {
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
                onLongPress={() => !item?.isDeleted && onLongPress(item)}
                activeOpacity={0.8}
                style={[
                    styles.bubble,
                    { 
                        backgroundColor: isMe ? colors.coral : themeColors.card,
                        borderBottomRightRadius: isMe ? 4 : 24,
                        borderBottomLeftRadius: isMe ? 24 : 4,
                        borderColor: isMe ? 'transparent' : themeColors.overlayLight,
                        borderWidth: isMe ? 0 : 1,
                    },
                    shadows.soft(false)
                ]}
            >
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
                    {item?.isEdited && !item?.isDeleted && (
                        <Text style={[styles.edited, { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }]}>
                            Modifié • 
                        </Text>
                    )}
                    <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }]}>
                        {formatMessageDate(item.createdAt)}
                    </Text>
                    {isMe && (
                        <View style={styles.statusContainer}>
                            <Ionicons 
                                name={item.status === 'read' || item.read ? "checkmark-done" : "checkmark"} 
                                size={14} 
                                color={(item.status === 'read' || item.read) ? colors.mint : 'rgba(255,255,255,0.6)'} 
                                style={styles.checkIcon} 
                            />
                        </View>
                    )}
                </View>

                {item.reactions && item.reactions.length > 0 && (
                    <View style={[styles.reactionsContainer, { backgroundColor: themeColors.card, borderColor: colors.coral + '40' }]}>
                        {item.reactions.slice(0, 3).map((r: any, idx: number) => (
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
        borderRadius: 24,
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
        borderRadius: 16,
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
    },
    time: {
        fontSize: 10,
        fontFamily: 'Poppins_500Medium',
    },
    statusContainer: {
        marginLeft: 4,
    },
    checkIcon: {
        marginLeft: 2,
    },
    replyBox: {
        flexDirection: 'row',
        padding: 8,
        borderRadius: 12,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        ...shadows.soft(false),
    },
    reactionEmoji: {
        fontSize: 12,
        marginHorizontal: 1,
    },
});
