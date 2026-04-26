//src/screens/RulesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../theme/theme';

export default function RulesScreen() {
    const { themeColors } = useTheme();
    const navigation = useNavigation();

    const RuleItem = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
        <View style={[styles.rulecardBg, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder, borderWidth: themeColors.cardBorderWidth }]}>
            <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '20' }]}>
                <Ionicons name={icon} size={24} color={themeColors.primary} />
            </View>
            <View style={styles.ruleTextContent}>
                <Text style={[styles.ruleTitle, { color: themeColors.text }]}>{title}</Text>
                <Text style={[styles.ruleDescription, { color: themeColors.textSecondary }]}>{description}</Text>
            </View>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>RÈGLES DU JEU</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.introText, { color: themeColors.textSecondary }]}>
                    Bienvenue dans 2Mots ! Le principe est simple mais demande de la rapidité et de la précision.
                </Text>

                <RuleItem 
                    icon="flash" 
                    title="Le Concept" 
                    description="Deux mots s'affichent à l'écran. Votre mission est de trouver le mot qui les lie ou leur combinaison logique le plus vite possible." 
                />

                <RuleItem 
                    icon="timer" 
                    title="Le Temps" 
                    description="Vous commencez avec un chronomètre. Chaque bonne réponse vous fait gagner quelques secondes précieuses." 
                />

                <RuleItem 
                    icon="trending-up" 
                    title="Niveaux & XP" 
                    description="Plus vous enchaînez de bonnes réponses, plus vous gagnez d'XP pour monter en niveau et grimper dans le classement mondial." 
                />

                <RuleItem 
                    icon="trophy" 
                    title="Le Score" 
                    description="Votre score final dépend du nombre de mots trouvés et de votre précision. Visez le sommet du TOP 10 !" 
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
    introText: { ...typography.bodyMedium, textAlign: 'center', marginVertical: spacing.lg, lineHeight: 24 },
    rulecardBg: { flexDirection: 'row', padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.md, alignItems: 'center' },
    iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
    ruleTextContent: { flex: 1 },
    ruleTitle: { ...typography.buttonPrimary, fontSize: 16, marginBottom: 4 },
    ruleDescription: { ...typography.bodySmall, lineHeight: 20 },
});