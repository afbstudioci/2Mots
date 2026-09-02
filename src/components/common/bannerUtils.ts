// src/components/common/bannerUtils.ts
import { colors } from '../../theme/theme';

export type BannerType =
  | 'invite'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'chat'
  | 'friend_request'
  | 'friend_accepted'
  | 'level_up'
  | 'mission_complete'
  | 'general';

export interface BannerData {
  type: BannerType;
  title: string;
  message: string;
  duelId?: string;
  friendId?: string;
  friendName?: string;
  friendAvatar?: string;
  buttonText?: string;
  borderColor: string;
  autoDismissMs?: number;
}

export const buildBannerData = (title: string, body: string, data: any): BannerData => {
  const rawType = data?.type || 'general';
  const duelId = data?.duelId ? String(data.duelId) : undefined;
  const friendId = data?.friendId ? String(data.friendId) : (data?.senderId ? String(data.senderId) : undefined);
  const friendName = data?.friendName || data?.senderName || 'Ami';
  const friendAvatar = data?.friendAvatar;

  switch (rawType) {
    case 'duel_invite':
    case 'invite':
      return {
        type: 'invite',
        title: title || 'DÉFI EN DUEL 1V1 !',
        message: body || `${data?.challengerName || 'Un joueur'} vous défie !`,
        duelId,
        buttonText: 'VOIR',
        borderColor: colors.coral,
        autoDismissMs: 7000,
      };

    case 'duel_accepted':
    case 'accepted':
      return {
        type: 'accepted',
        title: title || 'DÉFI ACCEPTÉ !',
        message: body || 'Le duel commence !',
        duelId,
        buttonText: 'JOUER',
        borderColor: colors.mint,
        autoDismissMs: 8000,
      };

    case 'duel_rejected':
    case 'rejected':
      return {
        type: 'rejected',
        title: title || 'DÉFI REFUSÉ',
        message: body || 'Invitation déclinée.',
        borderColor: colors.error,
        autoDismissMs: 4500,
      };

    case 'chat_message':
    case 'chat':
      return {
        type: 'chat',
        title: friendName,
        message: body || 'Nouveau message reçu.',
        friendId,
        friendName,
        friendAvatar,
        buttonText: 'RÉPONDRE',
        borderColor: colors.coral,
        autoDismissMs: 6000,
      };

    case 'friend_request':
      return {
        type: 'friend_request',
        title: title || "NOUVELLE DEMANDE D'AMI",
        message: body || `${friendName} souhaite devenir votre ami !`,
        friendId,
        friendName,
        buttonText: 'VOIR',
        borderColor: colors.coral,
        autoDismissMs: 6500,
      };

    case 'friend_accepted':
      return {
        type: 'friend_accepted',
        title: title || 'DEMANDE ACCEPTÉE !',
        message: body || `${friendName} et vous êtes maintenant amis !`,
        friendId,
        friendName,
        buttonText: 'VOIR',
        borderColor: colors.mint,
        autoDismissMs: 6500,
      };

    case 'level_up':
      return {
        type: 'level_up',
        title: title || 'NIVEAU SUPÉRIEUR !',
        message: body || 'Félicitations pour votre progression !',
        buttonText: 'PROFIL',
        borderColor: colors.coral,
        autoDismissMs: 6000,
      };

    case 'mission_complete':
      return {
        type: 'mission_complete',
        title: title || 'MISSION TERMINÉE !',
        message: body || 'Une récompense est prête à être réclamée !',
        buttonText: 'RÉCLAMER',
        borderColor: colors.mint,
        autoDismissMs: 6500,
      };

    default:
      return {
        type: 'general',
        title: title || 'NOTIFICATION',
        message: body || 'Nouvelle information.',
        buttonText: 'VOIR',
        borderColor: colors.coral,
        autoDismissMs: 5000,
      };
  }
};
