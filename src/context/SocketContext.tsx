import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import { getToken } from '../services/authStorage';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: Set<string>;
  isUserOnline: (targetUserId?: string) => boolean;
  emit: (event: string, data: any) => void;
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
  const [socketInstance, setSocketInstance] = useState<Socket | null>(socketService.getSocket());
  const [isConnected, setIsConnected] = useState<boolean>(socketService.isSocketConnected());
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubStatus = socketService.onStatusChange((connected) => {
      setIsConnected(connected);
      setSocketInstance(socketService.getSocket());
      if (connected) {
        socketService.emit('get_online_users', (ids: string[]) => {
          if (Array.isArray(ids)) {
            setOnlineUserIds(new Set(ids.map(String)));
          }
        });
      }
    });

    const handlePresence = (data: { userId: string; isOnline: boolean }) => {
      if (!data?.userId) return;
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (data.isOnline) {
          next.add(String(data.userId));
        } else {
          next.delete(String(data.userId));
        }
        return next;
      });
    };

    socketService.on('user_presence_change', handlePresence);

    return () => {
      unsubStatus();
      socketService.off('user_presence_change', handlePresence);
    };
  }, []);

  const isUserOnline = useCallback(
    (targetUserId?: string) => {
      if (!targetUserId) return false;
      return onlineUserIds.has(String(targetUserId));
    },
    [onlineUserIds]
  );

  const initSocket = useCallback(async () => {
    if (!userId) {
      socketService.disconnect();
      return;
    }
    const token = await getToken();
    socketService.connect(userId, token || undefined);
    setSocketInstance(socketService.getSocket());
  }, [userId]);

  // Connexion initiale ou au changement d'utilisateur
  useEffect(() => {
    initSocket();
  }, [initSocket]);

  // Auto-reconnexion lors du retour au premier plan (Foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && userId) {
        if (!socketService.isSocketConnected() || !socketService.getSocket()?.connected) {
          initSocket();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [userId, initSocket]);

  const emit = useCallback((event: string, data: any) => {
    socketService.emit(event, data);
  }, []);

  const emitUserEvent = useCallback(
    (event: string, data: any) => {
      if (user) {
        const uId = user._id || user.id;
        socketService.emit(event, {
          ...data,
          userId: uId,
          senderId: uId,
          senderName: user.login,
        });
      }
    },
    [user]
  );

  const sendMessage = useCallback((data: any) => emitUserEvent('send_message', data), [emitUserEvent]);
  const startTyping = useCallback((recipientId: string) => emitUserEvent('typing_start', { recipientId }), [emitUserEvent]);
  const stopTyping = useCallback((recipientId: string) => emitUserEvent('typing_stop', { recipientId }), [emitUserEvent]);
  const editMessage = useCallback((data: any) => emitUserEvent('edit_message', data), [emitUserEvent]);
  const deleteMessage = useCallback((data: any) => emitUserEvent('delete_message', data), [emitUserEvent]);
  const toggleReaction = useCallback((data: any) => emitUserEvent('toggle_reaction', data), [emitUserEvent]);
  const markAsRead = useCallback((friendId: string) => emitUserEvent('message_read', { friendId }), [emitUserEvent]);

  const subscribe = useCallback((event: string, callback: (data: any) => void): (() => void) => {
    socketService.on(event, callback);
    return () => socketService.off(event, callback);
  }, []);

  const contextValue = useMemo(
    () => ({
      socket: socketInstance,
      isConnected,
      onlineUserIds,
      isUserOnline,
      emit,
      sendMessage,
      startTyping,
      stopTyping,
      editMessage,
      deleteMessage,
      toggleReaction,
      markAsRead,
      subscribe,
    }),
    [socketInstance, isConnected, onlineUserIds, isUserOnline, emit, sendMessage, startTyping, stopTyping, editMessage, deleteMessage, toggleReaction, markAsRead, subscribe]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);