import { StyleSheet, Text } from 'react-native';

import { fonts, radius } from '../../theme';
import type { Check } from '../../types';
import { stateOf, statusColors, statusLabel } from '../../utils/status';

export function StatusPill({ check }: { check: Check }) {
  const c = statusColors[stateOf(check)];
  return (
    <Text style={[styles.pill, { backgroundColor: c.bg, color: c.ink }]} numberOfLines={1}>
      {statusLabel(check)}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
});
