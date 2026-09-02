// src/utils/apiError.ts
// GESTION ET EXTRACTION PRÉCISE DES ERREURS API (Réseau, Timeout, 401, 500)
// Normes AFB : Zéro ambiguïté utilisateur, typographie soignée

export interface FormattedApiError {
  title: string;
  message: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  statusCode?: number;
}

export const parseApiError = (error: any, defaultTitle = 'Erreur', defaultMessage = 'Une erreur est survenue.'): FormattedApiError => {
  // 1. Timeout explicite
  if (error?.code === 'ECONNABORTED' || error?.message?.toLowerCase().includes('timeout')) {
    return {
      title: 'Délai d’attente dépassé',
      message: 'Le serveur met trop de temps à répondre. Vérifiez votre connexion Internet et réessayez.',
      isNetworkError: true,
      isTimeout: true,
    };
  }

  // 2. Absence de réponse serveur (Perte de connexion / Réseau coupé / DNS)
  if (!error?.response || error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return {
      title: 'Problème de connexion',
      message: 'Impossible de joindre le serveur. Veuillez vérifier votre connexion Internet.',
      isNetworkError: true,
      isTimeout: false,
    };
  }

  const status = error.response.status;
  const backendMessage = error.response.data?.message;

  // 3. Erreurs d'authentification (401 / 403)
  if (status === 401) {
    return {
      title: 'Identifiants invalides',
      message: backendMessage || 'Pseudo/email ou mot de passe incorrect.',
      isNetworkError: false,
      isTimeout: false,
      statusCode: 401,
    };
  }

  if (status === 403) {
    return {
      title: 'Accès refusé',
      message: backendMessage || 'Vous n’avez pas l’autorisation d’effectuer cette action.',
      isNetworkError: false,
      isTimeout: false,
      statusCode: 403,
    };
  }

  // 4. Rate Limiting (429)
  if (status === 429) {
    return {
      title: 'Trop de tentatives',
      message: backendMessage || 'Trop de requêtes envoyées. Veuillez patienter quelques instants avant de réessayer.',
      isNetworkError: false,
      isTimeout: false,
      statusCode: 429,
    };
  }

  // 5. Erreurs serveur (500, 502, 503, 504)
  if (status >= 500) {
    return {
      title: 'Serveur indisponible',
      message: 'Le serveur rencontre une perturbation momentanée. Veuillez réessayer dans quelques instants.',
      isNetworkError: true,
      isTimeout: false,
      statusCode: status,
    };
  }

  // 6. Message métier renvoyé par le backend (ex: 400 Bad Request)
  return {
    title: defaultTitle,
    message: backendMessage || defaultMessage,
    isNetworkError: false,
    isTimeout: false,
    statusCode: status,
  };
};
