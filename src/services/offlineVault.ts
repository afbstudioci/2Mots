//src/services/offlineVault.ts
export interface OfflineWordPair {
  _id: string;
  word1: string;
  word2: string;
  clue: string;
  expectedType: 'nom' | 'verbe' | 'adjectif';
  difficulty: number;
  exactMatch: string[];
  distractors: string[];
  options?: string[];
}

export const OFFLINE_WORD_PAIRS: OfflineWordPair[] = [
  // Tier 1 : Facile (1-3)
  { _id: 'off_1', word1: 'Abeille', word2: 'Fleur', clue: 'Action de récolter le nectar', expectedType: 'verbe', difficulty: 1, exactMatch: ['butiner'], distractors: ['piquer', 'semer'] },
  { _id: 'off_2', word1: 'Soleil', word2: 'Mer', clue: 'Étendue de sable au bord de l eau', expectedType: 'nom', difficulty: 1, exactMatch: ['plage'], distractors: ['piscine', 'desert'] },
  { _id: 'off_3', word1: 'Farine', word2: 'Four', clue: 'Aliment de base cuit a croute doree', expectedType: 'nom', difficulty: 1, exactMatch: ['pain'], distractors: ['gateau', 'pate'] },
  { _id: 'off_4', word1: 'Ciseaux', word2: 'Tissu', clue: 'Action de separer nettement avec une lame', expectedType: 'verbe', difficulty: 2, exactMatch: ['couper'], distractors: ['coudre', 'tailler'] },
  { _id: 'off_5', word1: 'Marteau', word2: 'Clou', clue: 'Action de faire penetrer par percussion', expectedType: 'verbe', difficulty: 2, exactMatch: ['enfoncer'], distractors: ['visser', 'forger'] },
  { _id: 'off_6', word1: 'Pluie', word2: 'Soleil', clue: 'Arche multicolore dans le ciel', expectedType: 'nom', difficulty: 1, exactMatch: ['arc-en-ciel'], distractors: ['orage', 'nuage'] },
  { _id: 'off_7', word1: 'Livre', word2: 'Yeux', clue: 'Action de parcourir et comprendre un texte', expectedType: 'verbe', difficulty: 1, exactMatch: ['lire'], distractors: ['ecrire', 'traduire'] },
  { _id: 'off_8', word1: 'Neige', word2: 'Montagne', clue: 'Glisse hivernale sur les pistes', expectedType: 'nom', difficulty: 2, exactMatch: ['ski'], distractors: ['luge', 'patin'] },
  { _id: 'off_9', word1: 'Graine', word2: 'Terre', clue: 'Commencer a se developper hors du sol', expectedType: 'verbe', difficulty: 2, exactMatch: ['germer'], distractors: ['fleurir', 'arroser'] },
  { _id: 'off_10', word1: 'Nuit', word2: 'Lit', clue: 'Etat de repos profond et inconscient', expectedType: 'nom', difficulty: 1, exactMatch: ['sommeil'], distractors: ['reve', 'sieste'] },
  { _id: 'off_11', word1: 'Bateau', word2: 'Vent', clue: 'Se deplacer sur l eau a la force de l air', expectedType: 'verbe', difficulty: 2, exactMatch: ['naviguer'], distractors: ['ramer', 'plonger'] },
  { _id: 'off_12', word1: 'Vache', word2: 'Herbe', clue: 'Action de macher continuellement dans le pre', expectedType: 'verbe', difficulty: 2, exactMatch: ['brouter'], distractors: ['macher', 'avaler'] },
  { _id: 'off_13', word1: 'Ciel', word2: 'Etoile', clue: 'Action d emettre une lumiere scintillante', expectedType: 'verbe', difficulty: 2, exactMatch: ['briller'], distractors: ['eclairer', 'rayonner'] },
  { _id: 'off_14', word1: 'Glace', word2: 'Chaleur', clue: 'Passer de l etat solide a l etat liquide', expectedType: 'verbe', difficulty: 2, exactMatch: ['fondre'], distractors: ['evaporer', 'couler'] },
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
  { _id: 'off_34', word1: 'Volcan', word2: 'Lave', clue: 'Expulser violemment des roches et magmas', expectedType: 'verbe', difficulty: 8, exactMatch: ['entrer en eruption'], distractors: ['exploser', 'deborder'] },
  { _id: 'off_35', word1: 'Pendule', word2: 'Temps', clue: 'Mouvement alternatif regulier de balancement', expectedType: 'verbe', difficulty: 7, exactMatch: ['osciller'], distractors: ['battre', 'tourner'] },
  { _id: 'off_36', word1: 'Foudre', word2: 'Arbre', clue: 'Frapper avec une puissance destructrice instantanee', expectedType: 'verbe', difficulty: 8, exactMatch: ['foudroyer'], distractors: ['abattre', 'calciner'] },
  { _id: 'off_37', word1: 'Graine', word2: 'Patience', clue: 'Attendre le developpement naturel complet', expectedType: 'verbe', difficulty: 8, exactMatch: ['murir'], distractors: ['grandir', 'attendre'] },
  { _id: 'off_38', word1: 'Guitare', word2: 'Doigt', clue: 'Faire vibrer une corde avec precision', expectedType: 'verbe', difficulty: 7, exactMatch: ['pincer'], distractors: ['frotter', 'gratter'] },
  { _id: 'off_39', word1: 'Racine', word2: 'Sol', clue: 'Fixer solidement et puiser les nutriments', expectedType: 'verbe', difficulty: 7, exactMatch: ['ancrer'], distractors: ['enfouir', 'creuser'] },
  { _id: 'off_40', word1: 'Vent', word2: 'Dune', clue: 'Modifier lentement les formes du relief', expectedType: 'verbe', difficulty: 8, exactMatch: ['sculpter'], distractors: ['deplacer', 'modeler'] },
  { _id: 'off_41', word1: 'Vapeur', word2: 'Froid', clue: 'Passer de l etat gazeux a l etat liquide', expectedType: 'verbe', difficulty: 8, exactMatch: ['condenser'], distractors: ['liquefier', 'refroidir'] },
  { _id: 'off_42', word1: 'Prisme', word2: 'Spectre', clue: 'Separer la lumiere en plusieurs couleurs', expectedType: 'verbe', difficulty: 9, exactMatch: ['diffracter'], distractors: ['disperser', 'filtrer'] },
  { _id: 'off_43', word1: 'Ombre', word2: 'Soleil', clue: 'Faire disparaitre la lumiere directe', expectedType: 'verbe', difficulty: 7, exactMatch: ['occulter'], distractors: ['voiler', 'bloquer'] },
  { _id: 'off_44', word1: 'Metronome', word2: 'Rythme', clue: 'Donner une cadence rigoureusement constante', expectedType: 'verbe', difficulty: 8, exactMatch: ['cadencer'], distractors: ['scander', 'synchroniser'] },
  { _id: 'off_45', word1: 'Sceau', word2: 'Cire', clue: 'Marquer d une empreinte officielle et authentique', expectedType: 'verbe', difficulty: 8, exactMatch: ['sceller'], distractors: ['marquer', 'tamponner'] },
  { _id: 'off_46', word1: 'Aiguille', word2: 'Tricot', clue: 'Former un tissu par croisement de mailles', expectedType: 'verbe', difficulty: 7, exactMatch: ['tisser'], distractors: ['crocheter', 'entrelacer'] },
  { _id: 'off_47', word1: 'Acier', word2: 'Trempe', clue: 'Renforcer la durete par choc thermique', expectedType: 'verbe', difficulty: 9, exactMatch: ['durcir'], distractors: ['forger', 'refroidir'] },
  { _id: 'off_48', word1: 'Plume', word2: 'Oiseau', clue: 'Assurer l isolation et la portance dans l air', expectedType: 'verbe', difficulty: 7, exactMatch: ['planer'], distractors: ['voler', 'flotter'] },
  { _id: 'off_49', word1: 'Cristal', word2: 'Roche', clue: 'Prendre une forme geometrique reguliere', expectedType: 'verbe', difficulty: 9, exactMatch: ['cristalliser'], distractors: ['durcir', 'solidifier'] },
  { _id: 'off_50', word1: 'Aurore', word2: 'Horizon', clue: 'Commencer a eclairer le ciel avant le lever', expectedType: 'verbe', difficulty: 8, exactMatch: ['poindre'], distractors: ['naitre', 'eclater'] },
];

const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getLocalGameBatch = (count = 10): OfflineWordPair[] => {
  const shuffled = shuffle(OFFLINE_WORD_PAIRS).slice(0, count);
  return shuffled.map((p) => {
    const correct = p.exactMatch[0];
    const opts = shuffle([correct, p.distractors[0], p.distractors[1]]);
    return { ...p, options: opts };
  });
};