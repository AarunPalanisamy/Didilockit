import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { questionFor } from '../constants';
import { artTint, colors, fonts, radius, spacing } from '../theme';
import type { Check } from '../types';
import { CheckArt } from './art/CheckArt';
import { Sheet } from './ui/Sheet';

type Props = {
  check: Check | null;
  onClose: () => void;
  onDismiss?: () => void;
  onScan: (check: Check) => void;
  onMarkManual: (check: Check) => void;
};

/** "Is the iron off?" — choose Scan & verify (recommended) or Mark by hand. */
export function VerifySheet({ check, onClose, onDismiss, onScan, onMarkManual }: Props) {
  return (
    <Sheet visible={check !== null} onClose={onClose} onDismiss={onDismiss}>
      {check && (
        <View>
          <View style={[styles.hero, { backgroundColor: artTint[check.art] }]}>
            <CheckArt kind={check.art} width={160} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {questionFor(check)}
          </Text>
          <Text style={styles.subtitle}>Choose how you want to confirm it.</Text>

          <Option
            recommended
            icon="scan"
            title="Scan & verify"
            body="Photo or 3‑second clip. Real proof you can replay."
            onPress={() => onScan(check)}
          />
          <Option
            icon="checkmark"
            title="Mark done by hand"
            body="Quick tick, no proof. Shows as “by hand”."
            onPress={() => onMarkManual(check)}
          />
          <Text style={styles.footnote}>Either way, it resets on its own after 24 hours.</Text>
        </View>
      )}
    </Sheet>
  );
}

function Option({
  recommended,
  icon,
  title,
  body,
  onPress,
}: {
  recommended?: boolean;
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${recommended ? ', recommended' : ''}. ${body}`}
      style={({ pressed }) => [styles.option, recommended ? styles.optionBest : styles.optionPlain, pressed && styles.pressed]}
    >
      <View style={[styles.optionIcon, { backgroundColor: recommended ? colors.accent : colors.manualBg }]}>
        <Ionicons name={icon} size={22} color={recommended ? colors.onDark : colors.manualInk} />
      </View>
      <View style={styles.optionBody}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{title}</Text>
          {recommended && <Text style={styles.best}>BEST</Text>}
        </View>
        <Text style={styles.optionText}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { height: 150, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 24, letterSpacing: -0.4, color: colors.ink, marginTop: 22 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: spacing.lg, borderRadius: radius.lg, marginBottom: 10 },
  optionBest: { borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionPlain: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  optionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionBody: { flex: 1, gap: 4 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  best: {
    overflow: 'hidden',
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.onDark,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  optionText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  footnote: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
  pressed: { opacity: 0.8 },
});
