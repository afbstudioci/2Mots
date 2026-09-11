//src/screens/RulesScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, colors } from '../theme/theme';

export default function RulesScreen({ route }: any) {
  const { themeColors } = useTheme();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<'classic' | 'duel'>(
    route?.params?.initialTab === 'duel' ? 'duel' : 'classic'
  );

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

      {/* Sélecteur d'onglets élégant */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.overlayLight }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('classic')}
          style={[
            styles.tabButton,
            activeTab === 'classic' && {
              backgroundColor: themeColors.card,
              borderColor: themeColors.cardBorder,
              borderWidth: themeColors.cardBorderWidth,
            },
          ]}
        >
          <Ionicons
            name="book-outline"
            size={16}
            color={activeTab === 'classic' ? themeColors.primary : themeColors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'classic' ? themeColors.primary : themeColors.textSecondary },
            ]}
          >
            JEU SOLO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('duel')}
          style={[
            styles.tabButton,
            activeTab === 'duel' && {
              backgroundColor: themeColors.card,
              borderColor: themeColors.cardBorder,
              borderWidth: themeColors.cardBorderWidth,
            },
          ]}
        >
          <Ionicons
            name="flash-outline"
            size={16}
            color={activeTab === 'duel' ? colors.coral : themeColors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'duel' ? colors.coral : themeColors.textSecondary },
            ]}
          >
            DUEL 1V1
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'classic' ? (
          <>
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
          </>
        ) : (
          <>
            <Text style={[styles.introText, { color: themeColors.textSecondary }]}>
              Affrontez d'autres joueurs en temps réel. Misez vos Kevs, buzzez au bon moment et remportez la victoire !
            </Text>

            <RuleItem
              icon="trophy"
              title="Mise & Gains en Kevs"
              description="Le créateur du duel choisit la mise (ex: 30 Kevs). Les deux joueurs engagent la même somme et le vainqueur rafle la totalité du pot (60 Kevs) +50 XP !"
            />

            <RuleItem
              icon="share-social"
              title="Invitation & Partage Direct"
              description="Partagez le lien de votre défi via WhatsApp, Telegram, SMS ou Facebook. S'il possède l'application, l'adversaire rejoint directement l'arène ; sinon il sera redirigé vers le Play Store."
            />

            <RuleItem
              icon="timer"
              title="L'Arène Chronométrée (60s)"
              description="Le duel s'organise sur une série de 5 énigmes avec un compte à rebours global de 60 secondes. Chaque énigme trouvée rapporte +10 points."
            />

            <RuleItem
              icon="flash"
              title="Le Buzzer & Prise de Main (3s)"
              description="Dès qu'une énigme s'affiche, appuyez sur le buzzer pour être le premier à tenter votre chance. Vous avez alors 3 secondes pour sélectionner la bonne réponse."
            />

            <RuleItem
              icon="pause-circle"
              title="Pause & Délai de Grâce (15s)"
              description="Si un joueur quitte inopinément ou subit une perte réseau, la partie est mise en pause avec un délai de 15 secondes pour lui permettre de revenir."
            />

            <RuleItem
              icon="shield-checkmark"
              title="Forfait & Dédommagement (+15%)"
              description="Si le joueur déconnecté ne réintègre pas l'arène après 15 secondes, il est sanctionné par un forfait. Le joueur resté fidèle conserve sa mise et gagne 15% de pénalité adverse (+20 XP)."
            />
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
  headerSpacer: { width: 32 },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: 4,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  introText: { ...typography.bodyMedium, textAlign: 'center', marginVertical: spacing.md, lineHeight: 22 },
  rulecardBg: { flexDirection: 'row', padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.md, alignItems: 'center' },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
  ruleTextContent: { flex: 1 },
  ruleTitle: { ...typography.buttonPrimary, fontSize: 16, marginBottom: 4 },
  ruleDescription: { ...typography.bodySmall, lineHeight: 20 },
});