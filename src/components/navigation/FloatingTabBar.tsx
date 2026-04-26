//src/components/navigation/FloatingTabBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { RootStackParamList } from '../../../App';

export default function FloatingTabBar() {
    const { themeColors } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    
    const tabs = [
        { id: 'Shop', label: 'Boutique', icon: 'basket' },
        { id: 'Missions', label: 'Missions', icon: 'rocket' },
        { id: 'Friends', label: 'Amis', icon: 'people' },
    ];

    const handlePress = (id: any) => {
        navigation.navigate(id);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.tabBar, { backgroundColor: themeColors.card }]}>
                {tabs.map((tab) => {
                    const isActive = route.name === tab.id;
                    return (
                        <TabItem 
                            key={tab.id}
                            item={tab}
                            isActive={isActive}
                            onPress={() => handlePress(tab.id)}
                            themeColors={themeColors}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const TabItem = ({ item, isActive, onPress, themeColors }: any) => {
    const scaleIconAnim = useRef(new Animated.Value(1)).current;
    const activeBubbleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(activeBubbleAnim, {
            toValue: isActive ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [isActive]);

    const handlePressIn = () => {
        Animated.spring(scaleIconAnim, { toValue: 0.8, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleIconAnim, { toValue: 1.1, friction: 3, tension: 40, useNativeDriver: true }).start(() => {
            Animated.spring(scaleIconAnim, { toValue: 1, useNativeDriver: true }).start();
        });
        onPress();
    };

    return (
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.tabItem}>
            <View style={styles.iconContainer}>
                <Animated.View style={[
                    styles.activeBubble, 
                    { 
                        backgroundColor: themeColors.overlayLight,
                        opacity: activeBubbleAnim,
                        transform: [{ 
                            scale: activeBubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) 
                        }]
                    }
                ]} />
                <Animated.View style={{ transform: [{ scale: scaleIconAnim }] }}>
                    <Ionicons 
                        name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)} 
                        size={24} 
                        color={isActive ? colors.coral : themeColors.textSecondary} 
                    />
                </Animated.View>
            </View>
            <Text style={[styles.tabText, { color: isActive ? colors.coral : themeColors.textSecondary }]}>
                {item.label}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: { position: 'absolute', bottom: spacing.xl, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
    tabBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: borderRadius.xl, width: '85%', ...shadows.soft(true) },
    tabItem: { alignItems: 'center', justifyContent: 'center', width: 80 },
    iconContainer: { alignItems: 'center', justifyContent: 'center', height: 40, width: 40 },
    activeBubble: { position: 'absolute', width: 46, height: 46, borderRadius: 23 },
    tabText: { fontFamily: 'Poppins_700Bold', fontSize: 10, marginTop: 2 }
});