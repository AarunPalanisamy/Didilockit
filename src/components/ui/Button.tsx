import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, HIT, radius } from '../../theme';

type Variant = 'dark' | 'accent' | 'ghost';
type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  /** Icon after the label instead of before */
  trailingIcon?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const palette: Record<Variant, { bg: string; ink: string; border?: string }> = {
  dark: { bg: colors.ink, ink: colors.onDark },
  accent: { bg: colors.accent, ink: colors.onDark },
  ghost: { bg: colors.card, ink: colors.ink, border: colors.line },
};

export function Button({
  label,
  onPress,
  variant = 'dark',
  icon,
  trailingIcon,
  disabled,
  compact,
  accessibilityLabel,
  style,
}: Props) {
  const p = palette[variant];
  const iconEl = icon ? <Ionicons name={icon} size={compact ? 15 : 18} color={p.ink} /> : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        { backgroundColor: p.bg, borderColor: p.border ?? p.bg },
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {!trailingIcon && iconEl}
      <Text style={[styles.label, compact && styles.labelCompact, { color: p.ink }]}>{label}</Text>
      {trailingIcon && iconEl}
    </Pressable>
  );
}

/** Round icon-only button (eye, tick, close…). */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  tone = 'light',
  size = 44,
}: {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'light' | 'glass';
  size?: number;
}) {
  const glass = tone === 'glass';
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(HIT - size) / 2 > 0 ? (HIT - size) / 2 : 0}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.icon,
        { width: size, height: size, borderRadius: size / 2 },
        glass ? styles.iconGlass : styles.iconLight,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={20} color={glass ? colors.onDark : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  regular: { minHeight: 56, paddingHorizontal: 24 },
  compact: { minHeight: 44, paddingHorizontal: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 15 },
  labelCompact: { fontSize: 13 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  iconLight: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  iconGlass: { backgroundColor: colors.onDarkGlass },
});
