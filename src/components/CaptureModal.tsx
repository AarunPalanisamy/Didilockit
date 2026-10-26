import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VIDEO_MAX_SECONDS, hintFor } from '../constants';
import { colors, fonts, HIT, radius, shadow, spacing } from '../theme';
import type { Check, MediaType } from '../types';
import { PermissionGate } from './PermissionGate';
import { IconButton } from './ui/Button';

type Props = {
  check: Check | null;
  onClose: () => void;
  onDismiss?: () => void;
  /** Persist the capture. May throw; the modal then shows an error and stays open. */
  onCaptured: (check: Check, tempUri: string, mediaType: MediaType) => void;
  onMarkManual: (check: Check) => void;
};

export function CaptureModal({ check, onClose, onDismiss, onCaptured, onMarkManual }: Props) {
  return (
    <Modal
      visible={check !== null}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      onDismiss={onDismiss}
      statusBarTranslucent
    >
      {/* Camera mounts only while open, so hardware is released on close. */}
      {check && <CaptureScreen check={check} onClose={onClose} onCaptured={onCaptured} onMarkManual={onMarkManual} />}
    </Modal>
  );
}

type Phase = 'idle' | 'capturing' | 'recording' | 'saving';

function CaptureScreen({ check, onClose, onCaptured, onMarkManual }: { check: Check } & Omit<Props, 'check' | 'onDismiss'>) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [mode, setMode] = useState<MediaType>('photo');
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(VIDEO_MAX_SECONDS);
  const [error, setError] = useState<string | null>(null);

  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; stop?: ReturnType<typeof setTimeout> }>({});
  const isRecording = useRef(false);

  const clearTimers = () => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.stop);
  };

  // Stop an in-flight recording if the modal is dismissed mid-clip.
  useEffect(() => {
    const t = timers.current;
    const camera = cameraRef;
    return () => {
      clearInterval(t.tick);
      clearTimeout(t.stop);
      if (isRecording.current) camera.current?.stopRecording();
    };
  }, []);

  const busy = phase !== 'idle';

  const switchMode = (next: MediaType) => {
    if (busy || next === mode) return;
    setReady(false); // CameraView remounts (keyed by mode) and fires onCameraReady again
    setError(null);
    setMode(next);
  };

  const finish = (uri: string, mediaType: MediaType) => {
    setPhase('saving');
    try {
      onCaptured(check, uri, mediaType);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error('[capture] Save failed', e);
      setError('Couldn’t save your proof. Check free storage and try again.');
      setPhase('idle');
    }
  };

  const takePhoto = async () => {
    const camera = cameraRef.current;
    if (!camera || !ready || busy) return;
    setError(null);
    setPhase('capturing');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const photo = await camera.takePictureAsync({ quality: 0.6 });
      if (!photo?.uri) throw new Error('No photo returned');
      finish(photo.uri, 'photo');
    } catch (e) {
      console.error('[capture] Photo failed', e);
      setError('Couldn’t take the photo. Try again.');
      setPhase('idle');
    }
  };

  const recordClip = async () => {
    const camera = cameraRef.current;
    if (!camera || !ready || busy) return;
    setError(null);
    setPhase('recording');
    setSecondsLeft(VIDEO_MAX_SECONDS);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const startedAt = Date.now();
    timers.current.tick = setInterval(() => {
      setSecondsLeft(Math.max(0, VIDEO_MAX_SECONDS - Math.floor((Date.now() - startedAt) / 1000)));
    }, 200);
    // Safety net in case a device ignores maxDuration.
    timers.current.stop = setTimeout(() => {
      if (isRecording.current) camera.stopRecording();
    }, VIDEO_MAX_SECONDS * 1000 + 600);

    try {
      isRecording.current = true;
      const video = await camera.recordAsync({ maxDuration: VIDEO_MAX_SECONDS });
      isRecording.current = false;
      clearTimers();
      if (!video?.uri) throw new Error('No video returned');
      finish(video.uri, 'video');
    } catch (e) {
      isRecording.current = false;
      clearTimers();
      console.error('[capture] Recording failed', e);
      setError('Recording failed. Try again, or take a photo instead.');
      setPhase('idle');
    }
  };

  // ── Permission states ───────────────────────────────────────────────────
  if (!permission || !permission.granted) {
    const status = !permission ? 'loading' : permission.canAskAgain ? 'ask' : 'blocked';
    return (
      <PermissionGate
        status={status}
        onRequest={() => void requestPermission()}
        onClose={onClose}
        onMarkManual={() => onMarkManual(check)}
      />
    );
  }

  const isVideo = mode === 'video';
  const recording = phase === 'recording';
  const showSpinner = !ready || phase === 'capturing' || phase === 'saving';

  return (
    <View style={styles.root}>
      <View style={styles.viewport}>
        <CameraView
          key={mode}
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode={isVideo ? 'video' : 'picture'}
          enableTorch={torch}
          mute
          videoQuality="720p"
          onCameraReady={() => setReady(true)}
          onMountError={(e) => setError(e.message || 'Camera unavailable')}
        />

        <View style={styles.frame} pointerEvents="none">
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
          <IconButton icon="close" tone="glass" size={HIT} onPress={onClose} accessibilityLabel="Close camera" />
          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {recording ? `Recording · ${secondsLeft}s` : `Scanning · ${check.label}`}
            </Text>
          </View>
          <IconButton
            icon={torch ? 'flash' : 'flash-outline'}
            tone="glass"
            size={HIT}
            onPress={() => setTorch((t) => !t)}
            accessibilityLabel={torch ? 'Turn off torch' : 'Turn on torch'}
          />
        </SafeAreaView>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.panel}>
        <Text style={styles.title}>{check.custom ? `Show ${check.label} clearly` : `Show it’s ${hintFor(check).toLowerCase()}`}</Text>
        <Text style={styles.subtitle} accessibilityLiveRegion="polite">
          {error ?? (isVideo ? 'Hold steady — the clip stops at 3 seconds' : 'Keep it inside the frame')}
        </Text>

        <View style={styles.controls}>
          <View style={styles.modes} accessibilityRole="radiogroup">
            {(['photo', 'video'] as const).map((m) => {
              const selected = m === mode;
              return (
                <Pressable
                  key={m}
                  onPress={() => switchMode(m)}
                  disabled={busy}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: busy }}
                  style={[styles.mode, selected ? styles.modeOn : styles.modeOff]}
                >
                  <Text style={[styles.modeText, selected && styles.modeTextOn]}>
                    {m === 'photo' ? 'Photo' : `${VIDEO_MAX_SECONDS}s clip`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={isVideo ? recordClip : takePhoto}
            disabled={!ready || busy}
            accessibilityRole="button"
            accessibilityLabel={isVideo ? 'Record 3 second clip' : 'Take photo'}
            accessibilityState={{ disabled: !ready || busy, busy }}
            style={({ pressed }) => [styles.shutter, shadow.accent, (!ready || busy) && !recording && styles.dim, pressed && styles.pressed]}
          >
            {recording ? (
              <Text style={styles.countdown}>{secondsLeft}</Text>
            ) : showSpinner ? (
              <ActivityIndicator color={colors.onDark} />
            ) : (
              <Ionicons name={isVideo ? 'videocam' : 'camera'} size={28} color={colors.onDark} />
            )}
          </Pressable>

          <Pressable
            onPress={() => onMarkManual(check)}
            disabled={busy}
            accessibilityRole="button"
            style={styles.manual}
          >
            <Text style={styles.manualText}>Mark by hand</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const CORNER = 34;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card },
  viewport: {
    flex: 1,
    backgroundColor: colors.camera,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg + 4,
    paddingTop: spacing.sm,
  },
  pill: {
    flexShrink: 1,
    marginHorizontal: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.onDarkGlass,
  },
  pillText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.onDark },
  frame: { position: 'absolute', left: '18%', right: '18%', top: '28%', bottom: '24%' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.onDark },
  tl: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 12 },
  tr: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 12 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 12 },
  br: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 12 },
  panel: { paddingHorizontal: spacing.xl, paddingTop: 22, alignItems: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center' },
  controls: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: spacing.lg,
  },
  modes: { width: 92, gap: 6 },
  mode: { minHeight: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  modeOn: { backgroundColor: colors.ink },
  modeOff: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  modeText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  modeTextOn: { color: colors.onDark },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#E8E4FF',
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { opacity: 0.6 },
  pressed: { transform: [{ scale: 0.95 }] },
  countdown: { fontFamily: fonts.bold, fontSize: 24, color: colors.onDark },
  manual: { width: 92, minHeight: HIT, alignItems: 'flex-end', justifyContent: 'center' },
  manualText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accentText, textAlign: 'right' },
});
