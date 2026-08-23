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
    // Thème Blanc / Jour par défaut
    const [isDark, setIsDark] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initTheme = async () => {
            const settings = await loadSettings();
            if (typeof settings.isDark === 'boolean') {
                setIsDark(settings.isDark);
            } else {
                setIsDark(false); // Mode Jour par défaut
            }
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

    if (!isLoaded) return null;

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