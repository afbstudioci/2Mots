//src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextData {
    socket: Socket | null;
    sendMessage: (data: any) => void;
    startTyping: (recipientId: string) => void;
    stopTyping: (recipientId: string) => void;
    editMessage: (data: any) => void;
    deleteMessage: (data: any) => void;
    toggleReaction: (data: any) => void;
    markAsRead: (friendId: string) => void;
    subscribe: (event: string, callback: (data: any) => void) => (() => void);
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user || !SOCKET_URL) {
            if (socketRef.current) {
                console.log('[SOCKET] Déconnexion (plus d\'utilisateur)');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        if (socketRef.current) return; // Déjà connecté

        console.log('[SOCKET] Initialisation connexion unique');
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current.on('connect', () => {
            console.log('[SOCKET] Connecté au serveur');
            socketRef.current?.emit('join', user._id || user.id);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('[SOCKET] Déconnecté:', reason);
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
            const userId = user._id || user.id;
            socketRef.current.emit(event, {
                ...data,
                userId: userId,
                senderId: userId,
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
        const socket = socketRef.current;
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => {};
    };

    const contextValue = React.useMemo(() => ({
        socket: socketRef.current,
        sendMessage,
        startTyping,
        stopTyping,
        editMessage,
        deleteMessage,
        toggleReaction,
        markAsRead,
        subscribe
    }), [socketRef.current, user]); // Seul un changement de socket ou d'utilisateur déclenche une mise à jour

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => useContext(SocketContext);
