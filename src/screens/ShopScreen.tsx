//src/screens/ShopScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CustomAlert from '../components/common/CustomAlert';
import VipCard from '../components/shop/VipCard';
import KevsPacksGrid from '../components/shop/KevsPacksGrid';
import ShopRowItem from '../components/shop/ShopRowItem';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme/theme';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

export default function ShopScreen() {
  const { themeColors } = useTheme();
  const { user, refreshProfile } = useAuth();
  const navigation = useNavigation<any>();

  const [isLoading, setIsLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [userKevs, setUserKevs] = useState(user?.kevs || 0);
  const [streakFreezes, setStreakFreezes] = useState(user?.streakFreezes || 1);
  const [isVip, setIsVip] = useState(Boolean(user?.isVip));

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const fetchShop = async () => {
    try {
      setIsLoading(true);
      await refreshProfile();
      const res = await api.get('/shop/catalog');
      const d = res.data.data;
      if (d) {
        setCatalog(d.catalog);
        setUserKevs(d.userKevs ?? user?.kevs ?? 0);
        setStreakFreezes(d.streakFreezes ?? user?.streakFreezes ?? 1);
        setIsVip(Boolean(d.isVip ?? user?.isVip));
      }
    } catch {
      setCatalog({
        vip: {
          id: 'vip_monthly',
          title: 'Pass VIP 2Mots',
          priceEur: '2,99 €',
          perks: ['Zero pub', '15 Kevs/jour', 'Badge dore', 'Entrainement illimite'],
        },
        kevsPacks: [
          { id: 'kevs_150', title: 'Poignee', amount: 150, bonus: 0, priceEur: '0,99 €', icon: 'diamond-outline' },
          { id: 'kevs_700', title: 'Bourse', amount: 600, bonus: 100, priceEur: '2,99 €', tag: 'POPULAIRE', icon: 'diamond' },
          { id: 'kevs_3000', title: 'Coffre', amount: 2500, bonus: 500, priceEur: '9,99 €', tag: 'MEILLEURE VALEUR', icon: 'trophy' },
        ],
        streaks: [
          { id: 'streak_shield_3', title: 'Pack 3 Boucliers de Flamme', desc: 'Protege votre serie quotidienne.', priceKevs: 200, icon: 'flame' },
        ],
        boosters: [
          { id: 'time_freeze_3', title: '3x Time-Freeze (+5s)', desc: 'Gele le chrono pendant 5s.', priceKevs: 45, icon: 'hourglass-outline' },
          { id: 'super_clue_3', title: '3x Super-Indice', desc: 'Elimine 2 mauvais choix.', priceKevs: 75, icon: 'bulb-outline' },
          { id: 'second_chance_2', title: '2x Seconde Chance', desc: 'Permet de continuer apres Game Over.', priceKevs: 100, icon: 'refresh-circle-outline' },
        ],
        cosmetics: [
          { id: 'theme_cyberpunk', title: 'Theme Neon Cyberpunk', desc: 'Ambiance futuriste aux neons vibrants.', priceKevs: 300, icon: 'color-palette-outline' },
          { id: 'frame_golden_crown', title: 'Cadre Couronne Doree', desc: 'Une aura etincelante pour votre avatar.', priceKevs: 250, icon: 'sparkles-outline' },
        ],
      });
      setUserKevs(user?.kevs || 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleBuyWithKevs = (item: any, category: string) => {
    if (userKevs < item.priceKevs) {
      setAlertConfig({
        visible: true,
        title: 'KEVS INSUFFISANTS',
        message: `Il vous manque ${item.priceKevs - userKevs} Kevs pour obtenir cet article.`,
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
          if (user) user.kevs = d.userKevs;
          if (d.streakFreezes !== undefined) setStreakFreezes(d.streakFreezes);
          setAlertConfig({ visible: true, title: 'FELICITATIONS !', message: `Vous avez obtenu : ${item.title}`, type: 'success' });
        } catch (err: any) {
          setAlertConfig({ visible: true, title: 'ERREUR', message: err.response?.data?.message || 'Achat impossible.', type: 'error' });
        }
      },
    });
  };

  const handleInAppPurchase = (pack: any) => {
    setAlertConfig({
      visible: true,
      title: 'ACHAT SECURISE',
      message: `Confirmer la commande de "${pack.title}" (${pack.priceEur}) ?`,
      onConfirm: async () => {
        try {
          const res = await api.post('/shop/verify-purchase', { packId: pack.id });
          const d = res.data.data;
          setUserKevs(d.userKevs);
          if (user) user.kevs = d.userKevs;
          if (d.isVip) setIsVip(true);
          setAlertConfig({ visible: true, title: 'ACHAT CONFIRME !', message: 'Avantages ajoutes a votre compte.', type: 'success' });
        } catch {
          setAlertConfig({ visible: true, title: 'ERREUR', message: 'Service de paiement indisponible.', type: 'error' });
        }
      },
    });
  };

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
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
        {catalog?.vip && <VipCard vip={catalog.vip} isVip={isVip} onBuy={() => handleInAppPurchase(catalog.vip)} />}

        <View style={styles.sectionHeadingRow}>
          <Ionicons name="diamond" size={16} color={colors.coral} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PACKS DE KEVS</Text>
        </View>
        <KevsPacksGrid packs={catalog?.kevsPacks} onBuy={handleInAppPurchase} />

        <View style={styles.sectionHeadingRow}>
          <Ionicons name="flame" size={16} color={colors.coral} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>BOUCLIERS DE SERIE</Text>
        </View>
        {catalog?.streaks?.map((st: any) => (
          <ShopRowItem
            key={st.id}
            title={st.title}
            desc={st.desc}
            priceKevs={st.priceKevs}
            icon={st.icon}
            accentColor={colors.coral}
            onBuy={() => handleBuyWithKevs(st, 'streaks')}
          />
        ))}

        <View style={styles.sectionHeadingRow}>
          <Ionicons name="flash" size={16} color={colors.mint} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>JOKERS TACTIQUES</Text>
        </View>
        {catalog?.boosters?.map((b: any) => (
          <ShopRowItem
            key={b.id}
            title={b.title}
            desc={b.desc}
            priceKevs={b.priceKevs}
            icon={b.icon}
            accentColor={colors.mint}
            onBuy={() => handleBuyWithKevs(b, 'boosters')}
          />
        ))}

        <View style={styles.sectionHeadingRow}>
          <Ionicons name="sparkles" size={16} color="#A066FF" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>COSMETIQUES DE PRESTIGE</Text>
        </View>
        {catalog?.cosmetics?.map((c: any) => (
          <ShopRowItem
            key={c.id}
            title={c.title}
            desc={c.desc}
            priceKevs={c.priceKevs}
            icon={c.icon}
            accentColor="#A066FF"
            onBuy={() => handleBuyWithKevs(c, 'cosmetics')}
          />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { padding: spacing.xs },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', letterSpacing: 2 },
  headerStats: { flexDirection: 'row', alignItems: 'center' },
  statBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: borderRadius.md },
  statText: { fontSize: 13, fontFamily: 'Poppins_700Bold', marginLeft: 4 },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: 170 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm, marginLeft: 4 },
  sectionHeading: { fontSize: 13, fontFamily: 'Poppins_700Bold', letterSpacing: 1.5 },
});