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
      await saveUser(freshUser);
      setUser(freshUser);
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

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Nettoyage forcé même si le serveur ne répond pas
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);