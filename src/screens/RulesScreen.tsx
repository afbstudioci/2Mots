//src/screens/RulesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, colors } from '../theme/theme';

export default function RulesScreen() {
  const { themeColors } = useTheme();
  const navigation = useNavigation();

  const RuleItem = ({ icon, title, description }: { icon: any; title: string; description: string }) => (
    <View
      style={[
        styles.rulecardBg,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.cardBorder,
          borderWidth: themeColors.cardBorderWidth,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '20' }]}>
        <Ionicons name={icon} size={24} color={colors.coral} />
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
          Bienvenue dans 2Mots ! Déduction pure, vitesse et perspicacité sont les clés de la victoire.
        </Text>

        <RuleItem
          icon="bulb"
          title="Le Point Commun"
          description="Deux mots s'affichent. Identifiez la seule caractéristique, matière, fonction ou propriété logique partagée par les deux termes."
        />

        <RuleItem
          icon="shield-checkmark"
          title="Pièges Asymétriques"
          description="Les faux choix sont très proches de l'un des deux mots, mais jamais des deux simultanément. Ne tombez pas dans le panneau !"
        />

        <RuleItem
          icon="timer"
          title="Chronomètre par Paliers"
          description="Le temps s'accélère avec votre niveau : 30s au départ, puis 25s, 20s, 15s et jusqu'à 10s pour les niveaux experts."
        />

        <RuleItem
          icon="flash"
          title="Bonus Combo Rapide"
          description="Trouvez la bonne réponse en moins de 3 secondes sans utiliser d'aide pour remporter un bonus immédiat de +2 Kevs et de l'XP supplémentaire !"
        />

        <RuleItem
          icon="alert-circle"
          title="Tolérance aux Erreurs"
          description="3 erreurs consécutives ou 5 erreurs cumulées mettent fin à la partie, à moins d'utiliser un joker Seconde Chance."
        />
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
  headerSpacer: { width: 32 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  introText: { ...typography.bodyMedium, textAlign: 'center', marginVertical: spacing.lg, lineHeight: 24 },
  rulecardBg: { flexDirection: 'row', padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.md, alignItems: 'center' },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
  ruleTextContent: { flex: 1 },
  ruleTitle: { ...typography.buttonPrimary, fontSize: 16, marginBottom: 4 },
  ruleDescription: { ...typography.bodySmall, lineHeight: 20 },
});