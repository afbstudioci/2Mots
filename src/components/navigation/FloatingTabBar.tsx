//src/components/navigation/FloatingTabBar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useData } from '../../context/DataContext';

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { themeColors } = useTheme();
    const { unreadChatCount } = useData();
    
    const tabs = [
        { id: 'HomeTab', label: 'Accueil', icon: 'home' },
        { id: 'Shop', label: 'Boutique', icon: 'basket' },
        { id: 'Missions', label: 'Missions', icon: 'rocket' },
        { id: 'Messages', label: 'Messages', icon: 'chatbubbles' },
    ];

    return (
        <View style={styles.container}>
            <View style={[styles.tabBar, { backgroundColor: themeColors.card }]}>
                {tabs.map((tab, index) => {
                    const isActive = state.index === index;
                    
                    const handlePress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: state.routes[index].key,
                            canPreventDefault: true,
                        });

                        if (isActive) {
                            // Scroll to top si on clique sur l'onglet déjà actif
                            DeviceEventEmitter.emit('SCROLL_TO_TOP_' + tab.id);
                        }

                        if (!isActive && !event.defaultPrevented) {
                            navigation.navigate(tab.id);
                        }
                    };

                    return (
                        <TabItem 
                            key={tab.id}
                            item={tab}
                            isActive={isActive}
                            onPress={handlePress}
                            themeColors={themeColors}
                            unreadChatCount={unreadChatCount}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const TabItem = ({ item, isActive, onPress, themeColors, unreadChatCount }: any) => {
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
                        backgroundColor: colors.coral + '15',
                        opacity: activeBubbleAnim,
                        transform: [{ 
                            scale: activeBubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) 
                        }]
                    }
                ]} />
                <Animated.View style={{ transform: [{ scale: scaleIconAnim }] }}>
                    <Ionicons 
                        name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)} 
                        size={22} 
                        color={isActive ? colors.coral : themeColors.textSecondary} 
                    />
                    {item.id === 'Messages' && unreadChatCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadChatCount > 9 ? '9+' : unreadChatCount}</Text>
                        </View>
                    )}
                </Animated.View>
            </View>
            <Text style={[styles.tabText, { color: isActive ? colors.coral : themeColors.textSecondary }]}>
                {item.label}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: { 
        position: 'absolute', 
        bottom: spacing.lg, 
        left: 0, 
        right: 0, 
        alignItems: 'center', 
        zIndex: 100,
        backgroundColor: 'transparent'
    },
    tabBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-around', 
        paddingVertical: spacing.sm, 
        paddingHorizontal: spacing.sm, 
        borderRadius: 30, 
        width: '92%', 
        height: 70,
        ...shadows.soft(true),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    tabItem: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1,
    },
    iconContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 40, 
        width: 40 
    },
    activeBubble: { 
        position: 'absolute', 
        width: 44, 
        height: 44, 
        borderRadius: 22 
    },
    tabText: { 
        fontFamily: 'Poppins_700Bold', 
        fontSize: 9, 
        marginTop: 2,
        letterSpacing: 0.5
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        borderWidth: 1.5,
        borderColor: colors.nightBlue,
    },
    badgeText: {
        color: colors.white,
        fontSize: 8,
        fontFamily: 'Poppins_700Bold',
        includeFontPadding: false,
    }
});