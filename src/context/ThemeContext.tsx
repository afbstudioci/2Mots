//src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getPalette } from '../theme/theme';
import { loadSettings, saveSettings } from '../services/settingsStorage';

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    themeColors: ReturnType<typeof getPalette>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // État dynamique au lieu du booléen codé en dur
    const [isDark, setIsDark] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initTheme = async () => {
            const settings = await loadSettings();
            setIsDark(settings.isDark);
            setIsLoaded(true);
        };
        initTheme();
    }, []);

    const toggleTheme = async () => {
        const newValue = !isDark;
        setIsDark(newValue);
        const currentSettings = await loadSettings();
        await saveSettings({ ...currentSettings, isDark: newValue });
    };
    
    const themeColors = useMemo(() => getPalette(isDark), [isDark]);

    if (!isLoaded) return null; // Attente du chargement local pour éviter les clignotements

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, themeColors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme doit être utilisé à l’intérieur d’un ThemeProvider');
    }
    return context;
};