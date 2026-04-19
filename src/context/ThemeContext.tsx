// src/context/ThemeContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getPalette } from '../theme/theme';

type ThemeContextType = {
    isDark: boolean;
    themeColors: ReturnType<typeof getPalette>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // useMemo evite de recalculer les couleurs si le mode ne change pas
    const themeColors = useMemo(() => getPalette(isDark), [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, themeColors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme doit etre utilise a l’interieur d’un ThemeProvider');
    }
    return context;
};