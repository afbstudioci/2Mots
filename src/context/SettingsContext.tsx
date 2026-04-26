//src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings, UserSettings } from '../services/settingsStorage';

interface SettingsContextType {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    toggleSound: () => void;
    toggleHaptics: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initSettings = async () => {
            const settings = await loadSettings();
            setSoundEnabled(settings.soundEnabled);
            setHapticsEnabled(settings.hapticsEnabled);
            setIsLoaded(true);
        };
        initSettings();
    }, []);

    const toggleSound = async () => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        const currentSettings = await loadSettings();
        await saveSettings({ ...currentSettings, soundEnabled: newValue });
    };

    const toggleHaptics = async () => {
        const newValue = !hapticsEnabled;
        setHapticsEnabled(newValue);
        const currentSettings = await loadSettings();
        await saveSettings({ ...currentSettings, hapticsEnabled: newValue });
    };

    if (!isLoaded) return null; // Evite un flash d'états asynchrones au démarrage

    return (
        <SettingsContext.Provider value={{ soundEnabled, hapticsEnabled, toggleSound, toggleHaptics }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings doit être utilisé à l’intérieur d’un SettingsProvider');
    }
    return context;
};