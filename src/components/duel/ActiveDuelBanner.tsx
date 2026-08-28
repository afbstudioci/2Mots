//src/components/duel/ActiveDuelBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DuelSessionData } from '../../services/duelApi';
import { colors, spacing, borderRadius } from '../../theme/theme';
import KevIcon from '../common/KevIcon';

interface ActiveDuelBannerProps {
  duel: DuelSessionData;
  currentUserId: string;
  themeColors: any;
  onJoin: (duelId: string) => void;
  onCancel: (duelId: string) => void;
}

export const ActiveDuelBanner: React.FC<ActiveDuelBannerProps> = ({
  duel,
  currentUserId,
  themeColors,
  onJoin,
  onCancel,
}) => {
  const isChallenger = String(duel.challenger?._id || duel.challenger) === String(currentUserId);
  const opponent = isChallenger ? duel.opponent : duel.challenger;
  const opponentName = opponent?.login || 'Adversaire';

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(255, 127, 80, 0.12)', borderColor: colors.coral }]}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name="flash" size={14} color="#FFFFFF" />
          <Text style={styles.badgeText}>DÉFI ACCEPTÉ & EN COURS</Text>
        </View>

        <View style={styles.potBox}>
          <KevIcon size={14} />
          <Text style={styles.potText}>{duel.totalPot} Kevs</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: themeColors.text }]}>
        Duel contre {opponentName}
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        La salle est prête. Rejoignez l'arène pour débuter l'affrontement !
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onJoin(duel._id)}
          style={[styles.joinBtn, { backgroundColor: colors.coral }]}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.joinBtnText}>REJOINDRE LA PARTIE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onCancel(duel._id)}
          style={[styles.cancelBtn, { borderColor: themeColors.border }]}
        >
          <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary }]}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.coral,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  potBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  potText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFB84D',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 13,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
});
