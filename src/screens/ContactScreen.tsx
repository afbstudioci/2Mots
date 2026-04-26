//src/screens/ContactScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius } from '../theme/theme';
import api from '../services/api';

interface ContactConfig {
    facebook: string;
    whatsapp: string;
    phone: string;
    email: string;
}

export default function ContactScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation();
    const [config, setConfig] = useState<ContactConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/config');
            if (response.data?.data?.contact) {
                setConfig(response.data.data.contact);
            }
        } catch (error) {
            setConfig({ facebook: "https://facebook.com", whatsapp: "https://wa.me/000", phone: "000", email: "contact@2mots.com" });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type: string) => {
        if (!config) return;
        let url = type === 'facebook' ? config.facebook : type === 'whatsapp' ? config.whatsapp : `tel:${config.phone}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(url);
        } catch (error) {
            Alert.alert("Erreur", "Action impossible sur cet appareil.");
        }
    };

    const ContactcardBg = ({ icon, title, subtitle, type, color }: any) => (
        <TouchableOpacity 
            style={[
                styles.cardBg, 
                { 
                    backgroundColor: themeColors.card, 
                    borderColor: themeColors.cardBorder,
                    borderWidth: themeColors.cardBorderWidth
                }
            ]} 
            activeOpacity={0.7}
            onPress={() => handleAction(type)}
        >
            <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={styles.cardBgContent}>
                <Text style={[styles.cardBgTitle, { color: themeColors.text }]}>{title}</Text>
                <Text style={[styles.cardBgSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>NOUS CONTACTER</Text>
                <View style={styles.headerSpacer} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.description, { color: themeColors.textSecondary }]}>
                    Notre équipe vous répondra rapidement via l'un de ces canaux.
                </Text>
                {loading ? (
                    <ActivityIndicator size="large" color={themeColors.primary} style={styles.loader} />
                ) : (
                    <View style={styles.cardBgsContainer}>
                        <ContactcardBg icon="logo-whatsapp" title="WhatsApp" subtitle="Support direct" type="whatsapp" color="#25D366" />
                        <ContactcardBg icon="logo-facebook" title="Facebook" subtitle="Communauté" type="facebook" color="#1877F2" />
                        <ContactcardBg icon="call" title="Téléphone" subtitle="Appel direct" type="phone" color={themeColors.primary} />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    backButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    headerSpacer: { width: 32 },
    content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    description: { ...typography.bodyMedium, textAlign: 'center', marginBottom: spacing.xl },
    loader: { marginTop: spacing.xl * 2 },
    cardBgsContainer: { gap: spacing.md },
    cardBg: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md },
    iconWrapper: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    cardBgContent: { flex: 1 },
    cardBgTitle: { ...typography.buttonPrimary, fontSize: 16 },
    cardBgSubtitle: { ...typography.bodySmall, fontSize: 13 },
});