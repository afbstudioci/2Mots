//src/screens/PrivacyScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/theme';

export default function PrivacyScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation();

    const Section = ({ title, content }: { title: string, content: string }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>{title}</Text>
            <Text style={[styles.sectionContent, { color: themeColors.textSecondary }]}>{content}</Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>CONFIDENTIALITÉ</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lastUpdate, { color: themeColors.textSecondary }]}>Dernière mise à jour : 26 Avril 2026</Text>

                <Section 
                    title="1. Collecte des données" 
                    content="Nous collectons uniquement les informations nécessaires à votre expérience de jeu : votre pseudo, votre email pour la sauvegarde de votre progression, et vos scores." 
                />

                <Section 
                    title="2. Utilisation des données" 
                    content="Vos données sont utilisées exclusivement pour gérer votre compte, afficher votre rang dans le classement et améliorer la génération des mots via notre IA." 
                />

                <Section 
                    title="3. Sécurité" 
                    content="Toutes vos informations sont stockées sur des serveurs sécurisés. Nous utilisons des protocoles de chiffrement modernes pour protéger vos échanges avec nos services." 
                />

                <Section 
                    title="4. Vos droits" 
                    content="Vous disposez d'un droit d'accès, de modification et de suppression de vos données. Vous pouvez exercer ces droits à tout moment depuis les paramètres de votre compte ou en nous contactant." 
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    backButton: { padding: spacing.xs },
    headerTitle: { ...typography.buttonPrimary, fontSize: 18, letterSpacing: 2 },
    headerSpacer: { width: 32 },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    lastUpdate: { ...typography.bodySmall, textAlign: 'center', marginBottom: spacing.xl, fontStyle: 'italic' },
    section: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.buttonPrimary, fontSize: 17, marginBottom: spacing.sm, textTransform: 'uppercase' },
    sectionContent: { ...typography.bodyMedium, lineHeight: 24 },
});