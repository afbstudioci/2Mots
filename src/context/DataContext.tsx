//src/context/DataContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

interface DataContextType {
  shopItems: any[];
  missions: any[];
  friends: any[];
  friendRequests: any[];
  leaderboard: any[];
  isLoading: boolean;
  lastRefresh: number | null;
  refreshAll: () => Promise<void>;
  updateMissions: () => Promise<void>;
  updateShop: () => Promise<void>;
  updateFriends: () => Promise<void>;
  updateFriendRequests: () => Promise<void>;
  updateLeaderboard: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  const updateShop = useCallback(async () => {
    try {
      const response = await api.get('/shop');
      setShopItems(response.data.data || []);
    } catch (error) {
      console.log('Error fetching shop:', error);
    }
  }, []);

  const updateMissions = useCallback(async () => {
    try {
      const response = await api.get('/missions');
      setMissions(response.data.data || []);
    } catch (error) {
      console.log('Error fetching missions:', error);
    }
  }, []);

  const updateFriends = useCallback(async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data.data || []);
    } catch (error) {
      console.log('Error fetching friends:', error);
    }
  }, []);

  const updateFriendRequests = useCallback(async () => {
    try {
      const response = await api.get('/friends/requests');
      setFriendRequests(response.data.data || []);
    } catch (error) {
      console.log('Error fetching friend requests:', error);
    }
  }, []);

  const updateLeaderboard = useCallback(async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.log('Error fetching leaderboard:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      // On lance tout en parallèle pour une vitesse maximale
      await Promise.all([
        updateShop(),
        updateMissions(),
        updateFriends(),
        updateFriendRequests(),
        updateLeaderboard()
      ]);
      setLastRefresh(Date.now());
    } finally {
      setIsLoading(false);
    }
  }, [updateShop, updateMissions, updateFriends, updateLeaderboard]);

  return (
    <DataContext.Provider
      value={{
        shopItems,
        missions,
        friends,
        friendRequests,
        leaderboard,
        isLoading,
        lastRefresh,
        refreshAll,
        updateMissions,
        updateShop,
        updateFriends,
        updateFriendRequests,
        updateLeaderboard
      }}
    >
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
