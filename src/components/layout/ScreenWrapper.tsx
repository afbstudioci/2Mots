import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    useSafeArea?: boolean;
}

export default function ScreenWrapper({ children, style, useSafeArea = true }: ScreenWrapperProps) {
    const Container = useSafeArea ? SafeAreaView : View;

    return (
        <Container style={[styles.container, style]} edges={['top']}>
            <StatusBar style="light" backgroundColor={colors.nightBlue} translucent={false} />
            <View style={styles.content}>
                {children}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.nightBlue,
    },
    content: {
        flex: 1,
    }
});