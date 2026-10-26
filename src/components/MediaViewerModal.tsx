import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VERIFICATION_TTL_MS } from '../constants';
import { colors, fonts, radius, spacing } from '../theme';
import type { Check } from '../types';
import { formatAgo, formatExpiresIn, formatTime12 } from '../utils/time';
import { Button, IconButton } from './ui/Button';

type Props = {
  check: Check | null;
  now: number;
  onClose: () => void;
  onRetake: (check: Check) => void;
  onDismiss?: () => void;
};

export function MediaViewerModal({ check, now, onClose, onRetake, onDismiss }: Props) {
  const visible = !!check?.verification?.mediaUri;
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} onDismiss={onDismiss} statusBarTranslucent>
      {check && visible && <Viewer check={check} now={now} onClose={onClose} onRetake={onRetake} />}
    </Modal>
  );
}

function Viewer({ check, now, onClose, onRetake }: { check: Check } & Omit<Props, 'check' | 'onDismiss'>) {
  const v = check.verification!;
  const uri = v.mediaUri!;
  const [failed, setFailed] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>VERIFIED</Text>
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            {check.label}
          </Text>
        </View>
        <IconButton icon="close" onPress={onClose} accessibilityLabel="Close" size={48} />
      </View>

      <View style={styles.media}>
        {failed ? (
          <View style={styles.missing}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.muted} />
            <Text style={styles.missingText}>This proof can’t be opened. Retake it to be sure.</Text>
          </View>
        ) : v.method === 'video' ? (
          <VideoProof uri={uri} />
        ) : (
          <Image
            source={{ uri }}
            style={styles.fill}
            resizeMode="contain"
            onError={() => setFailed(true)}
            accessibilityLabel={`Photo proof for ${check.label}`}
          />
        )}
      </View>

      <View style={styles.facts}>
        <Fact label="AT" value={formatTime12(v.verifiedAt)} />
        <Fact label="AGO" value={formatAgo(v.verifiedAt, now)} />
        <Fact label="CLEARS" value={formatExpiresIn(v.verifiedAt + VERIFICATION_TTL_MS, now).replace('Clears in ', 'in ')} />
      </View>

      <View style={styles.actions}>
        <Button label="Retake" variant="ghost" icon="refresh" onPress={() => onRetake(check)} style={styles.flex1} />
        <Button label="Yes, I did it" variant="accent" onPress={onClose} style={styles.flex2} />
      </View>
    </SafeAreaView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function VideoProof({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={styles.fill}
      contentFit="contain"
      nativeControls
      accessibilityLabel="Video proof, playing on loop"
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md },
  headerText: { flex: 1 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.verifiedInk },
  title: { fontFamily: fonts.semibold, fontSize: 24, letterSpacing: -0.4, color: colors.ink, marginTop: 4 },
  media: { flex: 1, marginHorizontal: spacing.lg, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.camera },
  fill: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: colors.card },
  missingText: { fontFamily: fonts.regular, color: colors.muted, textAlign: 'center', fontSize: 15 },
  facts: { flexDirection: 'row', marginTop: spacing.xl, marginHorizontal: spacing.xl, gap: spacing.md },
  fact: { flex: 1, gap: 6 },
  factLabel: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.5, color: colors.muted },
  factValue: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  actions: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  flex1: { flex: 1 },
  flex2: { flex: 1.5 },
});
