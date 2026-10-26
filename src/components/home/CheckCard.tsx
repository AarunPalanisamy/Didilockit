import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { artTint, colors, fonts, radius, spacing } from '../../theme';
import type { Check } from '../../types';
import { stateOf } from '../../utils/status';
import { CheckArt } from '../art/CheckArt';
import { Button, IconButton } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';

type Props = {
  check: Check;
  onScan: (check: Check) => void;
  onMarkManual: (check: Check) => void;
  onViewProof: (check: Check) => void;
  onLongPress: (check: Check) => void;
};

function CheckCardBase({ check, onScan, onMarkManual, onViewProof, onLongPress }: Props) {
  const state = stateOf(check);

  return (
    <Pressable
      onLongPress={() => onLongPress(check)}
      accessibilityHint="Long press for more options"
      style={styles.card}
    >
      <View style={[styles.thumb, { backgroundColor: artTint[check.art] }]} accessible={false}>
        <CheckArt kind={check.art} width={48} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label} numberOfLines={1}>
          {check.label}
        </Text>
        <StatusPill check={check} />
      </View>

      {state === 'scanned' && (
        <IconButton icon="eye-outline" onPress={() => onViewProof(check)} accessibilityLabel={`View proof for ${check.label}`} />
      )}
      {state === 'manual' && (
        <Button
          label="Add proof"
          variant="ghost"
          compact
          onPress={() => onScan(check)}
          accessibilityLabel={`Add photo proof for ${check.label}`}
        />
      )}
      {state === 'pending' && (
        <View style={styles.actions}>
          <IconButton
            icon="checkmark"
            onPress={() => onMarkManual(check)}
            accessibilityLabel={`Mark ${check.label} done by hand`}
          />
          <Button
            label="Scan"
            icon="scan-outline"
            compact
            onPress={() => onScan(check)}
            accessibilityLabel={`Scan ${check.label}`}
          />
        </View>
      )}
    </Pressable>
  );
}

export const CheckCard = memo(CheckCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 80,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  body: { flex: 1, minWidth: 0, gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  actions: { flexDirection: 'row', gap: 6 },
});
