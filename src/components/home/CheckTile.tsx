import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { artTint, colors, fonts, radius } from '../../theme';
import type { Check } from '../../types';
import { CheckArt } from '../art/CheckArt';

type Props = { check: Check; onPress: (check: Check) => void };

function CheckTileBase({ check, onPress }: Props) {
  const done = check.verification !== null;
  return (
    <Pressable
      onPress={() => onPress(check)}
      accessibilityRole="button"
      accessibilityLabel={`${check.label}, ${done ? 'done' : 'not checked'}`}
      style={({ pressed }) => [styles.tile, { backgroundColor: artTint[check.art] }, pressed && styles.pressed]}
    >
      <Text style={styles.label} numberOfLines={2}>
        {check.label}
      </Text>
      {done && (
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={13} color={colors.onDark} />
        </View>
      )}
      <View style={styles.art} pointerEvents="none">
        <CheckArt kind={check.art} width={98} />
      </View>
    </Pressable>
  );
}

export const CheckTile = memo(CheckTileBase);

const styles = StyleSheet.create({
  tile: {
    width: 112,
    height: 124,
    borderRadius: radius.lg,
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 30,
    overflow: 'hidden',
  },
  pressed: { transform: [{ scale: 0.97 }] },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { position: 'absolute', left: 4, bottom: 2 },
});
