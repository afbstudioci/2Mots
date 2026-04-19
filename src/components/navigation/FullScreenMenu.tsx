import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius } from '../../theme/theme';

// Import dynamique de la configuration de l'application
const appConfig = require('../../../app.json');
const APP_VERSION = appConfig.expo.version || '1.0.0';

const { height, width } = Dimensions.get('window');

const MENU_ITEMS = [
    { id: 'home', label: 'Accueil', icon: 'home-outline' },
    { id: 'profile', label: 'Mon Profil', icon: 'person-outline' },
    { id: 'leaderboard', label: 'Classement', icon: 'trophy-outline' },
    { id: 'settings', label: 'Paramètres', icon: 'settings-outline' },
];

export default function FullScreenMenu() {
    const { themeColors } = useTheme();
    const { logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [isOpen, setIsOpen] = useState(false);

    // Animations du fond et de la croix
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateCrossAnim = useRef(new Animated.Value(0)).current;
    
    // Animations d'entree des textes (Slide + Fade)
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

            // Cascade fluide
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

    const rotate1 = rotateCrossAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
    const rotate2 = rotateCrossAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] });

    return (
        <>
            {/* Bouton Hamburger asymetrique */}
            {!isOpen && (
                <Pressable 
                    onPress={toggleMenu} 
                    style={[styles.actionButton, { top: insets.top + spacing.sm }]}
                >
                    <View style={styles.hamburgerContainer}>
                        <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
                        <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text, width: 16 }]} />
                        <View style={[styles.hamburgerLine, { backgroundColor: themeColors.text }]} />
                    </View>
                </Pressable>
            )}

            {/* Plaque de verre du Menu */}
            <Modal transparent visible={isOpen} animationType="none" statusBarTranslucent>
                <Animated.View style={[styles.menuOverlay, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>
                    
                    {/* Bouton Fermer (Croix parfaite) */}
                    <Pressable 
                        onPress={toggleMenu} 
                        style={[styles.actionButton, { top: insets.top + spacing.sm }]}
                    >
                        <Animated.View style={[styles.crossLine, { backgroundColor: themeColors.text, transform: [{ rotate: rotate1 }] }]} />
                        <Animated.View style={[styles.crossLine, { backgroundColor: themeColors.text, transform: [{ rotate: rotate2 }] }]} />
                    </Pressable>

                    {/* Contenu principal centre */}
                    <View style={styles.menuContent}>
                        {MENU_ITEMS.map((item, index) => (
                            <Animated.View 
                                key={item.id} 
                                style={[styles.animatedItemContainer, { opacity: itemFadeAnims[index], transform: [{ translateY: itemSlideAnims[index] }] }]}
                            >
                                <Pressable style={styles.menuItem} onPress={toggleMenu}>
                                    <Ionicons name={item.icon as any} size={28} color={themeColors.textSecondary} style={styles.menuIcon} />
                                    <Text style={[styles.menuText, { color: themeColors.text }]}>{item.label}</Text>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Zone de bas de page (Deconnexion et signature) */}
                    <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
                        <Pressable style={styles.logoutButton} onPress={() => { toggleMenu(); logout(); }}>
                            <Ionicons name="log-out-outline" size={20} color={colors.error} style={styles.logoutIcon} />
                            <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
                        </Pressable>
                        <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>
                            2MOTS STUDIO • v{APP_VERSION}
                        </Text>
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
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 25,
    },
    hamburgerContainer: {
        alignItems: 'flex-end',
        width: 24,
    },
    hamburgerLine: {
        width: 24,
        height: 2.5,
        borderRadius: 2,
        marginVertical: 3,
    },
    crossLine: {
        width: 26,
        height: 2.5,
        borderRadius: 2,
        position: 'absolute',
    },
    menuOverlay: {
        flex: 1,
        width: width,
        height: height,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    menuContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: -40,
    },
    animatedItemContainer: {
        alignItems: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginVertical: spacing.xs,
    },
    menuIcon: {
        marginRight: spacing.md,
    },
    menuText: {
        fontFamily: 'Poppins_800ExtraBold',
        fontSize: 32,
        letterSpacing: 1,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: spacing.lg,
    },
    logoutIcon: {
        marginRight: spacing.sm,
    },
    logoutText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    versionText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 11,
        letterSpacing: 3,
        opacity: 0.4,
    },
});