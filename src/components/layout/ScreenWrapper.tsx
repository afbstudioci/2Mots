import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    useSafeArea?: boolean;
}

export default function ScreenWrapper({ children, style, useSafeArea = true }: ScreenWrapperProps) {
    const { isDark, themeColors } = useTheme();
    const statusBarStyle = isDark ? "light" : "dark";

    if (useSafeArea) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }, style]} edges={['top']}>
                <StatusBar style={statusBarStyle} backgroundColor={themeColors.background} translucent={false} />
                <View style={styles.content}>
                    {children}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }, style]}>
            <StatusBar style={statusBarStyle} backgroundColor={themeColors.background} translucent={false} />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    }
});