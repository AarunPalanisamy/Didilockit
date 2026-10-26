import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { VERIFICATION_TTL_MS } from '../constants';
import { nextExpiryAt, resetExpired } from '../services/expiry';
import { deleteOrphans, mediaExists, persistCapture, safeDelete } from '../services/media';
import { loadData, saveData } from '../services/storage';
import { updateStreak } from '../services/streak';
import type { AppData, ArtKind, Check, MediaType, Verification } from '../types';

type Status = 'loading' | 'ready' | 'error';

const MAX_TIMEOUT_MS = 2 ** 31 - 1;
const EMPTY: AppData = { checks: [], streak: { count: 0, lastDay: null } };

function mediaUris(checks: readonly Check[]): string[] {
  return checks.flatMap((c) => (c.verification?.mediaUri ? [c.verification.mediaUri] : []));
}

function createId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Apply a change to the checks and keep the streak in sync (pure). */
function applyChecks(prev: AppData, nextChecks: Check[]): AppData {
  return { checks: nextChecks, streak: updateStreak(prev.streak, nextChecks, Date.now()) };
}

export function useChecks() {
  const [data, setData] = useState<AppData>(EMPTY);
  const [status, setStatus] = useState<Status>('loading');
  const [saveError, setSaveError] = useState(false);

  // Latest snapshot for actions that must know the previous file to delete.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ── Launch: load → 24h cleanup → orphan sweep ──────────────────────────
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const stored = await loadData();
      const result = resetExpired(stored.checks, Date.now(), VERIFICATION_TTL_MS, mediaExists);
      result.expiredUris.forEach(safeDelete);
      deleteOrphans(mediaUris(result.checks));
      setData({ checks: result.checks, streak: stored.streak });
      setStatus('ready');
    } catch (error) {
      console.error('[checks] Failed to load', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Persist every change once loaded ───────────────────────────────────
  useEffect(() => {
    if (status !== 'ready') return;
    saveData(data)
      .then(() => setSaveError(false))
      .catch((error) => {
        console.error('[checks] Failed to save', error);
        setSaveError(true);
      });
  }, [data, status]);

  // ── Ongoing cleanup: foreground + exact next expiry ────────────────────
  const runCleanup = useCallback(() => {
    const now = Date.now();
    resetExpired(dataRef.current.checks, now, VERIFICATION_TTL_MS).expiredUris.forEach(safeDelete);
    setData((prev) => {
      const r = resetExpired(prev.checks, now, VERIFICATION_TTL_MS, mediaExists);
      return r.changed ? { ...prev, checks: r.checks } : prev;
    });
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') runCleanup();
    });
    return () => sub.remove();
  }, [status, runCleanup]);

  const expiryAt = useMemo(() => nextExpiryAt(data.checks, VERIFICATION_TTL_MS), [data.checks]);
  useEffect(() => {
    if (expiryAt === null) return;
    const delay = Math.min(Math.max(0, expiryAt - Date.now()) + 1_000, MAX_TIMEOUT_MS);
    const id = setTimeout(runCleanup, delay);
    return () => clearTimeout(id);
  }, [expiryAt, runCleanup]);

  // ── Actions ────────────────────────────────────────────────────────────
  const setVerification = useCallback((checkId: string, verification: Verification | null) => {
    const previousUri = dataRef.current.checks.find((c) => c.id === checkId)?.verification?.mediaUri;
    setData((prev) =>
      applyChecks(
        prev,
        prev.checks.map((c) => (c.id === checkId ? { ...c, verification } : c)),
      ),
    );
    if (previousUri && previousUri !== verification?.mediaUri) safeDelete(previousUri);
  }, []);

  /** Throws if the media can't be saved — the caller shows the error. */
  const verifyWithMedia = useCallback(
    (checkId: string, tempUri: string, mediaType: MediaType) => {
      const mediaUri = persistCapture(tempUri, checkId, mediaType);
      setVerification(checkId, { method: mediaType, mediaUri, verifiedAt: Date.now() });
    },
    [setVerification],
  );

  const markManual = useCallback(
    (checkId: string) => setVerification(checkId, { method: 'manual', mediaUri: null, verifiedAt: Date.now() }),
    [setVerification],
  );

  const clearVerification = useCallback((checkId: string) => setVerification(checkId, null), [setVerification]);

  const setEnabled = useCallback((checkId: string, enabled: boolean) => {
    setData((prev) => applyChecks(prev, prev.checks.map((c) => (c.id === checkId ? { ...c, enabled } : c))));
  }, []);

  const addCustom = useCallback((label: string, art: ArtKind) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setData((prev) =>
      applyChecks(prev, [
        ...prev.checks,
        { id: createId(), label: trimmed, art, enabled: true, custom: true, verification: null },
      ]),
    );
  }, []);

  const removeCustom = useCallback((checkId: string) => {
    const target = dataRef.current.checks.find((c) => c.id === checkId);
    if (!target?.custom) return;
    setData((prev) => applyChecks(prev, prev.checks.filter((c) => c.id !== checkId)));
    if (target.verification?.mediaUri) safeDelete(target.verification.mediaUri);
  }, []);

  return {
    checks: data.checks,
    streak: data.streak,
    status,
    saveError,
    reload: load,
    verifyWithMedia,
    markManual,
    clearVerification,
    setEnabled,
    addCustom,
    removeCustom,
  };
}

export type ChecksApi = ReturnType<typeof useChecks>;
