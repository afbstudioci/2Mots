// src/context/AuthContext.tsx
// CONTEXTE D'AUTHENTIFICATION ET SOURCE DE VERITE UTILISATEUR TEMPS REEL
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis)

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import api from '../services/api';
import socketService from '../services/socketService';
import { saveTokens, saveUser, getToken, getUser, clearTokens } from '../services/authStorage';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { parseApiError } from '../utils/apiError';

interface AuthContextData {
  user: any;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  loginWithGoogle: (googleData: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (formData: any) => Promise<void>;
  updateKevs: (newKevs: number) => void;
  updateUser: (partial: Partial<any>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = useCallback((partial: Partial<any>) => {
    setUser((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      saveUser(updated).catch(() => {});
      return updated;
    });
  }, []);

  const updateKevs = useCallback((newKevs: number) => {
    updateUser({ kevs: Math.max(0, newKevs) });
  }, [updateUser]);

  useEffect(() => {
    let isMounted = true;

    async function loadStorageData() {
      try {
        const [storageToken, storageUser] = await Promise.all([getToken(), getUser()]);
        if (storageToken && storageUser && isMounted) {
          setUser(storageUser);
          refreshProfileSilently();
        }
      } catch (e) {
        console.warn('[AUTH] Erreur lecture initiale:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStorageData();

    const authFailedListener = DeviceEventEmitter.addListener('AUTH_FAILED', async () => {
      if (isMounted) {
        await clearTokens();
        setUser(null);
      }
    });

    const handleSocketBalance = (data: any) => {
      if (!data || !isMounted) return;
      updateUser(data);
    };

    socketService.on('user_balance_updated', handleSocketBalance);

    return () => {
      isMounted = false;
      authFailedListener.remove();
      socketService.off('user_balance_updated', handleSocketBalance);
    };
  }, [updateUser]);

  const syncPushToken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await api.post('/notifications/push-token', {
          token,
          platform: 'android',
        }).catch(() => api.post('/auth/fcm-token', { fcmToken: token }));
      }
    } catch (err: any) {
      console.warn('[PUSH] Erreur synchronisation push-token backend :', err?.message);
    }
  };

  const refreshProfileSilently = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data?.data?.user;
      const currentToken = await getToken();
      if (freshUser && currentToken) {
        await saveUser(freshUser);
        setUser(freshUser);
        syncPushToken();
      }
    } catch {}
  };

  const login = async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user: userData, accessToken, refreshToken } = response.data.data;
      await saveTokens(accessToken, refreshToken);
      await saveUser(userData);
      setUser(userData);
      syncPushToken();
    } catch (error: any) {
      const parsed = parseApiError(error, 'Erreur de connexion', 'Identifiant ou mot de passe incorrect.');
      const err = new Error(parsed.message);
      (err as any).title = parsed.title;
      (err as any).isNetworkError = parsed.isNetworkError;
      (err as any).isTimeout = parsed.isTimeout;
      throw err;
    }
  };

  const loginWithGoogle = async (googleData: any) => {
    try {
      const response = await api.post('/auth/google', googleData);
      const { user: userData, accessToken, refreshToken } = response.data.data;
      await saveTokens(accessToken, refreshToken);
      await saveUser(userData);
      setUser(userData);
      syncPushToken();
    } catch (error: any) {
      const parsed = parseApiError(error, 'Connexion Google echouee', 'Erreur lors de la connexion Google.');
      const err = new Error(parsed.message);
      (err as any).title = parsed.title;
      throw err;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user: newUserData, accessToken, refreshToken } = response.data.data;
      await saveTokens(accessToken, refreshToken);
      await saveUser(newUserData);
      setUser(newUserData);
      syncPushToken();
    } catch (error: any) {
      const parsed = parseApiError(error, 'Erreur d\'inscription', 'Erreur lors de la creation du compte.');
      const err = new Error(parsed.message);
      (err as any).title = parsed.title;
      throw err;
    }
  };

  const refreshProfile = async () => {
    await refreshProfileSilently();
  };

  const updateProfile = async (formData: any) => {
    try {
      const response = await api.put('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = response.data.data.user;
      await saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error: any) {
      const parsed = parseApiError(error, 'Mise a jour echouee', 'Erreur lors de la mise a jour du profil.');
      const err = new Error(parsed.message);
      (err as any).title = parsed.title;
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      const currentToken = await getToken();
      if (currentToken) {
        await api.delete('/auth/account', {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      }
    } catch (e) {
      console.warn('[AUTH] Erreur serveur suppression compte:', e);
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      const currentToken = await getToken();
      if (currentToken) {
        api.delete('/auth/fcm-token', {
          headers: { Authorization: `Bearer ${currentToken}` },
          timeout: 2000,
        }).catch(() => {});
        api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
          timeout: 2000,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('[AUTH] Erreur deconnexion:', e);
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        deleteAccount,
        refreshProfile,
        updateProfile,
        updateKevs,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);