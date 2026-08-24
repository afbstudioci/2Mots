//src/context/DataContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from './AuthContext';

interface DataContextType {
  shopItems: any[];
  missions: any[];
  friends: any[];
  friendRequests: any[];
  leaderboard: any[];
  unreadChatCount: number;
  isLoading: boolean;
  lastRefresh: number | null;
  refreshAll: () => Promise<void>;
  updateMissions: () => Promise<void>;
  updateShop: () => Promise<void>;
  updateFriends: () => Promise<void>;
  updateFriendRequests: () => Promise<void>;
  updateLeaderboard: () => Promise<void>;
  updateUnreadCount: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DataSocketHandler = ({ updateUnreadCount }: { updateUnreadCount: () => void }) => {
  const { user } = useAuth();
  const { subscribe } = useSocket();

  useEffect(() => {
    if (!user) return;

    const unsubMsg = subscribe('receive_message', () => {
      updateUnreadCount();
    });

    const unsubRead = subscribe('messages_marked_read', () => {
      updateUnreadCount();
    });

    return () => {
      unsubMsg();
      unsubRead();
    };
  }, [user, subscribe, updateUnreadCount]);

  return null;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const updateUnreadCount = useCallback(async () => {
    if (!user) { setUnreadChatCount(0); return; }
    try {
      const response = await api.get('/chat/unread-count');
      setUnreadChatCount(response.data?.data?.unreadCount || 0);
    } catch {}
  }, [user]);

  const updateShop = useCallback(async () => {
    try {
      const response = await api.get('/shop/catalog');
      setShopItems(response.data?.data?.catalog?.kevsPacks || []);
    } catch {}
  }, []);

  const updateMissions = useCallback(async () => {
    if (!user) { setMissions([]); return; }
    try {
      const response = await api.get('/missions');
      setMissions(response.data?.data || []);
    } catch {}
  }, [user]);

  const updateFriends = useCallback(async () => {
    if (!user) { setFriends([]); return; }
    try {
      const response = await api.get('/friends');
      setFriends(response.data?.data || []);
    } catch {}
  }, [user]);

  const updateFriendRequests = useCallback(async () => {
    if (!user) { setFriendRequests([]); return; }
    try {
      const response = await api.get('/friends/requests');
      setFriendRequests(response.data?.data || []);
    } catch {}
  }, [user]);

  const updateLeaderboard = useCallback(async () => {
    if (!user) { setLeaderboard([]); return; }
    try {
      const response = await api.get('/leaderboard', { params: { t: Date.now() } });
      setLeaderboard(response.data?.data || []);
    } catch {}
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) {
      setShopItems([]);
      setMissions([]);
      setFriends([]);
      setFriendRequests([]);
      setLeaderboard([]);
      setUnreadChatCount(0);
      return;
    }
    setIsLoading(true);
    try {
      await Promise.all([
        updateShop(),
        updateMissions(),
        updateFriends(),
        updateFriendRequests(),
        updateLeaderboard(),
        updateUnreadCount()
      ]);
      setLastRefresh(Date.now());
    } finally {
      setIsLoading(false);
    }
  }, [user, updateShop, updateMissions, updateFriends, updateFriendRequests, updateLeaderboard, updateUnreadCount]);

  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setShopItems([]);
      setMissions([]);
      setFriends([]);
      setFriendRequests([]);
      setLeaderboard([]);
      setUnreadChatCount(0);
    }
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        shopItems,
        missions,
        friends,
        friendRequests,
        leaderboard,
        unreadChatCount,
        isLoading,
        lastRefresh,
        refreshAll,
        updateMissions,
        updateShop,
        updateFriends,
        updateFriendRequests,
        updateLeaderboard,
        updateUnreadCount
      }}
    >
      <DataSocketHandler updateUnreadCount={updateUnreadCount} />
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};