//src/services/offlineVault.ts
export interface OfflineWordPair {
  _id: string;
  word1: string;
  word2: string;
  clue: string;
  expectedType: 'verbe' | 'nom' | 'adjectif';
  difficulty: number;
  exactMatch: string[];
  distractors: string[];
  options?: string[];
  hasKey?: boolean;
}

export const OFFLINE_WORD_PAIRS: OfflineWordPair[] = [
  // Palier 1 : Débutant (Niveau 1-10)
  { _id: 'off_1', word1: 'Soleil', word2: 'Pluie', clue: 'Spectre coloré qui apparaît dans le ciel', expectedType: 'nom', difficulty: 1, exactMatch: ['arc-en-ciel'], distractors: ['orage', 'nuage'] },
  { _id: 'off_2', word1: 'Chaleur', word2: 'Eau', clue: 'Porter un liquide à 100 degrés', expectedType: 'verbe', difficulty: 1, exactMatch: ['bouillir'], distractors: ['geler', 'fondre'] },
  { _id: 'off_3', word1: 'Voiture', word2: 'Volant', clue: 'Action de diriger un véhicule sur la route', expectedType: 'verbe', difficulty: 1, exactMatch: ['conduire'], distractors: ['rouler', 'freiner'] },
  { _id: 'off_4', word1: 'Nuit', word2: 'Ciel', clue: "Astres brillants visibles dans l'obscurité", expectedType: 'nom', difficulty: 1, exactMatch: ['étoiles', 'étoile'], distractors: ['nuages', 'planètes'] },
  { _id: 'off_5', word1: 'Eau', word2: 'Savon', clue: 'Action essentielle pour rester propre', expectedType: 'verbe', difficulty: 1, exactMatch: ['laver', 'nettoyer'], distractors: ['mouiller', 'frotter'] },
  { _id: 'off_6', word1: 'Crayon', word2: 'Feuille', clue: 'Créer une illustration avec des formes', expectedType: 'verbe', difficulty: 1, exactMatch: ['dessiner'], distractors: ['écrire', 'colorier'] },
  { _id: 'off_7', word1: 'Oiseau', word2: 'Arbre', clue: 'Abri naturel pour couver les œufs', expectedType: 'nom', difficulty: 1, exactMatch: ['nid'], distractors: ['cage', 'branche'] },
  { _id: 'off_8', word1: 'Glace', word2: 'Chaleur', clue: "Passer de l'état solide à l'état liquide", expectedType: 'verbe', difficulty: 2, exactMatch: ['fondre'], distractors: ['couler', 'évaporer'] },
  { _id: 'off_9', word1: 'Clé', word2: 'Serrure', clue: 'Action pour débloquer un accès', expectedType: 'verbe', difficulty: 1, exactMatch: ['ouvrir'], distractors: ['fermer', 'tourner'] },
  { _id: 'off_10', word1: 'Miel', word2: 'Fleur', clue: 'Insecte travailleur qui produit le nectar', expectedType: 'nom', difficulty: 1, exactMatch: ['abeille'], distractors: ['guêpe', 'papillon'] },
  { _id: 'off_11', word1: 'Livre', word2: 'Yeux', clue: 'Déchiffrer des phrases et des histoires', expectedType: 'verbe', difficulty: 1, exactMatch: ['lire'], distractors: ['regarder', 'apprendre'] },
  { _id: 'off_12', word1: 'Mer', word2: 'Vent', clue: "Mouvement d'eau qui déferle sur la plage", expectedType: 'nom', difficulty: 2, exactMatch: ['vague', 'houle'], distractors: ['marée', 'courant'] },
  { _id: 'off_13', word1: 'Feu', word2: 'Bois', clue: 'Substance grise résiduelle après combustion', expectedType: 'nom', difficulty: 2, exactMatch: ['cendre', 'braise'], distractors: ['fumée', 'charbon'] },
  { _id: 'off_14', word1: 'Neige', word2: 'Montagne', clue: 'Glisser à toute vitesse sur la pente', expectedType: 'verbe', difficulty: 1, exactMatch: ['skier'], distractors: ['marcher', 'grimper'] },
  { _id: 'off_15', word1: 'Musique', word2: 'Pieds', clue: 'Bouger son corps en rythme avec la mélodie', expectedType: 'verbe', difficulty: 1, exactMatch: ['danser'], distractors: ['sauter', 'marcher'] },

  // Palier 2 : Intermédiaire (Niveau 11-30)
  { _id: 'off_16', word1: 'Champagne', word2: 'Coupe', clue: 'Formation continue de fines bulles', expectedType: 'verbe', difficulty: 4, exactMatch: ['pétiller'], distractors: ['mousser', 'trinquer'] },
  { _id: 'off_17', word1: 'Fer', word2: 'Humidité', clue: "Couche rougeâtre due à l'oxydation", expectedType: 'nom', difficulty: 4, exactMatch: ['rouille'], distractors: ['peinture', 'mousse'] },
  { _id: 'off_18', word1: 'Boussole', word2: 'Nord', clue: 'Indiquer la bonne direction à suivre', expectedType: 'verbe', difficulty: 5, exactMatch: ['orienter'], distractors: ['guider', 'pointer'] },
  { _id: 'off_19', word1: 'Loup', word2: 'Lune', clue: 'Cri aigu et prolongé dans la nuit', expectedType: 'verbe', difficulty: 4, exactMatch: ['hurler'], distractors: ['aboyer', 'rugir'] },
  { _id: 'off_20', word1: 'Arbre', word2: 'Automne', clue: 'Action pour le feuillage de se détacher', expectedType: 'verbe', difficulty: 4, exactMatch: ['tomber'], distractors: ['jaunir', 'sécher'] },
  { _id: 'off_21', word1: 'Or', word2: 'Bijou', clue: 'Métier de confection et taille des parures', expectedType: 'nom', difficulty: 5, exactMatch: ['orfèvrerie'], distractors: ['joaillerie', 'forge'] },
  { _id: 'off_22', word1: 'Moteur', word2: 'Essence', clue: "Action de transformer l'énergie en mouvement", expectedType: 'verbe', difficulty: 4, exactMatch: ['tourner'], distractors: ['accélérer', 'brûler'] },
  { _id: 'off_23', word1: 'Encre', word2: 'Plume', clue: 'Action de tracer des lettres sur le papier', expectedType: 'verbe', difficulty: 4, exactMatch: ['écrire'], distractors: ['dessiner', 'signer'] },
  { _id: 'off_24', word1: 'Arc', word2: 'Flèche', clue: 'Propulser vers une cible précise', expectedType: 'verbe', difficulty: 5, exactMatch: ['tirer'], distractors: ['viser', 'lancer'] },
  { _id: 'off_25', word1: 'Voile', word2: 'Secret', clue: 'Rendre visible ce qui était caché', expectedType: 'verbe', difficulty: 5, exactMatch: ['lever'], distractors: ['découvrir', 'trahir'] },
  { _id: 'off_26', word1: 'Sablier', word2: 'Sable', clue: 'Mouvement régulier de haut en bas', expectedType: 'verbe', difficulty: 5, exactMatch: ['écouler'], distractors: ['glisser', 'mesurer'] },
  { _id: 'off_27', word1: 'Miroir', word2: 'Lumière', clue: 'Renvoyer une image fidèle sans absorber', expectedType: 'verbe', difficulty: 5, exactMatch: ['réfléchir'], distractors: ['renvoyer', 'projeter'] },
  { _id: 'off_28', word1: 'Cloche', word2: 'Église', clue: 'Produire un son grave et retentissant', expectedType: 'verbe', difficulty: 4, exactMatch: ['sonner'], distractors: ['tinter', 'vibrer'] },
  { _id: 'off_29', word1: 'Serpent', word2: 'Venin', clue: 'Injecter une toxine par morsure', expectedType: 'verbe', difficulty: 5, exactMatch: ['mordre'], distractors: ['piquer', 'empoisonner'] },
  { _id: 'off_30', word1: 'Diamant', word2: 'Verre', clue: 'Tracer une entaille avec précision', expectedType: 'verbe', difficulty: 6, exactMatch: ['graver'], distractors: ['fissurer', 'casser'] },

  // Palier 3 : Avancé (Niveau 31-60)
  { _id: 'off_31', word1: 'Écho', word2: 'Silence', clue: 'Faire cesser brusquement le calme ambiant', expectedType: 'verbe', difficulty: 7, exactMatch: ['rompre'], distractors: ['troubler', 'résonner'] },
  { _id: 'off_32', word1: 'Éclat', word2: 'Diamant', clue: "Briller d'une très vive lumière changeante", expectedType: 'verbe', difficulty: 7, exactMatch: ['scintiller'], distractors: ['éblouir', 'étinceler'] },
  { _id: 'off_33', word1: 'Aimant', word2: 'Fer', clue: "Exercer une force d'attraction invisible", expectedType: 'verbe', difficulty: 7, exactMatch: ['attirer'], distractors: ['coller', 'polariser'] },
  { _id: 'off_34', word1: 'Volcan', word2: 'Lave', clue: 'Expulser violemment des roches et magmas', expectedType: 'verbe', difficulty: 8, exactMatch: ['entrer en éruption', 'exploser'], distractors: ['fondre', 'déborder'] },
  { _id: 'off_35', word1: 'Pendule', word2: 'Temps', clue: 'Mouvement alternatif régulier de balancement', expectedType: 'verbe', difficulty: 7, exactMatch: ['osciller'], distractors: ['battre', 'tourner'] },
  { _id: 'off_36', word1: 'Foudre', word2: 'Arbre', clue: 'Frapper avec une puissance destructrice instantanée', expectedType: 'verbe', difficulty: 8, exactMatch: ['foudroyer'], distractors: ['abattre', 'calciner'] },
  { _id: 'off_37', word1: 'Graine', word2: 'Patience', clue: 'Attendre le développement naturel complet', expectedType: 'verbe', difficulty: 8, exactMatch: ['mûrir'], distractors: ['grandir', 'germer'] },
  { _id: 'off_38', word1: 'Guitare', word2: 'Doigt', clue: 'Faire vibrer une corde avec précision', expectedType: 'verbe', difficulty: 7, exactMatch: ['pincer'], distractors: ['frotter', 'gratter'] },
  { _id: 'off_39', word1: 'Racine', word2: 'Sol', clue: 'Fixer solidement et puiser les nutriments', expectedType: 'verbe', difficulty: 7, exactMatch: ['ancrer'], distractors: ['enfouir', 'creuser'] },
  { _id: 'off_40', word1: 'Vent', word2: 'Dune', clue: 'Modifier lentement les formes du relief', expectedType: 'verbe', difficulty: 8, exactMatch: ['sculpter'], distractors: ['déplacer', 'modeler'] }
];

export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getLocalGameBatch = (count = 15, userLevel = 1, excludeIds: string[] = []): OfflineWordPair[] => {
  let minDiff = 1;
  let maxDiff = 3;
  if (userLevel >= 31) {
    minDiff = 7;
    maxDiff = 10;
  } else if (userLevel >= 11) {
    minDiff = 4;
    maxDiff = 6;
  }

  let available = OFFLINE_WORD_PAIRS.filter((p) => !excludeIds.includes(p._id));
  if (available.length < 5) {
    available = OFFLINE_WORD_PAIRS.filter((p) => !excludeIds.slice(-15).includes(p._id));
  }
  if (available.length === 0) {
    available = [...OFFLINE_WORD_PAIRS];
  }

  const matched = available.filter((p) => p.difficulty >= minDiff && p.difficulty <= maxDiff);
  const pool = matched.length >= count ? matched : available;

  const shuffled = shuffleArray(pool).slice(0, count);
  const shouldSpawnKey = Math.random() < 0.25;
  const keyPosition = shouldSpawnKey ? (Math.floor(Math.random() * (shuffled.length - 6)) + 3) : -1;

  return shuffled.map((p, idx) => {
    const correct = p.exactMatch[0];
    const opts = shuffleArray([correct, p.distractors[0], p.distractors[1]]);
    return {
      ...p,
      options: opts,
      hasKey: idx === keyPosition
    };
  });
};