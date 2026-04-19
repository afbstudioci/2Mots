import React, { createContext, useContext, useMemo } from 'react';
import { getPalette } from '../theme/theme';

type ThemeContextType = {
    isDark: boolean;
    themeColors: ReturnType<typeof getPalette>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // LOGIQUE METIER : On verrouille isDark sur "true" de facon permanente.
    // L'application n'ecoute plus le telephone, elle sera toujours en Bleu Nuit.
    const isDark = true;
    
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