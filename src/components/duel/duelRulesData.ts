//src/components/duel/duelRulesData.ts
import { Ionicons } from '@expo/vector-icons';

export const DUEL_RULES_SEEN_KEY = '@twomots_has_seen_duel_rules';

export interface DuelRulePoint {
  subtitle: string;
  text: string;
}

export interface DuelStep {
  stepNumber: number;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  points: DuelRulePoint[];
}

export const DUEL_RULES_STEPS: DuelStep[] = [
  {
    stepNumber: 1,
    badge: 'ÉTAPE 1 / 3',
    icon: 'trophy',
    title: 'La Mise & Le Défi',
    description: 'Défiez qui vous voulez en face-à-face et décidez de la mise en Kevs.',
    points: [
      {
        subtitle: 'Mise équitable',
        text: 'Les deux joueurs engagent la même somme de Kevs (ex: 30 Kevs chacun).',
      },
      {
        subtitle: 'Le vainqueur rafle tout',
        text: 'Le gagnant remporte la totalité des mises en jeu (60 Kevs) ainsi que +50 XP !',
      },
      {
        subtitle: 'Partage direct',
        text: 'Partagez le lien du duel sur WhatsApp, Telegram, SMS ou Facebook. S\'il a l\'application, il arrive droit dans l\'arène !',
      },
    ],
  },
  {
    stepNumber: 2,
    badge: 'ÉTAPE 2 / 3',
    icon: 'timer',
    title: 'L\'Arène & Le Buzzer',
    description: 'La partie se dispute en direct sur une série de 5 énigmes en 60 secondes chrono.',
    points: [
      {
        subtitle: 'Prenez la main au Buzzer',
        text: 'Dès que l\'énigme s\'affiche, appuyez sur le buzzer avant votre adversaire pour tenter votre chance.',
      },
      {
        subtitle: '3 secondes pour répondre',
        text: 'Une fois le buzzer verrouillé, vous avez exactement 3 secondes pour choisir la bonne réponse.',
      },
      {
        subtitle: '10 points par énigme',
        text: 'Chaque mot trouvé rapporte +10 points. Si le temps expire ou si vous ratez, la main redevient libre.',
      },
    ],
  },
  {
    stepNumber: 3,
    badge: 'ÉTAPE 3 / 3',
    icon: 'shield-checkmark',
    title: 'Fair-Play & Pénalités',
    description: 'Chaque duel doit se jouer dans le respect des règles et jusqu\'au terme du chrono.',
    points: [
      {
        subtitle: 'Pause de 15 secondes',
        text: 'En cas de déconnexion ou d\'appel imprévu, le duel est mis en pause avec 15 secondes de grâce.',
      },
      {
        subtitle: 'Sanction pour abandon',
        text: 'Si le joueur déconnecté ne revient pas dans les 15s, il est automatiquement déclaré forfait.',
      },
      {
        subtitle: 'Dédommagement du loyal',
        text: 'Le joueur resté fidèle conserve sa mise et empoche une pénalité de 15% prise sur la mise adverse (+20 XP) !',
      },
    ],
  },
];
