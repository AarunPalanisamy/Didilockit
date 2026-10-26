import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckArt } from '../components/art/CheckArt';
import { NAV_HEIGHT } from '../components/BottomNav';
import { hintFor } from '../constants';
import { artTint, colors, fonts, HIT, radius, spacing } from '../theme';
import type { Check } from '../types';

type Props = {
  checks: Check[]; // all, enabled or not
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export function ProfileScreen({ checks, onToggle, onRemove, onAdd }: Props) {
  const shown = checks.filter((c) => c.enabled).length;

  const confirmRemove = (check: Check) =>
    Alert.alert(`Delete “${check.label}”?`, 'Its proof for today is deleted too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onRemove(check.id) },
    ]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: NAV_HEIGHT + 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PROFILE</Text>
          <Text style={styles.title} accessibilityRole="header">
            Your checks
          </Text>
          <Text style={styles.subtitle}>
            Switch on what shows on your home screen · {shown} shown
          </Text>
        </View>

        <View style={styles.list}>
          {checks.map((check, i) => (
            <View key={check.id} style={[styles.row, i > 0 && styles.rowDivider]}>
              <View style={[styles.thumb, { backgroundColor: artTint[check.art] }]}>
                <CheckArt kind={check.art} width={42} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel} numberOfLines={1}>
                  {check.label}
                </Text>
                <Text style={styles.rowHint}>{hintFor(check)}</Text>
              </View>
              {check.custom && (
                <Pressable
                  onPress={() => confirmRemove(check)}
                  hitSlop={6}
                  style={styles.trash}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${check.label}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              )}
              <Switch
                value={check.enabled}
                onValueChange={(v) => onToggle(check.id, v)}
                trackColor={{ false: '#D9D7E3', true: colors.accent }}
                thumbColor={colors.card}
                ios_backgroundColor="#D9D7E3"
                accessibilityLabel={`Show ${check.label} on home`}
              />
            </View>
          ))}
        </View>

        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color={colors.accentText} />
          <Text style={styles.addText}>Add your own check</Text>
        </Pressable>

        <Text style={styles.footnote}>Proofs stay on this phone and clear themselves after 24 hours.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.muted },
  title: { fontFamily: fonts.semibold, fontSize: 28, letterSpacing: -0.5, color: colors.ink, marginTop: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 6 },
  list: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 68, paddingVertical: 10 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  thumb: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowBody: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  rowHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  trash: { width: HIT - 8, height: HIT - 8, alignItems: 'center', justifyContent: 'center' },
  add: {
    marginTop: 14,
    marginHorizontal: spacing.lg,
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.accentLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.accentText },
  pressed: { opacity: 0.7 },
  footnote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});
