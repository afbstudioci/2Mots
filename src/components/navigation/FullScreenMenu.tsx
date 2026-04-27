//src/components/navigation/FullScreenMenu.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';
import { RootStackParamList } from '../../../App';

const appConfig = require('../../../app.json');
const APP_VERSION = appConfig.expo.version || '1.0.0';

const MENU_ITEMS = [
    { id: 'home', label: 'Accueil', icon: 'home-outline' },
    { id: 'profile', label: 'Mon Profil', icon: 'person-outline' },
    { id: 'leaderboard', label: 'Classement', icon: 'trophy-outline' },
    { id: 'settings', label: 'Paramètres', icon: 'settings-outline' },
];

export default function FullScreenMenu() {
    const { themeColors } = useTheme();
    const { logout } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const [isOpen, setIsOpen] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateCrossAnim = useRef(new Animated.Value(0)).current;
    const itemSlideAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(40))).current;
    const itemFadeAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;

    const toggleMenu = () => {
        if (!isOpen) {
            setIsOpen(true);
            rotateCrossAnim.setValue(0);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.spring(rotateCrossAnim, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true })
            ]).start();

            const animations = MENU_ITEMS.map((_, index) => {
                return Animated.parallel([
                    Animated.timing(itemFadeAnims[index], { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
                    Animated.spring(itemSlideAnims[index], { toValue: 0, tension: 45, friction: 8, delay: index * 60, useNativeDriver: true })
                ]);
            });
            Animated.stagger(60, animations).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(rotateCrossAnim, { toValue: 0, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setIsOpen(false);
                MENU_ITEMS.forEach((_, index) => {
                    itemFadeAnims[index].setValue(0);
                    itemSlideAnims[index].setValue(40);
                });
            });
        }
    };

    const handleNavigation = (id: string) => {
        toggleMenu();
        setTimeout(() => {
            switch (id) {
                case 'home':
                    navigation.navigate('Home');
                    break;
                case 'profile':
                    navigation.navigate('Profile');
                    break;
                case 'leaderboard':
                    navigation.navigate('Leaderboard');
                    break;
                case 'settings':
                    navigation.navigate('Settings');
                    break;
                default:
                    break;
            }
        }, 300);
    };

    const handleLogout = () => {
        toggleMenu();
        setTimeout(() => {
            logout();
        }, 300);
    };

    const rotate1 = rotateCrossAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
    const rotate2 = rotateCrossAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] });

    return (
        <>
            {!isOpen && (
                <Pressable 
                    onPress={toggleMenu} 
                    style={[styles.actionButton, { top: insets.top + spacing.sm, backgroundColor: themeColors.overlay }]}
                >
                    <View style={styles.hamburgerContainer}>
                        <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
                        <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text, width: 16 }]} />
                        <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
                    </View>
                </Pressable>
            )}

            <Modal 
                visible={isOpen} 
                animationType="none" 
                statusBarTranslucent={true} 
                navigationBarTranslucent={true}
            >
                <Animated.View style={[styles.menuContainer, { opacity: fadeAnim, backgroundColor: themeColors.background }]}>
                    
                    <Pressable onPress={toggleMenu} style={[styles.actionButton, { top: insets.top + spacing.sm, backgroundColor: themeColors.overlay }]}>
                        <Animated.View style={[styles.crossLine, { backgroundColor: themeColors.text, transform: [{ rotate: rotate1 }] }]} />
                        <Animated.View style={[styles.crossLine, { backgroundColor: themeColors.text, transform: [{ rotate: rotate2 }] }]} />
                    </Pressable>

                    <View style={styles.menuContent}>
                        {MENU_ITEMS.map((item, index) => (
                            <Animated.View 
                                key={item.id} 
                                style={[styles.animatedItemContainer, { opacity: itemFadeAnims[index], transform: [{ translateY: itemSlideAnims[index] }] }]}
                            >
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.menuItem, 
                                        { 
                                            backgroundColor: themeColors.card,
                                            borderColor: themeColors.cardBorder,
                                            borderWidth: themeColors.cardBorderWidth,
                                            transform: [{ scale: pressed ? 0.95 : 1 }]
                                        }
                                    ]} 
                                    onPress={() => handleNavigation(item.id)}
                                >
                                    <View style={[styles.menuIconContainer, { backgroundColor: themeColors.overlayLight }]}>
                                        <Ionicons name={item.icon as any} size={24} color={themeColors.primary} />
                                    </View>
                                    <Text style={[styles.menuText, { color: themeColors.text }]}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} style={{ marginLeft: 'auto' }} />
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>

                    <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
                        <Pressable 
                            style={({ pressed }) => [
                                styles.logoutButton, 
                                { transform: [{ scale: pressed ? 0.95 : 1 }] }
                            ]} 
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={22} color={colors.error} style={styles.logoutIcon} />
                            <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
                        </Pressable>
                        
                        <View style={styles.versionContainer}>
                            <Text style={[styles.brandText, { color: themeColors.text }]}>2Mots</Text>
                            <View style={[styles.versionBadge, { backgroundColor: themeColors.overlay }]}>
                                <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>
                                    v{APP_VERSION}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        position: 'absolute',
        right: spacing.lg,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        borderRadius: 25,
    },
    hamburgerContainer: { alignItems: 'flex-end', width: 24 },
    hamburgerLine: { width: 24, height: 2.5, borderRadius: 2, marginVertical: 3 },
    crossLine: { width: 26, height: 2.5, borderRadius: 2, position: 'absolute' },
    
    // CORRECTION : L'ancrage absolu aux 4 coins
    menuContainer: { 
        flex: 1,
        backgroundColor: 'transparent',
    },
    
    menuContent: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: spacing.xl },
    animatedItemContainer: { alignItems: 'center', width: '100%' },
    menuItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '100%', 
        paddingVertical: spacing.md, 
        paddingHorizontal: spacing.lg, 
        marginVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    menuIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    menuText: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 0.5 },
    footer: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.xl },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: borderRadius.xl, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: spacing.lg },
    logoutIcon: { marginRight: spacing.sm },
    logoutText: { ...typography.buttonPrimary, fontSize: 16, letterSpacing: 0.5 },
    versionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    brandText: { ...typography.buttonPrimary, fontSize: 14, letterSpacing: 1, marginRight: spacing.sm, opacity: 0.7 },
    versionBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    versionText: { ...typography.bodySmall, fontSize: 11, letterSpacing: 1, opacity: 0.6 },
});