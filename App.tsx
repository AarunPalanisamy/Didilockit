import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, type AlertButton, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AddCheckSheet } from './src/components/AddCheckSheet';
import { BottomNav, type Tab } from './src/components/BottomNav';
import { CaptureModal } from './src/components/CaptureModal';
import { MediaViewerModal } from './src/components/MediaViewerModal';
import { ProofPassModal } from './src/components/ProofPassModal';
import { Button } from './src/components/ui/Button';
import { VerifySheet } from './src/components/VerifySheet';
import { useChecks } from './src/hooks/useChecks';
import { useModalFlow } from './src/hooks/useModalFlow';
import { useNow } from './src/hooks/useNow';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { visibleStreak } from './src/services/streak';
import { colors, fonts, spacing } from './src/theme';
import type { Check, MediaType } from './src/types';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* If fonts fail we still render with the system font. */}
      {fontsLoaded || fontError ? <Root /> : <View style={styles.root} />}
    </SafeAreaProvider>
  );
}

function Root() {
  const now = useNow();
  const api = useChecks();
  const flow = useModalFlow();
  const [tab, setTab] = useState<Tab>('home');

  const enabled = useMemo(() => api.checks.filter((c) => c.enabled), [api.checks]);
  const doneCount = enabled.filter((c) => c.verification).length;

  // Modals hold ids; resolve the live check so expiry/edits are reflected.
  const modalId = flow.modal && 'id' in flow.modal ? flow.modal.id : null;
  const modalCheck = modalId ? api.checks.find((c) => c.id === modalId) ?? null : null;
  const target = (type: 'verify' | 'capture' | 'viewer' | 'pass') => (flow.modal?.type === type ? modalCheck : null);
  const passCheck = target('pass');
  const nextPending = enabled.find((c) => !c.verification && c.id !== passCheck?.id) ?? null;

  const { markManual, verifyWithMedia, clearVerification, setEnabled, removeCustom } = api;
  const { open, close } = flow;

  // ── Home handlers ──────────────────────────────────────────────────────
  const onTilePress = useCallback(
    (check: Check) => {
      const scanned = check.verification && check.verification.method !== 'manual';
      open(scanned ? { type: 'viewer', id: check.id } : { type: 'verify', id: check.id });
    },
    [open],
  );

  const onScan = useCallback((check: Check) => open({ type: 'capture', id: check.id }), [open]);
  const onViewProof = useCallback((check: Check) => open({ type: 'viewer', id: check.id }), [open]);

  const onQuickTick = useCallback(
    (check: Check) => {
      markManual(check.id);
      void Haptics.selectionAsync();
    },
    [markManual],
  );

  const onLongPress = useCallback(
    (check: Check) => {
      // Android shows at most 3 buttons.
      const buttons: AlertButton[] = [
        check.verification
          ? { text: 'Clear status', onPress: () => clearVerification(check.id) }
          : { text: 'Hide from home', onPress: () => setEnabled(check.id, false) },
      ];
      if (check.custom) {
        buttons.push({ text: 'Delete check', style: 'destructive', onPress: () => removeCustom(check.id) });
      }
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(check.label, undefined, buttons);
    },
    [clearVerification, setEnabled, removeCustom],
  );

  const onCenterScan = useCallback(() => {
    const pending = enabled.find((c) => !c.verification);
    if (pending) open({ type: 'verify', id: pending.id });
    else if (enabled.length === 0) setTab('profile');
    else Alert.alert('All clear', 'Everything on your home screen is checked.');
  }, [enabled, open]);

  // ── Verification flow ──────────────────────────────────────────────────
  const markManualAndShowPass = useCallback(
    (check: Check) => {
      markManual(check.id);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      open({ type: 'pass', id: check.id });
    },
    [markManual, open],
  );

  const onCaptured = useCallback(
    (check: Check, tempUri: string, mediaType: MediaType) => {
      verifyWithMedia(check.id, tempUri, mediaType); // throws → CaptureModal shows the error
      open({ type: 'pass', id: check.id });
    },
    [verifyWithMedia, open],
  );

  // ── Render ─────────────────────────────────────────────────────────────
  if (api.status === 'loading') {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.accent} accessibilityLabel="Loading your checks" />
      </View>
    );
  }

  if (api.status === 'error') {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.muted} />
        <Text style={styles.errorTitle}>Couldn’t load your checks</Text>
        <Button label="Try again" variant="accent" onPress={() => void api.reload()} style={styles.retry} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {tab === 'home' ? (
        <HomeScreen
          now={now}
          streak={visibleStreak(api.streak, now)}
          checks={enabled}
          saveError={api.saveError}
          onTilePress={onTilePress}
          onScan={onScan}
          onMarkManual={onQuickTick}
          onViewProof={onViewProof}
          onLongPress={onLongPress}
          onCustomise={() => setTab('profile')}
        />
      ) : (
        <ProfileScreen
          checks={api.checks}
          onToggle={setEnabled}
          onRemove={removeCustom}
          onAdd={() => open({ type: 'add' })}
        />
      )}

      <BottomNav tab={tab} onTab={setTab} onScan={onCenterScan} />

      <VerifySheet
        check={target('verify')}
        onClose={close}
        onDismiss={flow.onDismiss}
        onScan={onScan}
        onMarkManual={markManualAndShowPass}
      />
      <CaptureModal
        check={target('capture')}
        onClose={close}
        onDismiss={flow.onDismiss}
        onCaptured={onCaptured}
        onMarkManual={markManualAndShowPass}
      />
      <MediaViewerModal
        check={target('viewer')}
        now={now}
        onClose={close}
        onDismiss={flow.onDismiss}
        onRetake={onScan}
      />
      <ProofPassModal
        check={passCheck}
        doneCount={doneCount}
        totalCount={enabled.length}
        next={nextPending}
        onNext={(c) => open({ type: 'verify', id: c.id })}
        onClose={close}
        onDismiss={flow.onDismiss}
      />
      <AddCheckSheet
        visible={flow.modal?.type === 'add'}
        existingLabels={api.checks.map((c) => c.label)}
        onClose={close}
        onDismiss={flow.onDismiss}
        onAdd={api.addCustom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorTitle: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink, marginTop: spacing.md },
  retry: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
