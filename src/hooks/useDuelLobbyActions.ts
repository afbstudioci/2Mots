//src/hooks/useDuelLobbyActions.ts
import { useState, useCallback } from 'react';
import { Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import {
  sendDuelInvite,
  respondDuelInvite,
  cancelDuelInvite,
  cancelInactiveDuel,
  Opponent,
  DuelInvite,
} from '../services/duelApi';
import { AlertState } from './useDuelLobby';

interface UseDuelLobbyActionsProps {
  onRefreshData: (force: boolean) => void;
  setInvites: React.Dispatch<React.SetStateAction<{ received: DuelInvite[]; sent: DuelInvite[] }>>;
  setActiveDuel: (duel: any) => void;
  setAlertConfig: (config: AlertState) => void;
}

export function useDuelLobbyActions({
  onRefreshData,
  setInvites,
  setActiveDuel,
  setAlertConfig,
}: UseDuelLobbyActionsProps) {
  const navigation = useNavigation<any>();
  const { user, refreshProfile } = useAuth();
  const { emit } = useSocketContext();

  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(null);
  const [cancellingInviteId, setCancellingInviteId] = useState<string | null>(null);

  const handleShareInvite = useCallback(async (invite: DuelInvite) => {
    try {
      const oppName = invite.opponent?.login || 'Ami';
      const link = `https://twomots-web.onrender.com/duel/${invite._id}`;
      await Share.share({
        title: 'Défi 2Mots',
        message: `Salut ${oppName} ! Je te défie sur 2Mots pour ${invite.betAmount} Kevs. Clique ici pour me rejoindre et jouer : ${link}`,
      });
    } catch (err) {
      console.warn('[SHARE] Erreur partage défi:', err);
    }
  }, []);

  const handleSendInvite = async (betAmount: number) => {
    if (!selectedOpponent || isSendingInvite) return;
    const targetOpponent = selectedOpponent;
    try {
      setIsSendingInvite(true);
      const res = await sendDuelInvite(targetOpponent._id, betAmount);
      const createdId = String(res?._id || '');
      setSelectedOpponent(null);
      setAlertConfig({
        visible: true,
        title: 'Défi envoyé !',
        message: `Votre invitation pour ${betAmount} Kevs a été transmise à ${targetOpponent.login}. Voulez-vous lui envoyer le lien sur WhatsApp ?`,
        type: 'success',
        buttonText: 'Plus tard',
        confirmText: 'Partager',
        onConfirm: () => {
          handleShareInvite({
            _id: createdId,
            opponent: { login: targetOpponent.login },
            betAmount,
          } as any);
        },
      });
      onRefreshData(true);
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: 'Impossible de défier',
        message: e?.response?.data?.message || e.message || 'Une erreur est survenue.',
        type: 'error',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRespond = async (duelId: string, accept: boolean) => {
    if (respondingInviteId) return;
    try {
      setRespondingInviteId(duelId);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
      const res = await respondDuelInvite(duelId, accept);
      setInvites((prev) => ({
        ...prev,
        received: prev.received.filter((i) => i._id !== duelId),
      }));

      emit('duel_respond_invite', {
        challengerId: String(res?.challenger?._id || res?.challenger || ''),
        opponentName: user?.login,
        accept,
        duelId,
      });

      if (accept) {
        await refreshProfile();
        navigation.navigate('DuelGame', { duelId: res?._id || res?.duelId || duelId });
      } else {
        onRefreshData(true);
      }
    } catch (e: any) {
      onRefreshData(true);
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || 'Action impossible.',
        type: 'error',
      });
    } finally {
      setRespondingInviteId(null);
    }
  };

  const handleCancelInvite = async (duelId: string, opponentId?: string) => {
    try {
      setCancellingInviteId(duelId);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      await cancelDuelInvite(duelId);
      if (opponentId) {
        emit('duel_cancel_invite', { opponentId: String(opponentId), duelId });
      }
      setInvites((prev) => ({
        ...prev,
        sent: prev.sent.filter((i) => i._id !== duelId),
      }));
      onRefreshData(true);
    } catch (e: any) {
      onRefreshData(true);
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || "Impossible d'annuler.",
        type: 'error',
      });
    } finally {
      setCancellingInviteId(null);
    }
  };

  const handleCancelActiveDuel = async (duelId: string) => {
    try {
      setActiveDuel(null);
      await cancelInactiveDuel(duelId);
      await refreshProfile();
      onRefreshData(true);
      setAlertConfig({
        visible: true,
        title: 'Duel retiré',
        message: 'La session de duel a été annulée.',
        type: 'success',
      });
    } catch (e: any) {
      onRefreshData(true);
      setAlertConfig({
        visible: true,
        title: 'Erreur',
        message: e?.response?.data?.message || e.message || "Impossible d'annuler.",
        type: 'error',
      });
    }
  };

  return {
    selectedOpponent,
    setSelectedOpponent,
    isSendingInvite,
    respondingInviteId,
    cancellingInviteId,
    handleSendInvite,
    handleRespond,
    handleCancelInvite,
    handleCancelActiveDuel,
    handleShareInvite,
  };
}
