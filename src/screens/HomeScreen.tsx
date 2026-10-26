import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NAV_HEIGHT } from '../components/BottomNav';
import { CheckCard } from '../components/home/CheckCard';
import { CheckTile } from '../components/home/CheckTile';
import { TopBar } from '../components/home/TopBar';
import { Button } from '../components/ui/Button';
import { colors, fonts, radius, spacing } from '../theme';
import type { Check } from '../types';

type Props = {
  now: number;
  streak: number;
  checks: Check[]; // enabled only
  saveError: boolean;
  onTilePress: (check: Check) => void;
  onScan: (check: Check) => void;
  onMarkManual: (check: Check) => void;
  onViewProof: (check: Check) => void;
  onLongPress: (check: Check) => void;
  onCustomise: () => void;
};

export function HomeScreen({
  now,
  streak,
  checks,
  saveError,
  onTilePress,
  onScan,
  onMarkManual,
  onViewProof,
  onLongPress,
  onCustomise,
}: Props) {
  const done = checks.filter((c) => c.verification).length;
  const allDone = checks.length > 0 && done === checks.length;

  const header = (
    <View>
      <TopBar now={now} streak={streak} />
      <Text style={styles.headline} accessibilityRole="header">
        {allDone ? 'All clear.\nGo enjoy your day.' : 'Leave home\nworry‑free'}
      </Text>

      {checks.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tiles}
          accessibilityLabel="Your checks"
        >
          {checks.map((c) => (
            <CheckTile key={c.id} check={c} onPress={onTilePress} />
          ))}
        </ScrollView>
      )}

      {saveError && (
        <Text style={styles.saveError} accessibilityRole="alert">
          Changes couldn’t be saved. They’ll be lost if the app closes.
        </Text>
      )}

      <View style={styles.sectionRow}>
        <Text style={styles.section} accessibilityRole="header">
          Today’s checks
        </Text>
        {checks.length > 0 && (
          <Text style={[styles.count, allDone && styles.countDone]}>
            {done} of {checks.length} done
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <FlatList
        data={checks}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <CheckCard
              check={item}
              onScan={onScan}
              onMarkManual={onMarkManual}
              onViewProof={onViewProof}
              onLongPress={onLongPress}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing on your home screen</Text>
            <Text style={styles.emptyBody}>Pick the things you always second‑guess — doors, gas, fans, Wi‑Fi.</Text>
            <Button label="Choose checks" variant="accent" onPress={onCustomise} style={styles.emptyCta} />
          </View>
        }
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: NAV_HEIGHT + 60 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headline: {
    marginTop: 28,
    paddingHorizontal: spacing.xl,
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  tiles: { gap: 10, paddingHorizontal: spacing.xl, paddingTop: 22 },
  saveError: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.manualBg,
    color: colors.manualInk,
    fontFamily: fonts.medium,
    fontSize: 13,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: 28,
    marginBottom: 14,
  },
  section: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  count: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accentText },
  countDone: { color: colors.verifiedInk },
  cardWrap: { paddingHorizontal: spacing.lg },
  empty: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 6 },
  emptyCta: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
