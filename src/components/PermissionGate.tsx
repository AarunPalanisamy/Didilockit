import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme';
import { Button } from './ui/Button';

type Props = {
  status: 'loading' | 'ask' | 'blocked';
  onRequest: () => void;
  onClose: () => void;
  /** Lets the user finish the check without the camera. */
  onMarkManual: () => void;
};

/** Pre-permission explainer, shown before the OS dialog and when access is denied. */
export function PermissionGate({ status, onRequest, onClose, onMarkManual }: Props) {
  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const blocked = status === 'blocked';
  return (
    <View style={styles.center}>
      <View style={styles.icon}>
        <Ionicons name={blocked ? 'videocam-off-outline' : 'camera-outline'} size={34} color={colors.accentText} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {blocked ? 'Camera access is off' : 'Snap it, then stop worrying'}
      </Text>
      <Text style={styles.body}>
        {blocked
          ? 'To scan, allow camera access for Did I Lock It? in Settings. You can still tick this check by hand.'
          : 'A quick photo or 3‑second clip is your proof. It stays on this phone and deletes itself after 24 hours.'}
      </Text>

      <Button
        label={blocked ? 'Open Settings' : 'Allow camera'}
        variant="accent"
        onPress={blocked ? () => void Linking.openSettings() : onRequest}
        style={styles.primary}
      />
      <Button label="Mark done by hand instead" variant="ghost" onPress={onMarkManual} style={styles.secondary} />
      <Button label="Not now" variant="ghost" compact onPress={onClose} style={styles.tertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.bg },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { fontFamily: fonts.semibold, fontSize: 22, color: colors.ink, textAlign: 'center' },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: spacing.md, maxWidth: 320 },
  primary: { marginTop: spacing.xxl, alignSelf: 'stretch' },
  secondary: { marginTop: spacing.sm, alignSelf: 'stretch' },
  tertiary: { marginTop: spacing.sm, borderColor: 'transparent', backgroundColor: 'transparent' },
});
