import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, LayoutAnimation, UIManager, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing } from '../../theme/theme';

interface LeaderboardItemProps {
    rank: number;
    user: {
        login: string;
        bestScore: number;
        xp?: number;
        level?: number;
        avatar?: string;
    };
    index: number;
}

export default function LeaderboardItem({ rank, user, index }: LeaderboardItemProps) {
    const { themeColors } = useTheme();
    const [expanded, setExpanded] = useState(false);
    
    // Animations d'entrée
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current; // Démarrage plus bas pour un meilleur effet
    
    // NOUVEAU : Animation de "rebond" au clic
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 5, delay: index * 60, useNativeDriver: true }) // Friction baissée pour plus de rebond
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    };

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const isPodium = rank <= 3;

    // 100% Français
    const getTitle = (r: number) => {
        if (r === 1) return "Champion Mondial";
        if (r === 2) return "Génie";
        if (r === 3) return "Explorateur";
        return "Challenger";
    };

    const getCardStyle = () => {
        if (rank === 1) return { backgroundColor: '#FFB84D', textColor: '#332200' };
        if (rank === 2) return { backgroundColor: '#81E6D9', textColor: '#00332E' };
        if (rank === 3) return { backgroundColor: '#F6A87C', textColor: '#4A200B' };
        return { backgroundColor: themeColors.card, textColor: themeColors.text };
    };

    const cardConfig = getCardStyle();

    const renderAvatar = (isPodiumStyle: boolean) => {
        const avatarStyles = isPodiumStyle 
            ? [styles.avatar, styles.avatarPodium] 
            : [styles.avatar, styles.avatarStandard];

        if (user.avatar) {
            return (
                <Image 
                    source={{ uri: user.avatar }} 
                    style={avatarStyles} 
                    resizeMode="cover"
                />
            );
        }

        return (
            <View style={avatarStyles}>
                <Text style={styles.avatarInitial}>{user.login.charAt(0).toUpperCase()}</Text>
            </View>
        );
    };

    return (
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <TouchableOpacity 
                style={[
                    styles.card, 
                    { backgroundColor: cardConfig.backgroundColor },
                    !isPodium && { borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth },
                    isPodium ? styles.cardPodium : styles.cardStandard,
                    expanded && styles.cardExpanded,
                    // Ombre renforcée pour le Top 1
                    rank === 1 && styles.glowEffect
                ]} 
                onPress={toggleExpand}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1} // L'opacité est gérée par scaleAnim pour faire plus "app natif"
            >
                <View style={styles.mainContent}>
                    
                    {/* AVATAR & BADGE */}
                    {isPodium ? (
                        <View style={styles.avatarContainerPodium}>
                            {renderAvatar(true)}
                            <View style={styles.rankBadgePodium}>
                                <Text style={styles.rankTextPodium}>{rank}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={[styles.rankTextStandard, { color: themeColors.textSecondary }]}>{rank}</Text>
                    )}

                    {!isPodium && renderAvatar(false)}
                    
                    {/* INFO JOUEUR - Flex strict pour couper les noms longs */}
                    <View style={styles.infoContainer}>
                        <Text 
                            style={[styles.username, { color: cardConfig.textColor }]} 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                        >
                            {user.login}
                        </Text>
                        <Text style={[styles.titleText, { color: cardConfig.textColor, opacity: 0.6 }]}>
                            {getTitle(rank)}
                        </Text>
                    </View>

                    {/* SCORE - Verrouillé à droite */}
                    <View style={styles.scoreContainer}>
                        <Text style={[
                            styles.scoreText, 
                            { color: isPodium ? cardConfig.textColor : colors.coral }
                        ]}>
                            {user.level || 1}
                        </Text>
                        {isPodium && (
                            <Text style={[styles.pointsLabel, { color: cardConfig.textColor, opacity: 0.5 }]}>
                                NIVEAU
                            </Text>
                        )}
                    </View>
                </View>

                {/* DETAILS AU CLIC */}
                {expanded && (
                    <View style={[styles.detailsContainer, { borderTopColor: isPodium ? 'rgba(0,0,0,0.1)' : themeColors.overlayLight }]}>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailValue, { color: cardConfig.textColor }]}>{user.bestScore.toLocaleString()}</Text>
                            <Text style={[styles.detailLabel, { color: cardConfig.textColor, opacity: 0.6 }]}>Record</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: isPodium ? 'rgba(0,0,0,0.1)' : themeColors.overlayLight }]} />
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailValue, { color: cardConfig.textColor }]}>{user.xp || 0}</Text>
                            <Text style={[styles.detailLabel, { color: cardConfig.textColor, opacity: 0.6 }]}>XP Total</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: spacing.xl,
        marginVertical: spacing.xs,
        overflow: 'hidden',
    },
    glowEffect: {
        shadowColor: '#FFB84D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    cardPodium: {
        borderRadius: 40,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    cardStandard: {
        borderRadius: 24,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    cardExpanded: {
        paddingBottom: spacing.sm,
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    avatarContainerPodium: {
        position: 'relative',
        marginRight: spacing.md,
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        overflow: 'hidden',
    },
    avatarPodium: {
        width: 54, height: 54, borderRadius: 27,
    },
    avatarStandard: {
        width: 40, height: 40, borderRadius: 20,
        marginHorizontal: spacing.md,
    },
    avatarInitial: {
        fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 20,
    },
    rankBadgePodium: {
        position: 'absolute', top: -4, left: -4,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)'
    },
    rankTextPodium: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 12 },
    rankTextStandard: { fontFamily: 'Poppins_800ExtraBold', fontSize: 20, width: 25, textAlign: 'center' },

    // CORRECTION DES NOMS LONGS : flex 1 pour prendre l'espace restant, flexShrink pour s'écraser
    infoContainer: { 
        flex: 1, 
        flexShrink: 1, 
        paddingRight: spacing.md 
    },
    username: { 
        fontFamily: 'Poppins_700Bold', 
        fontSize: 18, 
        marginBottom: -4,
        flexShrink: 1 
    },
    titleText: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
    
    // Le score ne s'écrase jamais
    scoreContainer: { 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        flexShrink: 0
    },
    scoreText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 22 },
    pointsLabel: { fontFamily: 'Poppins_700Bold', fontSize: 9, marginTop: -4, letterSpacing: 1 },
    
    detailsContainer: {
        flexDirection: 'row',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        justifyContent: 'space-around',
    },
    detailItem: { alignItems: 'center', flex: 1 },
    divider: { width: 1, height: '100%' },
    detailValue: { fontFamily: 'Poppins_800ExtraBold', fontSize: 16 },
    detailLabel: { fontFamily: 'Poppins_500Medium', fontSize: 10 },
});