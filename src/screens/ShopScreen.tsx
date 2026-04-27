import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import EmptyState from '../components/common/EmptyState';
import { useShop } from '../hooks/useShop';
import { spacing, borderRadius, typography, colors } from '../theme/theme';

export default function ShopScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation();
    const { items, isLoading, fetchShopItems } = useShop();

    useEffect(() => {
        fetchShopItems();
    }, [fetchShopItems]);

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>BOUTIQUE</Text>
                
                {/* Solde fictif de Kevs */}
                <View style={[styles.balanceBadge, { backgroundColor: themeColors.surface }]}>
                    <Text style={[styles.balanceText, { color: colors.mint }]}>120</Text>
                    <Ionicons name="diamond" size={14} color={colors.mint} style={{ marginLeft: 4 }} />
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={items.length === 0 ? styles.emptyScrollContent : styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchShopItems} tintColor={themeColors.primary} />
                }
            >
                {items.length === 0 && !isLoading ? (
                    <EmptyState 
                        icon="basket"
                        iconColor={themeColors.primary}
                        title="Rayons Vides"
                        message="Les marchands sont encore en route avec de nouveaux bonus et indices. Revenez plus tard !"
                        actionLabel="Rafraîchir"
                        onAction={fetchShopItems}
                    />
                ) : (
                    <>
                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>BOOSTERS</Text>
                        
                        <View style={styles.itemsGrid}>
                            {items.map((item, index) => (
                                <View key={index} style={[styles.itemCard, { backgroundColor: themeColors.card }]}>
                                    <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 127, 80, 0.1)' }]}>
                                        <Ionicons name="time" size={32} color={themeColors.primary} />
                                    </View>
                                    <Text style={[styles.itemTitle, { color: themeColors.text }]}>{item.name}</Text>
                                    <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]}>{item.description}</Text>
                                    <TouchableOpacity style={[styles.buyButton, { backgroundColor: themeColors.primary }]}>
                                        <Text style={styles.buyText}>{item.price} Kevs</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    balanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: borderRadius.md,
    },
    balanceText: { ...typography.buttonPrimary, fontSize: 14 },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
    emptyScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    sectionTitle: {
        ...typography.bodySmall,
        letterSpacing: 2,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    itemCard: {
        width: '47%', // 2 colonnes
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    itemTitle: {
        ...typography.buttonPrimary,
        fontSize: 14,
        textAlign: 'center',
    },
    itemDesc: {
        ...typography.bodySmall,
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: spacing.lg,
    },
    buyButton: {
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.xl,
        width: '100%',
        alignItems: 'center',
    },
    buyText: {
        ...typography.buttonPrimary,
        color: colors.white,
        fontSize: 12,
    },
});