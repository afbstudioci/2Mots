//src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import { getToken } from '../services/authStorage';

interface SocketContextData {
  socket: Socket | null;
  sendMessage: (data: any) => void;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
  editMessage: (data: any) => void;
  deleteMessage: (data: any) => void;
  toggleReaction: (data: any) => void;
  markAsRead: (friendId: string) => void;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) {
      socketService.disconnect();
      return;
    }

    const initSocket = async () => {
      const token = await getToken();
      socketService.connect(userId, token || undefined);
    };

    initSocket();
  }, [userId]);

  const emitEvent = (event: string, data: any) => {
    if (user) {
      const uId = user._id || user.id;
      socketService.emit(event, {
        ...data,
        userId: uId,
        senderId: uId,
        senderName: user.login,
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
    socketService.on(event, callback);
    return () => socketService.off(event, callback);
  };

  const contextValue = useMemo(
    () => ({
      socket: socketService.getSocket(),
      sendMessage,
      startTyping,
      stopTyping,
      editMessage,
      deleteMessage,
      toggleReaction,
      markAsRead,
      subscribe,
    }),
    [userId]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);