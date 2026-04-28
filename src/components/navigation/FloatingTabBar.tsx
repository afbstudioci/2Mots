//src/components/navigation/FloatingTabBar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, shadows } from '../../theme/theme';
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
                        size={24}
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
        borderRadius: 35,
        width: '92%',
        height: 75,
        ...shadows.medium(true),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        width: 44
    },
    activeBubble: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24
    },
    tabText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 0.5
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFF',
        ...shadows.medium(false)
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Poppins_900Black',
        includeFontPadding: false,
    }
});