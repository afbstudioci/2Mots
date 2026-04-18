import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { authStorage } from '../services/authStorage';

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (login: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifie au démarrage de l'app si un token existe
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const token = await authStorage.getToken();
                if (token) {
                    // Optionnel : on pourrait faire un appel API /api/auth/me pour vérifier si le token est valide
                    // Pour l'instant, on simule qu'on est connecté (le vrai test sera fait au premier appel jeu)
                    setUser({ id: 'temp', username: 'Joueur' }); 
                }
            } catch (error) {
                await authStorage.deleteTokens();
            } finally {
                setIsLoading(false);
            }
        };
        checkLogin();
    }, []);

    const login = async (login: string, password: string) => {
        const response = await api.post('/auth/login', { login, password });
        const { user: userData, accessToken, refreshToken } = response.data.data;
        await authStorage.saveTokens(accessToken, refreshToken);
        setUser(userData);
    };

    const register = async (username: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { username, email, password });
        const { user: userData, accessToken, refreshToken } = response.data.data;
        await authStorage.saveTokens(accessToken, refreshToken);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Même si le serveur échoue, on vide le téléphone
        } finally {
            await authStorage.deleteTokens();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};