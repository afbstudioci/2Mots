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
}

export const OFFLINE_WORD_PAIRS: OfflineWordPair[] = [
  // Tier 1 : Facile (1-3)
  { _id: 'off_1', word1: 'Soleil', word2: 'Pluie', clue: 'Spectre colore qui apparait dans le ciel', expectedType: 'nom', difficulty: 1, exactMatch: ['arc-en-ciel'], distractors: ['orage', 'nuage'] },
  { _id: 'off_2', word1: 'Chaleur', word2: 'Eau', clue: 'Porter un liquide a 100 degres', expectedType: 'verbe', difficulty: 1, exactMatch: ['bouillir'], distractors: ['geler', 'fondre'] },
  { _id: 'off_3', word1: 'Voiture', word2: 'Volant', clue: 'Action de diriger un vehicule sur la route', expectedType: 'verbe', difficulty: 1, exactMatch: ['conduire'], distractors: ['rouler', 'freiner'] },
  { _id: 'off_4', word1: 'Nuit', word2: 'Ciel', clue: 'Astres brillants visibles dans l obscurite', expectedType: 'nom', difficulty: 1, exactMatch: ['etoiles', 'etoile'], distractors: ['nuages', 'planetes'] },
  { _id: 'off_5', word1: 'Eau', word2: 'Savon', clue: 'Action essentielle pour rester propre', expectedType: 'verbe', difficulty: 1, exactMatch: ['laver', 'nettoyer'], distractors: ['mouiller', 'frotter'] },
  { _id: 'off_6', word1: 'Crayon', word2: 'Feuille', clue: 'Creer une illustration avec des formes', expectedType: 'verbe', difficulty: 1, exactMatch: ['dessiner'], distractors: ['ecrire', 'colorier'] },
  { _id: 'off_7', word1: 'Oiseau', word2: 'Arbre', clue: 'Abri naturel pour couver les oeufs', expectedType: 'nom', difficulty: 1, exactMatch: ['nid'], distractors: ['cage', 'branche'] },
  { _id: 'off_8', word1: 'Glace', word2: 'Chaleur', clue: 'Passer de l etat solide a l etat liquide', expectedType: 'verbe', difficulty: 2, exactMatch: ['fondre'], distractors: ['couler', 'evaporer'] },
  { _id: 'off_9', word1: 'Cle', word2: 'Serrure', clue: 'Action pour debloquer un acces', expectedType: 'verbe', difficulty: 1, exactMatch: ['ouvrir'], distractors: ['fermer', 'tourner'] },
  { _id: 'off_10', word1: 'Miel', word2: 'Fleur', clue: 'Insecte travailleur qui produit le nectar', expectedType: 'nom', difficulty: 1, exactMatch: ['abeille'], distractors: ['guepe', 'papillon'] },
  { _id: 'off_11', word1: 'Livre', word2: 'Yeux', clue: 'Dechiffrer des phrases et des histoires', expectedType: 'verbe', difficulty: 1, exactMatch: ['lire'], distractors: ['regarder', 'apprendre'] },
  { _id: 'off_12', word1: 'Mer', word2: 'Vent', clue: 'Mouvement d eau qui deferle sur la plage', expectedType: 'nom', difficulty: 2, exactMatch: ['vague', 'houle'], distractors: ['maree', 'courant'] },
  { _id: 'off_13', word1: 'Feu', word2: 'Bois', clue: 'Substance grise residuelle apres combustion', expectedType: 'nom', difficulty: 2, exactMatch: ['cendre', 'braise'], distractors: ['fumee', 'charbon'] },
  { _id: 'off_14', word1: 'Neige', word2: 'Montagne', clue: 'Glisser a toute vitesse sur la pente', expectedType: 'verbe', difficulty: 1, exactMatch: ['skier'], distractors: ['marcher', 'grimper'] },
  { _id: 'off_15', word1: 'Musique', word2: 'Pieds', clue: 'Bouger son corps en rythme avec la melodie', expectedType: 'verbe', difficulty: 1, exactMatch: ['danser'], distractors: ['sauter', 'marcher'] },

  // Tier 2 : Moyen (4-6)
  { _id: 'off_16', word1: 'Champagne', word2: 'Coupe', clue: 'Formation continue de fines bulles', expectedType: 'verbe', difficulty: 4, exactMatch: ['petiller'], distractors: ['mousser', 'trinquer'] },
  { _id: 'off_17', word1: 'Fer', word2: 'Humidite', clue: 'Couche rougeatre due a l oxydation', expectedType: 'nom', difficulty: 4, exactMatch: ['rouille'], distractors: ['peinture', 'mousse'] },
  { _id: 'off_18', word1: 'Boussole', word2: 'Nord', clue: 'Indiquer la bonne direction a suivre', expectedType: 'verbe', difficulty: 5, exactMatch: ['orienter'], distractors: ['guider', 'pointer'] },
  { _id: 'off_19', word1: 'Loup', word2: 'Lune', clue: 'Cri aigu et prolonge dans la nuit', expectedType: 'verbe', difficulty: 4, exactMatch: ['hurler'], distractors: ['aboyer', 'rugir'] },
  { _id: 'off_20', word1: 'Arbre', word2: 'Automne', clue: 'Action pour le feuillage de se detacher', expectedType: 'verbe', difficulty: 4, exactMatch: ['tomber'], distractors: ['jaunir', 'secher'] },
  { _id: 'off_21', word1: 'Or', word2: 'Bijou', clue: 'Metier de confection et taille des parures', expectedType: 'nom', difficulty: 5, exactMatch: ['orfevrerie'], distractors: ['joaillerie', 'forge'] },
  { _id: 'off_22', word1: 'Moteur', word2: 'Essence', clue: 'Action de transformer l energie en mouvement', expectedType: 'verbe', difficulty: 4, exactMatch: ['tourner'], distractors: ['accelerer', 'bruler'] },
  { _id: 'off_23', word1: 'Encre', word2: 'Plume', clue: 'Action de tracer des lettres sur le papier', expectedType: 'verbe', difficulty: 4, exactMatch: ['ecrire'], distractors: ['dessiner', 'signer'] },
  { _id: 'off_24', word1: 'Arc', word2: 'Fleche', clue: 'Propulser vers une cible precise', expectedType: 'verbe', difficulty: 5, exactMatch: ['tirer'], distractors: ['viser', 'lancer'] },
  { _id: 'off_25', word1: 'Voile', word2: 'Secret', clue: 'Rendre visible ce qui etait cache', expectedType: 'verbe', difficulty: 5, exactMatch: ['lever'], distractors: ['decouvrir', 'trahir'] },
  { _id: 'off_26', word1: 'Sablier', word2: 'Sable', clue: 'Mouvement regulier de haut en bas', expectedType: 'verbe', difficulty: 5, exactMatch: ['ecouler'], distractors: ['glisser', 'mesurer'] },
  { _id: 'off_27', word1: 'Miroir', word2: 'Lumiere', clue: 'Renvoyer une image fidele sans absorber', expectedType: 'verbe', difficulty: 5, exactMatch: ['reflechir'], distractors: ['renvoyer', 'projeter'] },
  { _id: 'off_28', word1: 'Cloche', word2: 'Eglise', clue: 'Produire un son grave et retentissant', expectedType: 'verbe', difficulty: 4, exactMatch: ['sonner'], distractors: ['tinter', 'vibrer'] },
  { _id: 'off_29', word1: 'Serpent', word2: 'Venin', clue: 'Injecter une toxine par morsure', expectedType: 'verbe', difficulty: 5, exactMatch: ['mordre'], distractors: ['piquer', 'empoisonner'] },
  { _id: 'off_30', word1: 'Diamant', word2: 'Verre', clue: 'Tracer une entaille avec precision', expectedType: 'verbe', difficulty: 6, exactMatch: ['graver'], distractors: ['fissurer', 'casser'] },

  // Tier 3 : Difficile (7-10)
  { _id: 'off_31', word1: 'Echo', word2: 'Silence', clue: 'Faire cesser brusquement le calme ambiant', expectedType: 'verbe', difficulty: 7, exactMatch: ['rompre'], distractors: ['troubler', 'resonner'] },
  { _id: 'off_32', word1: 'Eclat', word2: 'Diamant', clue: 'Briller d une tres vive lumiere changeante', expectedType: 'verbe', difficulty: 7, exactMatch: ['scintiller'], distractors: ['eblouir', 'etinceler'] },
  { _id: 'off_33', word1: 'Aimant', word2: 'Fer', clue: 'Exercer une force d attraction invisible', expectedType: 'verbe', difficulty: 7, exactMatch: ['attirer'], distractors: ['coller', 'polariser'] },
  { _id: 'off_34', word1: 'Volcan', word2: 'Lave', clue: 'Expulser violemment des roches et magmas', expectedType: 'verbe', difficulty: 8, exactMatch: ['entrer en eruption', 'exploser'], distractors: ['fondre', 'deborder'] },
  { _id: 'off_35', word1: 'Pendule', word2: 'Temps', clue: 'Mouvement alternatif regulier de balancement', expectedType: 'verbe', difficulty: 7, exactMatch: ['osciller'], distractors: ['battre', 'tourner'] },
  { _id: 'off_36', word1: 'Foudre', word2: 'Arbre', clue: 'Frapper avec une puissance destructrice instantanee', expectedType: 'verbe', difficulty: 8, exactMatch: ['foudroyer'], distractors: ['abattre', 'calciner'] },
  { _id: 'off_37', word1: 'Graine', word2: 'Patience', clue: 'Attendre le developpement naturel complet', expectedType: 'verbe', difficulty: 8, exactMatch: ['murir'], distractors: ['grandir', 'germer'] },
  { _id: 'off_38', word1: 'Guitare', word2: 'Doigt', clue: 'Faire vibrer une corde avec precision', expectedType: 'verbe', difficulty: 7, exactMatch: ['pincer'], distractors: ['frotter', 'gratter'] },
  { _id: 'off_39', word1: 'Racine', word2: 'Sol', clue: 'Fixer solidement et puiser les nutriments', expectedType: 'verbe', difficulty: 7, exactMatch: ['ancrer'], distractors: ['enfouir', 'creuser'] },
  { _id: 'off_40', word1: 'Vent', word2: 'Dune', clue: 'Modifier lentement les formes du relief', expectedType: 'verbe', difficulty: 8, exactMatch: ['sculpter'], distractors: ['deplacer', 'modeler'] }
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
  if (userLevel >= 8) {
    minDiff = 6;
    maxDiff = 10;
  } else if (userLevel >= 4) {
    minDiff = 3;
    maxDiff = 7;
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
  return shuffled.map((p) => {
    const correct = p.exactMatch[0];
    const opts = shuffleArray([correct, p.distractors[0], p.distractors[1]]);
    return { ...p, options: opts };
  });
};