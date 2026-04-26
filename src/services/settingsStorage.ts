//src/services/settingsStorage.ts
import * as SecureStore from 'expo-secure-store';

const SETTINGS_KEY = '2mots_user_settings';

export interface UserSettings {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    isDark: boolean;
}

const defaultSettings: UserSettings = {
    soundEnabled: true,
    hapticsEnabled: true,
    isDark: true, // Le thème Bleu Nuit reste la valeur par défaut
};

export const saveSettings = async (settings: UserSettings): Promise<void> => {
    try {
        await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des paramètres', error);
    }
};

export const loadSettings = async (): Promise<UserSettings> => {
    try {
        const result = await SecureStore.getItemAsync(SETTINGS_KEY);
        if (result) {
            return { ...defaultSettings, ...JSON.parse(result) };
        }
        return defaultSettings;
    } catch (error) {
        console.error('Erreur lors du chargement des paramètres', error);
        return defaultSettings;
    }
};