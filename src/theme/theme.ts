import { TextStyle } from 'react-native';

export const colors = {
    coral: '#FF7F50',
    sand: '#F7F5F0',
    nightBlue: '#1A202C',
    success: '#4ADE80', 
    error: '#EF4444',   
    white: '#FFFFFF',
};

export const getPalette = (isDark: boolean) => ({
    primary: colors.coral,
    background: colors.nightBlue, // Force le Bleu Nuit partout
    surface: '#242B3A',
    text: colors.sand,
    textSecondary: 'rgba(247, 245, 240, 0.6)',
    border: '#2D3748',
    card: '#242B3A',
});

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
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
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    }),
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
    buttonPrimary: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
    },
};

export const lightTheme = {
    dark: false,
    colors: {
        primary: colors.coral,
        background: colors.nightBlue, // Securite anti-blanc
        card: colors.nightBlue,
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

export const darkTheme = {
    dark: true,
    colors: {
        primary: colors.coral,
        background: colors.nightBlue,
        card: colors.nightBlue,
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