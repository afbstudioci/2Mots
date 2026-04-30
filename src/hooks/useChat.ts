import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutAnimation } from 'react-native';
import api from '../services/api';
import { useSocket } from './useSocket';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const messageCache: Record<string, any[]> = {};

export const prefetchChat = async (friendId: string) => {
    try {
        const response = await api.get(`/chat/history/${friendId}`);
        messageCache[friendId] = response.data.data || [];
        return messageCache[friendId];
    } catch (error) {
        console.error(`[CHAT] Erreur de préchargement pour ${friendId}:`, error);
        return [];
    }
};

export const useChat = (friendId: string) => {
    const { user } = useAuth();
    const { subscribe, sendMessage, startTyping, stopTyping, editMessage: socketEdit, deleteMessage: socketDelete, toggleReaction: socketReaction, markAsRead: socketRead } = useSocket();
    const { updateUnreadCount } = useData();

    const [messages, setMessages] = useState<any[]>(messageCache[friendId] || []);
    const [isLoading, setIsLoading] = useState(!messageCache[friendId]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    const fetchHistory = useCallback(async () => {
        try {
            if (!messageCache[friendId]) setIsLoading(true);
            const response = await api.get(`/chat/history/${friendId}`);
            const data = response.data.data || [];
            setMessages(data);
            messageCache[friendId] = data;
        } catch (error) {
            console.error('[CHAT] Erreur historique:', error);
        } finally {
            setIsLoading(false);
        }
    }, [friendId]);

    const markRead = useCallback(async () => {
        try {
            await api.post(`/chat/read/${friendId}`);
            socketRead(friendId);
            updateUnreadCount();
        } catch (error) {
            console.error('[CHAT] Erreur de lecture:', error);
        }
    }, [friendId]);

    useEffect(() => {
        fetchHistory();
        markRead();

        const unsubMsg = subscribe('receive_message', (msg) => {
            const senderId = msg.sender?._id || msg.sender;
            if (senderId.toString() === friendId.toString()) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setMessages(prev => {
                    if (prev.some(m => m && m._id === msg._id)) return prev;
                    const newMessages = [msg, ...prev];
                    messageCache[friendId] = newMessages;
                    return newMessages;
                });
                markRead();
            }
        });

        const unsubSent = subscribe('message_sent', (savedMsg) => {
            setMessages(prev => {
                const newMessages = prev.map(m =>
                    (m?._id && m._id.toString().length < 24 && m.text === savedMsg.text) ? savedMsg : m
                );
                messageCache[friendId] = newMessages;
                return newMessages;
            });
        });

        const unsubTypingStart = subscribe('typing_start', (data) => {
            if (data.senderId === friendId) setIsTyping(true);
        });

        const unsubTypingStop = subscribe('typing_stop', (data) => {
            if (data.senderId === friendId) setIsTyping(false);
        });

        const unsubEdit = subscribe('message_edited', (msg) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => {
                const newMessages = prev.map(m => m._id === msg._id ? msg : m);
                messageCache[friendId] = newMessages;
                return newMessages;
            });
        });

        const unsubDelete = subscribe('message_deleted', (data) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => {
                const newMessages = prev.map(m =>
                    m._id === data.messageId ? { ...m, text: data.text, isDeletedForEveryone: true, fileUrl: null } : m
                );
                messageCache[friendId] = newMessages;
                return newMessages;
            });
        });

        const unsubReaction = subscribe('reaction_updated', (data) => {
            setMessages(prev => {
                const newMessages = prev.map(m =>
                    m._id === data.messageId ? { ...m, reactions: data.reactions } : m
                );
                messageCache[friendId] = newMessages;
                return newMessages;
            });
        });

        return () => {
            unsubMsg();
            unsubSent();
            unsubTypingStart();
            unsubTypingStop();
            unsubEdit();
            unsubDelete();
            unsubReaction();
        };
    }, [friendId]);

    const send = (text: string, type = 'text', mediaData = {}) => {
        const tempId = Date.now().toString();
        const newMsg = {
            _id: tempId,
            sender: { _id: user?._id || user?.id, login: user?.login, avatar: user?.avatar },
            text, type, ...mediaData,
            status: 'sent', createdAt: new Date().toISOString()
        };

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => {
            const newMessages = [newMsg, ...prev];
            messageCache[friendId] = newMessages;
            return newMessages;
        });

        sendMessage({
            recipientId: friendId,
            text,
            type,
            ...mediaData,
            senderName: user?.login,
            senderId: user?._id || user?.id
        });
    };

    const handleTyping = () => {
        startTyping(friendId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(friendId);
        }, 2000);
    };

    const edit = (messageId: string, text: string) => {
        socketEdit({ messageId, recipientId: friendId, text, userId: user?._id || user?.id });
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, text, isEdited: true } : m));
    };

    const remove = (messageId: string) => {
        socketDelete({ messageId, recipientId: friendId, userId: user?._id || user?.id });
    };

    const react = (messageId: string, emoji: string) => {
        socketReaction({ messageId, recipientId: friendId, emoji, userId: user?._id || user?.id });
    };

    return {
        messages,
        isLoading,
        isTyping,
        send,
        edit,
        remove,
        react,
        handleTyping,
        refresh: fetchHistory
    };
};