//src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
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
    async function loadStorageData() {
      const storageToken = await getToken();
      const storageUser = await getUser();

      if (storageToken && storageUser) {
        setUser(storageUser);
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      await saveTokens(accessToken, refreshToken);
      await saveUser(user);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      await saveTokens(accessToken, refreshToken);
      await saveUser(user);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data.data.user;
      await saveUser(freshUser);
      setUser(freshUser);
    } catch (error) {
      console.warn('Impossible de rafraichir le profil en arriere-plan');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignorer l'erreur serveur, forcer le nettoyage local
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