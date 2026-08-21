//src/screens/ContactScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius, colors } from '../theme/theme';
import api from '../services/api';

interface ContactConfig {
  facebook: string;
  whatsapp: string;
  phone: string;
  email: string;
}

const DEFAULT_CONFIG: ContactConfig = {
  facebook: 'https://www.facebook.com',
  whatsapp: 'https://wa.me/2250700000000',
  phone: '+2250700000000',
  email: 'afbstudio@gmail.com',
};

export default function ContactScreen() {
  const { themeColors, isDark } = useTheme();
  const navigation = useNavigation();
  const [config, setConfig] = useState<ContactConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/config');
      if (response.data?.data?.contact) {
        setConfig((prev) => ({
          ...prev,
          ...response.data.data.contact,
        }));
      }
    } catch {
      // Conserve la configuration par défaut en cas d'absence de réseau
    }
  };

  const handleAction = async (type: string) => {
    let targetUrl = '';

    switch (type) {
      case 'whatsapp':
        targetUrl = config.whatsapp || 'https://wa.me/2250700000000';
        break;
      case 'facebook':
        targetUrl = config.facebook || 'https://www.facebook.com';
        break;
      case 'phone':
        targetUrl = `tel:${config.phone || '+2250700000000'}`;
        break;
      case 'email':
        targetUrl = `mailto:${config.email || 'afbstudio@gmail.com'}?subject=Support%202Mots`;
        break;
      default:
        return;
    }

    try {
      await Linking.openURL(targetUrl);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir l'application correspondante sur cet appareil.");
    }
  };

  const ContactCard = ({ icon, title, subtitle, type, color }: any) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.cardBorder,
          borderWidth: themeColors.cardBorderWidth,
        },
      ]}
      activeOpacity={0.75}
      onPress={() => handleAction(type)}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="open-outline" size={20} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: themeColors.overlay }]}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>NOUS CONTACTER</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          Notre équipe est à votre disposition pour vous répondre rapidement via l'un de ces canaux.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={themeColors.primary} style={styles.loader} />
        ) : (
          <View style={styles.cardsContainer}>
            <ContactCard
              icon="logo-whatsapp"
              title="WhatsApp"
              subtitle="Support direct & réactif"
              type="whatsapp"
              color="#25D366"
            />
            <ContactCard
              icon="mail"
              title="Email officiel"
              subtitle="afbstudio@gmail.com"
              type="email"
              color={colors.coral}
            />
            <ContactCard
              icon="logo-facebook"
              title="Facebook"
              subtitle="Communauté 2Mots"
              type="facebook"
              color="#1877F2"
            />
            <ContactCard
              icon="call"
              title="Téléphone"
              subtitle="Appel direct"
              type="phone"
              color={colors.mint}
            />
          </View>
        )}
      </View>
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
  backButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
  headerSpacer: { width: 40 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  description: { ...typography.bodyMedium, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  loader: { marginTop: spacing.xl * 2 },
  cardsContainer: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.buttonPrimary, fontSize: 15.5 },
  cardSubtitle: { ...typography.bodySmall, fontSize: 12.5, marginTop: 2 },
});