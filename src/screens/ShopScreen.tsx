//src/screens/ShopScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ShopScreen() {
  const { themeColors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const [isLoading, setIsLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [userKevs, setUserKevs] = useState(0);
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [isVip, setIsVip] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const vipPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(vipPulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(vipPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [vipPulseAnim]);

  const fetchShop = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/shop/catalog');
      const d = res.data.data;
      if (d) {
        setCatalog(d.catalog);
        setUserKevs(d.userKevs || 0);
        setStreakFreezes(d.streakFreezes || 0);
        setIsVip(Boolean(d.isVip));
      }
    } catch {
      // Fallback local élégant si offline
      setCatalog({
        vip: {
          id: 'vip_monthly',
          title: 'Pass VIP 2Mots',
          priceEur: '2,99 €',
          period: 'par mois',
          perks: [
            'Zéro publicité dans tout le jeu',
            '15 Kevs offerts chaque jour',
            'Badge doré et Couronne de prestige',
            'Accès illimité au mode Entraînement',
          ],
        },
        kevsPacks: [
          { id: 'kevs_150', title: 'Poignée de Kevs', amount: 150, bonus: 0, priceEur: '0,99 €', icon: 'diamond-outline' },
          { id: 'kevs_700', title: 'Bourse de Réflexion', amount: 600, bonus: 100, priceEur: '2,99 €', tag: 'POPULAIRE', icon: 'diamond' },
          { id: 'kevs_3000', title: 'Coffre du Maître', amount: 2500, bonus: 500, priceEur: '9,99 €', tag: 'MEILLEURE VALEUR', icon: 'trophy' },
        ],
        streaks: [
          { id: 'streak_shield_3', title: 'Pack 3 Boucliers de Flamme', desc: 'Protège votre série en cas d oubli.', priceKevs: 200, icon: 'flame' },
        ],
        boosters: [
          { id: 'time_freeze_3', title: '3x Time-Freeze (+5s)', desc: 'Gèle le chrono pendant 5s.', priceKevs: 45, type: 'timeFreeze', icon: 'hourglass-outline' },
          { id: 'super_clue_3', title: '3x Super-Indice', desc: 'Élimine 2 mauvais choix.', priceKevs: 75, type: 'superClue', icon: 'bulb-outline' },
          { id: 'second_chance_2', title: '2x Seconde Chance', desc: 'Permet de continuer après Game Over.', priceKevs: 100, type: 'secondChance', icon: 'refresh-circle-outline' },
        ],
        cosmetics: [
          { id: 'theme_cyberpunk', title: 'Thème Cyberpunk', desc: 'Ambiance néon futuriste.', priceKevs: 300, icon: 'color-palette-outline' },
          { id: 'frame_golden_crown', title: 'Cadre Couronne', desc: 'Aura étincelante sur avatar.', priceKevs: 250, icon: 'sparkles-outline' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleBuyWithKevs = (item: any, category: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (userKevs < item.priceKevs) {
      setAlertConfig({
        visible: true,
        title: 'KEVS INSUFFISANTS',
        message: `Il vous manque ${item.priceKevs - userKevs} Kevs pour obtenir cet article. Résolvez des énigmes ou rechargez vos Kevs !`,
        type: 'info',
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: 'CONFIRMER L ACHAT',
      message: `Voulez-vous acheter "${item.title}" pour ${item.priceKevs} Kevs ?`,
      onConfirm: async () => {
        try {
          const res = await api.post('/shop/buy-with-kevs', { itemId: item.id, category });
          const d = res.data.data;
          setUserKevs(d.userKevs);
          if (d.streakFreezes !== undefined) setStreakFreezes(d.streakFreezes);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          setAlertConfig({
            visible: true,
            title: 'FÉLICITATIONS !',
            message: `Vous avez obtenu : ${item.title}`,
            type: 'success',
          });
        } catch (err: any) {
          setAlertConfig({
            visible: true,
            title: 'ERREUR',
            message: err.response?.data?.message || 'Achat impossible actuellement.',
            type: 'error',
          });
        }
      },
    });
  };

  const handleInAppPurchase = (pack: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    setAlertConfig({
      visible: true,
      title: 'ACHAT SÉCURISÉ',
      message: `Confirmer la commande de "${pack.title}" (${pack.priceEur}) ?`,
      onConfirm: async () => {
        try {
          const res = await api.post('/shop/verify-purchase', { packId: pack.id });
          const d = res.data.data;
          setUserKevs(d.userKevs);
          if (d.isVip) setIsVip(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          setAlertConfig({
            visible: true,
            title: 'ACHAT CONFIRMÉ !',
            message: 'Merci pour votre soutien ! Vos avantages ont été ajoutés à votre compte.',
            type: 'success',
          });
        } catch {
          setAlertConfig({
            visible: true,
            title: 'ERREUR',
            message: 'Le service de paiement est temporairement indisponible.',
            type: 'error',
          });
        }
      },
    });
  };

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      {/* Entête avec Solde et Boucliers */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>BOUTIQUE</Text>

        <View style={styles.headerStats}>
          <View style={[styles.statBadge, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="flame" size={16} color={colors.coral} />
            <Text style={[styles.statText, { color: colors.coral }]}>{streakFreezes}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: themeColors.surface, marginLeft: 8 }]}>
            <Ionicons name="diamond" size={15} color={colors.mint} />
            <Text style={[styles.statText, { color: colors.mint }]}>{userKevs}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchShop} tintColor={colors.coral} />}
      >
        {/* 1. CARTE BANNIÈRE PASS VIP */}
        {catalog?.vip && (
          <Animated.View
            style={[
              styles.vipCard,
              {
                backgroundColor: isDark ? '#261B0B' : '#FFF9E6',
                borderColor: '#FFD700',
                transform: [{ scale: vipPulseAnim }],
              },
            ]}
          >
            <View style={styles.vipHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ribbon" size={24} color="#FFD700" style={{ marginRight: 8 }} />
                <Text style={styles.vipTitle}>{catalog.vip.title}</Text>
              </View>
              <View style={styles.vipPriceBadge}>
                <Text style={styles.vipPriceText}>{catalog.vip.priceEur}</Text>
                <Text style={styles.vipPeriodText}>/mois</Text>
              </View>
            </View>

            <View style={styles.vipPerksList}>
              {catalog.vip.perks.map((perk: string, idx: number) => (
                <View key={idx} style={styles.perkRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFD700" style={{ marginRight: 6 }} />
                  <Text style={[styles.perkText, { color: themeColors.text }]}>{perk}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.vipButton, { backgroundColor: '#FFD700' }]}
              onPress={() => handleInAppPurchase(catalog.vip)}
              activeOpacity={0.85}
            >
              <Text style={styles.vipButtonText}>
                {isVip ? 'MEMBRE VIP ACTIF' : 'DEVENIR VIP (2,99 €)'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* 2. PACKS DE KEVS IN-APP */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>💎 PACKS DE KEVS</Text>
        <View style={styles.packsGrid}>
          {catalog?.kevsPacks?.map((pack: any) => (
            <View
              key={pack.id}
              style={[
                styles.packCard,
                { backgroundColor: themeColors.card, borderColor: pack.tag ? colors.coral : themeColors.border },
              ]}
            >
              {pack.tag && (
                <View style={[styles.tagBadge, { backgroundColor: colors.coral }]}>
                  <Text style={styles.tagText}>{pack.tag}</Text>
                </View>
              )}
              <View style={[styles.packIconBox, { backgroundColor: colors.coral + '15' }]}>
                <Ionicons name={pack.icon} size={30} color={colors.coral} />
              </View>
              <Text style={[styles.packAmount, { color: themeColors.text }]}>{pack.amount} Kevs</Text>
              {pack.bonus > 0 && <Text style={styles.packBonus}>+{pack.bonus} Offerts</Text>}
              <TouchableOpacity
                style={[styles.packBuyBtn, { backgroundColor: colors.coral }]}
                onPress={() => handleInAppPurchase(pack)}
              >
                <Text style={styles.packBuyBtnText}>{pack.priceEur}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 3. BOUCLIERS DE FLAMME */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>🔥 BOUCLIERS DE SÉRIE</Text>
        {catalog?.streaks?.map((st: any) => (
          <View
            key={st.id}
            style={[styles.singleItemRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <View style={[styles.itemIconBox, { backgroundColor: colors.coral + '20' }]}>
              <Ionicons name="flame" size={26} color={colors.coral} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: themeColors.text }]}>{st.title}</Text>
              <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]}>{st.desc}</Text>
            </View>
            <TouchableOpacity
              style={[styles.kevsBuyBtn, { backgroundColor: colors.coral }]}
              onPress={() => handleBuyWithKevs(st, 'streaks')}
            >
              <Text style={styles.kevsBuyBtnText}>{st.priceKevs}</Text>
              <Ionicons name="diamond" size={13} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        ))}

        {/* 4. JOKERS TACTIQUES */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>⚡ JOKERS TACTIQUES</Text>
        {catalog?.boosters?.map((booster: any) => (
          <View
            key={booster.id}
            style={[styles.singleItemRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <View style={[styles.itemIconBox, { backgroundColor: colors.mint + '20' }]}>
              <Ionicons name={booster.icon} size={24} color={colors.mint} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: themeColors.text }]}>{booster.title}</Text>
              <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]}>{booster.desc}</Text>
            </View>
            <TouchableOpacity
              style={[styles.kevsBuyBtn, { backgroundColor: colors.mint }]}
              onPress={() => handleBuyWithKevs(booster, 'boosters')}
            >
              <Text style={styles.kevsBuyBtnText}>{booster.priceKevs}</Text>
              <Ionicons name="diamond" size={13} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        ))}

        {/* 5. COSMÉTIQUES & AURAS */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>✨ COSMÉTIQUES DE PRESTIGE</Text>
        {catalog?.cosmetics?.map((cosm: any) => (
          <View
            key={cosm.id}
            style={[styles.singleItemRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#A066FF25' }]}>
              <Ionicons name={cosm.icon} size={24} color="#A066FF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: themeColors.text }]}>{cosm.title}</Text>
              <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]}>{cosm.desc}</Text>
            </View>
            <TouchableOpacity
              style={[styles.kevsBuyBtn, { backgroundColor: '#A066FF' }]}
              onPress={() => handleBuyWithKevs(cosm, 'cosmetics')}
            >
              <Text style={styles.kevsBuyBtnText}>{cosm.priceKevs}</Text>
              <Ionicons name="diamond" size={13} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {alertConfig.visible && (
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onConfirm={alertConfig.onConfirm}
        />
      )}
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
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', letterSpacing: 2 },
  headerStats: { flexDirection: 'row', alignItems: 'center' },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
  },
  statText: { fontSize: 13, fontFamily: 'Poppins_700Bold', marginLeft: 4 },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  vipCard: {
    borderRadius: 24,
    borderWidth: 2,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium(false),
  },
  vipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  vipTitle: { fontSize: 18, fontFamily: 'Poppins_900Black', color: '#B38B00' },
  vipPriceBadge: { alignItems: 'flex-end' },
  vipPriceText: { fontSize: 18, fontFamily: 'Poppins_900Black', color: '#B38B00' },
  vipPeriodText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: '#B38B00' },
  vipPerksList: { marginBottom: spacing.md },
  perkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  perkText: { fontSize: 13, fontFamily: 'Poppins_500Medium' },
  vipButton: {
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  vipButtonText: { color: '#000', fontFamily: 'Poppins_900Black', fontSize: 14, letterSpacing: 0.5 },
  sectionHeading: { fontSize: 13, fontFamily: 'Poppins_700Bold', letterSpacing: 1.5, marginTop: spacing.md, marginBottom: spacing.sm, marginLeft: 4 },
  packsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  packCard: {
    width: (width - spacing.md * 2 - 16) / 3,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: spacing.sm,
    alignItems: 'center',
    position: 'relative',
    ...shadows.soft(false),
  },
  tagBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: { color: '#FFF', fontSize: 8, fontFamily: 'Poppins_900Black' },
  packIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 6, marginBottom: 6 },
  packAmount: { fontSize: 13, fontFamily: 'Poppins_700Bold', textAlign: 'center' },
  packBonus: { fontSize: 9, fontFamily: 'Poppins_700Bold', color: colors.coral, marginBottom: 6 },
  packBuyBtn: { width: '100%', paddingVertical: 6, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  packBuyBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 12 },
  singleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    ...shadows.soft(false),
  },
  itemIconBox: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontFamily: 'Poppins_700Bold' },
  itemDesc: { fontSize: 11, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  kevsBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  kevsBuyBtnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 13 },
});