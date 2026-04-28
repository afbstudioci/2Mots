//src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutAnimation } from 'react-native';
import api from '../services/api';
import { useSocket } from './useSocket';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const useChat = (friendId: string) => {
    const { user } = useAuth();
    const { subscribe, sendMessage, startTyping, stopTyping, editMessage: socketEdit, deleteMessage: socketDelete, toggleReaction: socketReaction, markAsRead: socketRead } = useSocket();
    const { updateUnreadCount } = useData();

    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    const fetchHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/chat/history/${friendId}`);
            setMessages(response.data.data || []);
        } catch (error) {
            console.error('[CHAT] History error:', error);
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
            console.error('[CHAT] Mark read error:', error);
        }
    }, [friendId, socketRead, updateUnreadCount]);

    useEffect(() => {
        fetchHistory();
        markRead();

        const unsubMsg = subscribe('receive_message', (msg) => {
            const senderId = msg.sender?._id || msg.sender;
            if (senderId.toString() === friendId.toString()) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setMessages(prev => [msg, ...prev]);
                markRead();
            }
        });

        const unsubTypingStart = subscribe('typing_start', (data) => {
            if (data.senderId === friendId) setIsTyping(true);
        });

        const unsubTypingStop = subscribe('typing_stop', (data) => {
            if (data.senderId === friendId) setIsTyping(false);
        });

        const unsubEdit = subscribe('message_edited', (msg) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
        });

        const unsubDelete = subscribe('message_deleted', (data) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => prev.map(m => 
                m._id === data.messageId ? { ...m, text: data.text, isDeleted: true, fileUrl: null } : m
            ));
        });

        const unsubReaction = subscribe('reaction_updated', (data) => {
            setMessages(prev => prev.map(m => 
                m._id === data.messageId ? { ...m, reactions: data.reactions } : m
            ));
        });

        return () => {
            unsubMsg();
            unsubTypingStart();
            unsubTypingStop();
            unsubEdit();
            unsubDelete();
            unsubReaction();
        };
    }, [friendId, fetchHistory, markRead, subscribe]);

    const send = (text: string, type = 'text', mediaData = {}) => {
        const tempId = Date.now().toString();
        const newMsg = {
            _id: tempId,
            sender: { _id: user?.id, login: user?.login, avatar: user?.avatar },
            text, type, ...mediaData,
            status: 'sent', createdAt: new Date().toISOString()
        };
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => [newMsg, ...prev]);
        sendMessage({ recipientId: friendId, text, type, ...mediaData });
    };

    const handleTyping = () => {
        startTyping(friendId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(friendId);
        }, 2000);
    };

    const edit = (messageId: string, text: string) => {
        socketEdit({ messageId, recipientId: friendId, text });
        // Optimistic update
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, text, isEdited: true } : m));
    };

    const remove = (messageId: string) => {
        socketDelete({ messageId, recipientId: friendId });
    };

    const react = (messageId: string, emoji: string) => {
        socketReaction({ messageId, recipientId: friendId, emoji });
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
