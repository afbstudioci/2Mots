//src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

export const useSocket = () => {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user || !SOCKET_URL) return;

        // Connexion au serveur
        socketRef.current = io(SOCKET_URL);

        // Rejoindre la room privée
        socketRef.current.emit('join', user.id);

        socketRef.current.on('connect', () => {
            console.log('[SOCKET] Connecté au serveur');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    const emitEvent = (event: string, data: any) => {
        if (socketRef.current && user) {
            socketRef.current.emit(event, {
                ...data,
                userId: user.id,
                senderId: user.id,
                senderName: user.login
            });
        }
    };

    const sendMessage = (data: any) => emitEvent('send_message', data);
    const startTyping = (recipientId: string) => emitEvent('typing_start', { recipientId });
    const stopTyping = (recipientId: string) => emitEvent('typing_stop', { recipientId });
    const editMessage = (data: any) => emitEvent('edit_message', data);
    const deleteMessage = (data: any) => emitEvent('delete_message', data);
    const toggleReaction = (data: any) => emitEvent('toggle_reaction', data);
    const markAsRead = (friendId: string) => emitEvent('message_read', { friendId });

    const subscribe = (event: string, callback: (data: any) => void): (() => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
            return () => socketRef.current?.off(event, callback);
        }
        return () => {};
    };

    return { 
        sendMessage, 
        startTyping, 
        stopTyping, 
        editMessage, 
        deleteMessage, 
        toggleReaction, 
        markAsRead,
        subscribe,
        socket: socketRef.current
    };
};
