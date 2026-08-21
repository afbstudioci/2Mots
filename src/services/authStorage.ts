//src/services/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@twomots_token';
const REFRESH_TOKEN_KEY = '@twomots_refresh_token';
const USER_KEY = '@twomots_user';

let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryUser: any = null;

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    inMemoryToken = accessToken;
    inMemoryRefreshToken = refreshToken;
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } catch (error) {
    console.warn("[AUTH] Erreur sauvegarde tokens", error);
  }
};

export const saveUser = async (user: any) => {
  try {
    inMemoryUser = user;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("[AUTH] Erreur sauvegarde utilisateur", error);
  }
};

export const getToken = async (): Promise<string | null> => {
  if (inMemoryToken !== null) return inMemoryToken;
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    inMemoryToken = token;
    return token;
  } catch (error) {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (inMemoryRefreshToken !== null) return inMemoryRefreshToken;
  try {
    const rToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    inMemoryRefreshToken = rToken;
    return rToken;
  } catch (error) {
    return null;
  }
};

export const getUser = async (): Promise<any> => {
  if (inMemoryUser !== null) return inMemoryUser;
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    const parsed = userData ? JSON.parse(userData) : null;
    inMemoryUser = parsed;
    return parsed;
  } catch (error) {
    return null;
  }
};

export const clearTokens = async () => {
  inMemoryToken = null;
  inMemoryRefreshToken = null;
  inMemoryUser = null;
  try {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.warn("[AUTH] Erreur suppression session", error);
  }
};