// src/screens/ShopScreen.tsx
// ECRAN DE BOUTIQUE AVEC SYNCHRONISATION EN TEMPS REEL DU SOLDE DE KEVS
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis, Typographie Française Soignée)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import VipCard from '../components/shop/VipCard';
import { FreeKevsCard } from '../components/shop/FreeKevsCard';
import KevsPacksGrid from '../components/shop/KevsPacksGrid';
import ShopRowItem from '../components/shop/ShopRowItem';
import ShopItemDetailModal from '../components/shop/ShopItemDetailModal';
import CustomAlert from '../components/common/CustomAlert';
import KevIcon from '../components/common/KevIcon';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import { ACCENT_MAP, DEFAULT_SHOP_CATALOG } from '../constants/shopCatalog';
import { useShopPayment } from '../hooks/useShopPayment';
import api from '../services/api';

export default function ShopScreen() {
  const { themeColors } = useTheme();
  const { user, updateUser } = useAuth();
  const navigation = useNavigation<any>();

  const [catalog, setCatalog] = useState<any>(DEFAULT_SHOP_CATALOG);
  const userKevs = user?.kevs || 0;
  const streakFreezes = user?.streakFreezes || 0;
  const isVip = Boolean(user?.isVip);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);

  const {
    isProcessingPayment,
    processingItemId,
    alertConfig,
    handleBuyWithKevs,
    handleInAppPurchase,
    closeAlert,
  } = useShopPayment(
    user,
    userKevs,
    (k) => updateUser({ kevs: k }),
    (v) => updateUser({ isVip: v }),
    (s) => updateUser({ streakFreezes: s }),
    updateUser
  );

  const sanitizeCatalog = (rawCatalog: any) => {
    const fixItem = (item: any) => {
      const mapped = ACCENT_MAP[item.id];
      return { ...item, title: mapped?.title || item.title, desc: mapped?.desc || item.desc };
    };

    return {
      vip: { ...rawCatalog.vip, perks: DEFAULT_SHOP_CATALOG.vip.perks },
      kevsPacks: (rawCatalog.kevsPacks?.length ? rawCatalog.kevsPacks : DEFAULT_SHOP_CATALOG.kevsPacks).map(fixItem),
      streaks: (rawCatalog.streaks?.length ? rawCatalog.streaks : DEFAULT_SHOP_CATALOG.streaks).map(fixItem),
      boosters: (rawCatalog.boosters?.length ? rawCatalog.boosters : DEFAULT_SHOP_CATALOG.boosters).map(fixItem),
      combos: (rawCatalog.combos?.length ? rawCatalog.combos : DEFAULT_SHOP_CATALOG.combos).map(fixItem),
    };
  };

  const fetchShop = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/shop/catalog');
      const d = res.data?.data;
      if (d) {
        if (d.catalog) setCatalog(sanitizeCatalog(d.catalog));
        updateUser({
          kevs: d.userKevs !== undefined ? d.userKevs : user?.kevs,
          streakFreezes: d.streakFreezes !== undefined ? d.streakFreezes : user?.streakFreezes,
          isVip: d.isVip !== undefined ? d.isVip : user?.isVip,
          inventory: d.inventory || user?.inventory,
        });
      }
    } catch { } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>BOUTIQUE</Text>
        <View style={styles.headerStats}>
          <View style={[styles.badge, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="flame" size={15} color={colors.coral} />
            <Text style={[styles.badgeText, { color: themeColors.text }]}>{streakFreezes}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: themeColors.surface }]}>
            <KevIcon size={17} />
            <Text style={[styles.badgeText, { color: themeColors.text }]}>{userKevs}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchShop} tintColor={colors.coral} />}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedDetailItem(catalog.vip)}
          disabled={isProcessingPayment}
        >
          <VipCard
            vip={catalog.vip}
            isVip={isVip}
            isLoading={isProcessingPayment && processingItemId === catalog.vip?.id}
            onBuy={() => handleInAppPurchase(catalog.vip)}
          />
        </TouchableOpacity>

        {!isVip && (
          <FreeKevsCard onRewardClaimed={(newKevs) => updateUser({ kevs: newKevs })} />
        )}

        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PACKS DE KEVS</Text>
        <KevsPacksGrid
          packs={catalog.kevsPacks}
          processingPackId={isProcessingPayment ? processingItemId : null}
          onPressPack={(pack) => setSelectedDetailItem(pack)}
          onBuy={handleInAppPurchase}
        />

        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>BOUCLIERS DE SÉRIE</Text>
        {catalog.streaks?.map((item: any) => (
          <ShopRowItem
            key={item.id}
            title={item.title}
            desc={item.desc}
            priceKevs={item.priceKevs}
            icon={item.icon}
            accentColor={item.accentColor}
            isLoading={isProcessingPayment && processingItemId === item.id}
            onPressItem={() => setSelectedDetailItem(item)}
            onBuy={() => handleBuyWithKevs(item, 'streaks')}
          />
        ))}

        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>JOKERS TACTIQUES</Text>
        {catalog.boosters?.map((item: any) => (
          <ShopRowItem
            key={item.id}
            title={item.title}
            desc={item.desc}
            priceKevs={item.priceKevs}
            icon={item.icon}
            accentColor={item.accentColor}
            isLoading={isProcessingPayment && processingItemId === item.id}
            onPressItem={() => setSelectedDetailItem(item)}
            onBuy={() => handleBuyWithKevs(item, 'boosters')}
          />
        ))}

        {catalog.combos && catalog.combos.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PACKS COMBOS ÉCONOMIQUES</Text>
            {catalog.combos.map((item: any) => (
              <ShopRowItem
                key={item.id}
                title={item.title}
                desc={item.desc}
                priceKevs={item.priceKevs}
                icon={item.icon}
                accentColor={item.accentColor}
                isLoading={isProcessingPayment && processingItemId === item.id}
                onPressItem={() => setSelectedDetailItem(item)}
                onBuy={() => handleBuyWithKevs(item, 'combos')}
              />
            ))}
          </>
        )}
      </ScrollView>

      <ShopItemDetailModal
        visible={Boolean(selectedDetailItem)}
        item={selectedDetailItem}
        isLoading={isProcessingPayment && processingItemId === selectedDetailItem?.id}
        onClose={() => setSelectedDetailItem(null)}
        onBuy={(item) => {
          if (item.priceEur) handleInAppPurchase(item);
          else handleBuyWithKevs(item, item.category);
        }}
      />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        isLoading={alertConfig.isLoading || isProcessingPayment}
        buttonText={alertConfig.buttonText}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
        onClose={closeAlert}
      />
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
  headerTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18, letterSpacing: 2 },
  headerStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  badgeText: { fontFamily: 'Poppins_700Bold', fontSize: 13, marginLeft: 4 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});