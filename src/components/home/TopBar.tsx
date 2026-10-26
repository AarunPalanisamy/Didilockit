import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';
import { formatTime12 } from '../../utils/time';

type Props = { now: number; streak: number };

/** Streak chip (left) + live clock (right). */
export function TopBar({ now, streak }: Props) {
  const time = formatTime12(now);
  return (
    <View style={styles.row}>
      <View
        style={styles.chip}
        accessible
        accessibilityLabel={streak > 0 ? `${streak} day streak` : 'No streak yet'}
      >
        <View style={styles.flame}>
          <Ionicons name="flame" size={18} color={colors.onDark} />
        </View>
        <Text style={styles.chipText}>{streak > 0 ? `${streak}‑day streak` : 'Start a streak'}</Text>
      </View>

      <View style={styles.clock} accessible accessibilityRole="header" accessibilityLabel={`Current time ${time}`}>
        <Ionicons name="time-outline" size={16} color={colors.muted} />
        <Text style={styles.clockText}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
  },
  flame: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.streak,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  clock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
  },
  clockText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, fontVariant: ['tabular-nums'] },
});
