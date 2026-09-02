//src/components/duel/DuelListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';
import KevIcon from '../common/KevIcon';
import { Opponent, DuelInvite } from '../../services/duelApi';

interface OpponentItemProps {
  item: Opponent;
  isAlreadyInvited: boolean;
  isOnline?: boolean;
  themeColors: any;
  onSelect: (item: Opponent) => void;
}

export const OpponentItem: React.FC<OpponentItemProps> = ({ item, isAlreadyInvited, isOnline = false, themeColors, onSelect }) => (
  <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: isOnline ? colors.mint : themeColors.border }]}>
    <View style={styles.userRow}>
      <View style={[styles.avatarBox, { backgroundColor: themeColors.overlayLight, borderColor: isOnline ? colors.mint : 'transparent', borderWidth: isOnline ? 1.5 : 0 }]}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
        ) : (
          <Text style={[styles.avatarPlaceholder, { color: colors.coral }]}>{item.login[0].toUpperCase()}</Text>
        )}
        {isOnline && <View style={[styles.onlineBadge, { backgroundColor: colors.mint }]} />}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>{item.login}</Text>
        <Text style={[styles.userLevel, { color: isOnline ? colors.mint : themeColors.textSecondary }]}>
          {isOnline ? 'En ligne' : `Niveau ${item.level}`} {item.isFriend ? '• Ami' : ''}
        </Text>
      </View>
    </View>
    <TouchableOpacity
      disabled={isAlreadyInvited}
      onPress={() => onSelect(item)}
      style={[styles.challengeBtn, { backgroundColor: isAlreadyInvited ? colors.mint : colors.coral }]}
    >
      <Ionicons name={isAlreadyInvited ? 'checkmark-circle' : 'flash'} size={14} color="#FFFFFF" />
      <Text style={styles.challengeBtnText}>{isAlreadyInvited ? 'INVITÉ' : 'DÉFIER'}</Text>
    </TouchableOpacity>
  </View>
);

interface ReceivedInviteProps {
  item: DuelInvite;
  themeColors: any;
  onRespond: (id: string, accept: boolean) => void;
  isResponding?: boolean;
}

export const ReceivedInviteItem: React.FC<ReceivedInviteProps> = ({ item, themeColors, onRespond, isResponding = false }) => (
  <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: colors.coral }]}>
    <View style={styles.userInfo}>
      <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>Défi de {item.challenger.login}</Text>
      <View style={styles.betRow}>
        <Text style={[styles.userLevel, { color: themeColors.textSecondary }]}>Mise : </Text>
        <KevIcon size={14} />
        <Text style={[styles.betText, { color: colors.coral }]}>{item.betAmount} Kevs</Text>
      </View>
    </View>
    <View style={styles.actionButtons}>
      <TouchableOpacity
        disabled={isResponding}
        onPress={() => onRespond(item._id, true)}
        style={[styles.acceptBtn, { backgroundColor: colors.mint, opacity: isResponding ? 0.7 : 1 }]}
      >
        {isResponding ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.btnActionText}>ACCEPTER</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        disabled={isResponding}
        onPress={() => onRespond(item._id, false)}
        style={[styles.rejectBtn, { backgroundColor: themeColors.overlayLight, opacity: isResponding ? 0.5 : 1 }]}
      >
        <Text style={[styles.btnActionText, { color: themeColors.textSecondary }]}>REFUSER</Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface SentInviteProps {
  item: DuelInvite;
  themeColors: any;
  onCancel: (invite: DuelInvite) => void;
  onShare?: (invite: DuelInvite) => void;
  isCancelling?: boolean;
}

export const SentInviteItem: React.FC<SentInviteProps> = ({ item, themeColors, onCancel, onShare, isCancelling = false }) => (
  <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
    <View style={styles.userInfo}>
      <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>Défi à {item.opponent?.login || 'Joueur'}</Text>
      <View style={styles.betRow}>
        <Text style={[styles.userLevel, { color: themeColors.textSecondary }]}>Mise : </Text>
        <KevIcon size={14} />
        <Text style={[styles.betText, { color: colors.coral }]}>{item.betAmount} Kevs</Text>
      </View>
    </View>
    <View style={styles.actionButtons}>
      {onShare && (
        <TouchableOpacity
          onPress={() => onShare(item)}
          style={[styles.shareSentBtn, { backgroundColor: '#25D366' }]}
        >
          <Ionicons name="share-social" size={13} color="#FFFFFF" />
          <Text style={styles.btnActionText}>RELANCER</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        disabled={isCancelling}
        onPress={() => onCancel(item)}
        style={[styles.cancelSentBtn, { borderColor: colors.error, opacity: isCancelling ? 0.5 : 1 }]}
      >
        {isCancelling ? (
          <ActivityIndicator size="small" color={colors.error} />
        ) : (
          <Text style={[styles.cancelSentBtnText, { color: colors.error }]}>ANNULER</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#FFFFFF' },
  userInfo: { flex: 1, marginRight: 8 },
  userName: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
  userLevel: { fontFamily: 'Poppins_400Regular', fontSize: 11 },
  challengeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: borderRadius.sm },
  challengeBtnText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 11 },
  betRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  betText: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 6 },
  acceptBtn: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: borderRadius.sm },
  rejectBtn: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: borderRadius.sm },
  shareSentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 9, borderRadius: borderRadius.sm },
  btnActionText: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 11 },
  cancelSentBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: borderRadius.sm, borderWidth: 1 },
  cancelSentBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 11 },
});
