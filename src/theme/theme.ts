//src/theme/theme.ts
import { TextStyle } from 'react-native';

export const colors = {
    coral: '#FF7F50',
    sand: '#F7F5F0',
    nightBlue: '#1A202C',
    mint: '#4ADE80', 
    success: '#4ADE80', 
    error: '#EF4444',   
    white: '#FFFFFF',
};

// CORRECTION : La palette écoute maintenant la variable isDark en temps réel
export const getPalette = (isDark: boolean) => ({
    primary: colors.coral,
    background: isDark ? colors.nightBlue : colors.sand, 
    surface: isDark ? '#242B3A' : colors.white,
    text: isDark ? colors.sand : colors.nightBlue,
    textSecondary: isDark ? 'rgba(247, 245, 240, 0.6)' : 'rgba(26, 32, 44, 0.6)',
    border: isDark ? '#2D3748' : '#E2E8F0',
    card: isDark ? '#242B3A' : colors.white,
});

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 12,
    md: 20,
    lg: 32,
    xl: 50,
};

export const shadows = {
    soft: (isDark: boolean) => ({
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.1, // Ajusté pour être visible en mode clair
        shadowRadius: 8,
        elevation: 5,
    }),
    float: (isDark: boolean) => ({
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 12,
        elevation: 8,
    })
};

export const typography: Record<string, TextStyle> = {
    titleHuge: {
        fontFamily: 'Poppins_900Black',
        fontSize: 42,
    },
    titleLarge: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 28,
    },
    bodyMedium: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
    },
    bodySmall: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
    },
    buttonPrimary: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
    },
};

export const lightTheme = {
    dark: false,
    colors: {
        primary: colors.coral,
        background: colors.sand, 
        card: colors.white,
        text: colors.nightBlue,
        border: '#E2E8F0',
        notification: colors.coral,
    },
    fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        primary: colors.coral,
        background: colors.nightBlue,
        card: '#242B3A',
        text: colors.sand,
        border: '#2D3748',
        notification: colors.coral,
    },
    fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
};