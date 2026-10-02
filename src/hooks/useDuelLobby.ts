//src/hooks/useDuelLobby.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DUEL_RULES_SEEN_KEY } from '../components/duel/DuelRulesModal';
import {
  getDuelLobbyBootstrap,
  getCachedLobbyData,
  Opponent,
  DuelInvite,
  DuelSessionData,
} from '../services/duelApi';
import { useDuelLobbySockets } from './useDuelLobbySockets';
import { useDuelLobbyActions } from './useDuelLobbyActions';

export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success';
  buttonText?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export function useDuelLobby(initialTab: 'opponents' | 'received' | 'sent' = 'opponents') {
  const [activeTab, setActiveTab] = useState<'opponents' | 'received' | 'sent'>(initialTab);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [invites, setInvites] = useState<{ received: DuelInvite[]; sent: DuelInvite[] }>({ received: [], sent: [] });
  const [activeDuel, setActiveDuel] = useState<DuelSessionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [acceptedDuelData, setAcceptedDuelData] = useState<{ visible: boolean; opponentName: string; duelId: string }>({
    visible: false,
    opponentName: '',
    duelId: '',
  });
  const [alertConfig, setAlertConfig] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
  });

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await getCachedLobbyData();
        if (cached && isMountedRef.current) {
          if (cached.opponents.length > 0) setOpponents(cached.opponents);
          setInvites(cached.invites);
          if (cached.activeDuel) setActiveDuel(cached.activeDuel);
          setIsLoading(false);
        }
      }

      const freshData = await getDuelLobbyBootstrap(forceRefresh);
      if (isMountedRef.current) {
        setOpponents(freshData.opponents);
        setInvites(freshData.invites);
        setActiveDuel(freshData.activeDuel);
        setIsOffline(false);
      }
    } catch (e: any) {
      if (!e.response && opponents.length === 0 && isMountedRef.current) {
        setIsOffline(true);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [opponents.length]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [loadData])
  );

  useEffect(() => {
    AsyncStorage.getItem(DUEL_RULES_SEEN_KEY)
      .then((seen) => {
        if (!seen && isMountedRef.current) setShowRulesModal(true);
      })
      .catch(() => {});
  }, []);

  useDuelLobbySockets({
    onRefreshData: loadData,
    onAcceptedDuel: (data) => {
      if (isMountedRef.current) setAcceptedDuelData(data);
    },
    onActiveDuelCleared: () => {
      if (isMountedRef.current) setActiveDuel(null);
    },
  });

  const actions = useDuelLobbyActions({
    onRefreshData: loadData,
    setInvites,
    setActiveDuel,
    setAlertConfig,
  });

  return {
    activeTab,
    setActiveTab,
    opponents,
    invites,
    activeDuel,
    isLoading,
    isRefreshing,
    setIsRefreshing,
    isOffline,
    showRulesModal,
    setShowRulesModal,
    acceptedDuelData,
    setAcceptedDuelData,
    alertConfig,
    setAlertConfig,
    loadData,
    ...actions,
  };
}
