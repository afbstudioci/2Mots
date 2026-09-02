//src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { DeviceEventEmitter } from 'react-native';
import api from '../services/api';
import { saveTokens, saveUser, getToken, getUser, clearTokens } from '../services/authStorage';

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
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

    return () => {
      isMounted = false;
      authFailedListener.remove();
    };
  }, []);

  const refreshProfileSilently = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data?.data?.user;
      const currentToken = await getToken();
      // On ne sauvegarde QUE si la session est toujours active après le retour de l'API
      if (freshUser && currentToken) {
        await saveUser(freshUser);
        setUser(freshUser);
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
    } catch (error: any) {
      const parsed = parseApiError(error, 'Connexion Google échouée', 'Erreur lors de la connexion Google.');
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
    } catch (error: any) {
      const parsed = parseApiError(error, "Erreur d'inscription", "Erreur lors de la création du compte.");
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = response.data.data.user;

      await saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error: any) {
      const parsed = parseApiError(error, 'Mise à jour échouée', 'Erreur lors de la mise à jour du profil.');
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
      await clearTokens();
      setUser(null);
    } catch (e) {
      console.warn('[AUTH] Erreur déconnexion:', e);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);