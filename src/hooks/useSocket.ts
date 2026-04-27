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

    const sendMessage = (data: any) => {
        if (socketRef.current && user) {
            socketRef.current.emit('send_message', {
                ...data,
                senderId: user.id,
                senderName: user.login
            });
        }
    };

    const onMessageReceived = (callback: (message: any) => void) => {
        if (socketRef.current) {
            socketRef.current.on('receive_message', callback);
        }
    };

    return { sendMessage, onMessageReceived };
};
