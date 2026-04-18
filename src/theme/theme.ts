//src/theme/theme.ts
import { TextStyle } from 'react-native';

export const colors = {
    coral: '#FF7F50',
    sand: '#F7F5F0',
    nightBlue: '#1A202C',
    success: '#4ADE80', // Vert Menthe ajoute
    error: '#EF4444',   // Rouge d'erreur ajoute
};

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
    soft: {
        shadowColor: colors.nightBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
};

export const typography: Record<string, TextStyle> = {
    titleHuge: {
        fontFamily: 'Poppins_900Black',
        fontSize: 42,
        color: colors.nightBlue,
    },
    titleLarge: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 28,
        color: colors.nightBlue,
    },
    bodyMedium: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: colors.nightBlue,
    },
    buttonPrimary: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
        color: colors.sand,
    },
};

export const lightTheme = {
    dark: false,
    colors: {
        primary: colors.coral,
        background: colors.sand,
        card: '#FFFFFF',
        text: colors.nightBlue,
        border: '#E2E0DB',
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