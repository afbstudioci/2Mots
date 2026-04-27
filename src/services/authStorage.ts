//src/services/authStorage.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const getItemWithRetry = async (key: string, maxRetries = 3): Promise<string | null> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        return null;
      }
      await sleep(100 * Math.pow(2, attempt - 1));
    }
  }
  return null;
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.warn("Erreur d'ecriture des tokens", error);
  }
};

export const saveUser = async (user: any) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Erreur d'ecriture des donnees utilisateur", error);
  }
};

export const getToken = () => getItemWithRetry(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => getItemWithRetry(REFRESH_TOKEN_KEY);

export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    // Tentative de fallback sur SecureStore au cas où
    const oldData = await getItemWithRetry(USER_KEY);
    return oldData ? JSON.parse(oldData) : null;
  }
};

export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    await SecureStore.deleteItemAsync(USER_KEY); // Nettoyage de l'ancien
  } catch (error) {
    console.warn("Erreur lors du nettoyage du stockage", error);
  }
};