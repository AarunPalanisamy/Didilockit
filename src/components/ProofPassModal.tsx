import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VERIFICATION_TTL_MS } from '../constants';
import { artTint, colors, fonts, radius, spacing, shadow } from '../theme';
import type { Check } from '../types';
import { formatTime12 } from '../utils/time';
import { CheckArt } from './art/CheckArt';
import { Button } from './ui/Button';

type Props = {
  check: Check | null;
  doneCount: number;
  totalCount: number;
  next: Check | null;
  onNext: (check: Check) => void;
  onClose: () => void;
  onDismiss?: () => void;
};

const METHOD_LABEL = { photo: 'PHOTO PROOF', video: 'VIDEO PROOF', manual: 'MARKED BY HAND' } as const;

/** Success screen after scanning or ticking — a ticket-style "proof pass". */
export function ProofPassModal({ check, doneCount, totalCount, next, onNext, onClose, onDismiss }: Props) {
  const v = check?.verification;
  return (
    <Modal visible={!!v} animationType="fade" onRequestClose={onClose} onDismiss={onDismiss} statusBarTranslucent>
      {check && v && (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
          <View style={[styles.tick, shadow.accent]} accessible={false}>
            <Ionicons name="checkmark" size={32} color={colors.onDark} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {check.label} — done
          </Text>
          <Text style={styles.subtitle}>{v.method === 'manual' ? 'Ticked by hand' : 'Saved to your proof pass'}</Text>

          <View style={styles.pass} accessible accessibilityLabel={`Proof pass. ${check.label}, ${formatTime12(v.verifiedAt)}`}>
            <View style={[styles.media, { backgroundColor: artTint[check.art] }]}>
              {v.method === 'photo' && v.mediaUri ? (
                <Image source={{ uri: v.mediaUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <CheckArt kind={check.art} width={170} />
              )}
              <View style={styles.methodChip}>
                <Text style={styles.methodText}>{METHOD_LABEL[v.method]}</Text>
              </View>
            </View>
            <View style={styles.grid}>
              <Field label="CHECK" value={check.label} />
              <Field label="AT" value={formatTime12(v.verifiedAt)} alignEnd />
            </View>
            <View style={styles.perforation} />
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Clears tomorrow {formatTime12(v.verifiedAt + VERIFICATION_TTL_MS)}</Text>
              <Text style={styles.footerStrong}>
                {doneCount} / {totalCount} done
              </Text>
            </View>
          </View>

          <View style={styles.flex} />

          {next ? (
            <Button label={`Next: ${next.label}`} icon="arrow-forward" trailingIcon onPress={() => onNext(next)} />
          ) : (
            <Button label="All clear — back home" variant="accent" onPress={onClose} />
          )}
          {next && <Button label="Back to home" variant="ghost" onPress={onClose} style={styles.secondary} />}
        </SafeAreaView>
      )}
    </Modal>
  );
}

function Field({ label, value, alignEnd }: { label: string; value: string; alignEnd?: boolean }) {
  return (
    <View style={[styles.field, alignEnd && styles.fieldEnd]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl - 4, paddingTop: spacing.xxl, paddingBottom: spacing.lg, alignItems: 'stretch' },
  tick: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.semibold, fontSize: 26, letterSpacing: -0.5, color: colors.ink, textAlign: 'center', marginTop: 18 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 6 },
  pass: { marginTop: 28, borderRadius: 26, backgroundColor: colors.card, overflow: 'hidden' },
  media: { height: 180, alignItems: 'center', justifyContent: 'center' },
  methodChip: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  methodText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, color: colors.onDark },
  grid: { flexDirection: 'row', padding: 20, gap: spacing.lg },
  field: { flex: 1, gap: 4 },
  fieldEnd: { alignItems: 'flex-end' },
  fieldLabel: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1, color: colors.muted },
  fieldValue: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  perforation: { marginHorizontal: 20, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.line },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
  footerText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  footerStrong: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  flex: { flex: 1 },
  secondary: { marginTop: spacing.sm },
});
