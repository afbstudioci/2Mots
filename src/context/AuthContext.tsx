//src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { DeviceEventEmitter } from 'react-native';
import api from '../services/api';
import { saveTokens, saveUser, getToken, getUser, clearTokens } from '../services/authStorage';

interface AuthContextData {
  user: any;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
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
      const storageToken = await getToken();
      const storageUser = await getUser();

      if (storageToken && storageUser && isMounted) {
        setUser(storageUser);
        refreshProfileSilently();
      }

      if (isMounted) setLoading(false);
    }

    loadStorageData();

    const authFailedListener = DeviceEventEmitter.addListener('AUTH_FAILED', () => {
      if (isMounted) setUser(null);
    });

    return () => {
      isMounted = false;
      authFailedListener.remove();
    };
  }, []);

  const refreshProfileSilently = async () => {
    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data.data.user;

      const currentToken = await getToken();
      if (currentToken) {
        await saveUser(freshUser);
        setUser(freshUser);
      }
    } catch (error) {
      console.info('Session validee mais profil non rafraichi en arriere-plan');
    }
  };

  const login = async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user: userData, accessToken, refreshToken } = response.data.data;

      await saveTokens(accessToken, refreshToken);
      await saveUser(userData);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
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
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const refreshProfile = async () => {
    await refreshProfileSilently();
  };

  // NOUVELLE FONCTION : Mise à jour du profil avec gestion FormData
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
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const logout = async () => {
    try {
      await clearTokens();
      setUser(null);
      api.post('/auth/logout').catch(() => { });
    } catch (e) {
      console.error('Erreur lors de la deconnexion', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);