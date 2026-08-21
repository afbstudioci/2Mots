//src/constants/shopCatalog.ts
export const ACCENT_MAP: Record<string, { title?: string; desc?: string }> = {
  time_freeze_3: { title: '3x Time-Freeze (+5s)', desc: 'Gèle le chrono pendant 5 secondes.' },
  super_clue_3: { title: '3x Super-Indice', desc: 'Élimine immédiatement 2 mauvais choix.' },
  second_chance_2: { title: '2x Seconde Chance', desc: 'Permet de continuer une partie après un Game Over.' },
  streak_shield_3: { title: 'Pack 3 Boucliers de Flamme', desc: "Protège votre série quotidienne en cas d'oubli." },
  pack_mega_joker: { title: 'Méga Pack Joker (-30%)', desc: '5x Time-Freeze + 5x Super-Indice + 3x Seconde Chance.' },
  pack_survival_master: { title: 'Pack Survie & Flammes', desc: '3x Seconde Chance + 3x Boucliers de Flamme.' },
  kevs_150: { title: 'Poignée de Kevs' },
  kevs_700: { title: 'Bourse de Réflexion' },
  kevs_3000: { title: 'Coffre du Maître' },
};

export const DEFAULT_SHOP_CATALOG = {
  vip: {
    id: 'vip_monthly',
    title: 'Pass VIP 2Mots',
    priceEur: '2,99 €',
    perks: [
      'Zéro publicité dans tout le jeu',
      '15 Kevs offerts chaque jour',
      'Double XP & Récompenses ×2 permanentes',
      '1 Seconde Chance offerte à chaque partie'
    ],
  },
  kevsPacks: [
    { id: 'kevs_150', title: 'Poignée de Kevs', amount: 150, bonus: 0, priceEur: '0,99 €', icon: 'diamond-outline' },
    { id: 'kevs_700', title: 'Bourse de Réflexion', amount: 600, bonus: 100, priceEur: '2,99 €', tag: 'POPULAIRE', icon: 'diamond' },
    { id: 'kevs_3000', title: 'Coffre du Maître', amount: 2500, bonus: 500, priceEur: '9,99 €', tag: 'MEILLEURE VALEUR', icon: 'trophy' }
  ],
  streaks: [
    { id: 'streak_shield_3', title: 'Pack 3 Boucliers de Flamme', desc: "Protège votre série quotidienne en cas d'oubli.", priceKevs: 200, icon: 'flame', accentColor: '#F97316' }
  ],
  boosters: [
    { id: 'time_freeze_3', title: '3x Time-Freeze (+5s)', desc: 'Gèle le chrono pendant 5 secondes.', priceKevs: 45, type: 'timeFreeze', count: 3, icon: 'hourglass-outline', accentColor: '#0EA5E9' },
    { id: 'super_clue_3', title: '3x Super-Indice', desc: 'Élimine immédiatement 2 mauvais choix.', priceKevs: 75, type: 'superClue', count: 3, icon: 'bulb-outline', accentColor: '#F59E0B' },
    { id: 'second_chance_2', title: '2x Seconde Chance', desc: 'Permet de continuer une partie après un Game Over.', priceKevs: 100, type: 'secondChance', count: 2, icon: 'refresh-circle-outline', accentColor: '#10B981' }
  ],
  combos: [
    {
      id: 'pack_mega_joker',
      title: 'Méga Pack Joker (-30%)',
      desc: '5x Time-Freeze + 5x Super-Indice + 3x Seconde Chance.',
      priceKevs: 250,
      icon: 'gift-outline',
      accentColor: '#8B5CF6',
      rewards: { timeFreeze: 5, superClue: 5, secondChance: 3 }
    },
    {
      id: 'pack_survival_master',
      title: 'Pack Survie & Flammes',
      desc: '3x Seconde Chance + 3x Boucliers de Flamme.',
      priceKevs: 350,
      icon: 'shield-checkmark-outline',
      accentColor: '#EC4899',
      rewards: { secondChance: 3, streakFreezes: 3 }
    }
  ]
};
