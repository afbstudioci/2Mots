import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = '2mots_access_token';
const REFRESH_TOKEN_KEY = '2mots_refresh_token';

export const authStorage = {
    // Sauvegarder les tokens
    saveTokens: async (accessToken: string, refreshToken: string) => {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    },

    // Récupérer l'Access Token
    getToken: async () => {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    },

    // Récupérer le Refresh Token
    getRefreshToken: async () => {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },

    // Supprimer les tokens (Déconnexion)
    deleteTokens: async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    },
};