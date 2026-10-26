import AsyncStorage from '@react-native-async-storage/async-storage';

import { CATALOG_BY_ID, LEGACY_STORAGE_KEY, STORAGE_KEY, defaultChecks } from '../constants';
import type { AppData, ArtKind, Check, ProofMethod, Streak, Verification } from '../types';

const ART_KINDS: readonly ArtKind[] = ['door', 'stove', 'iron', 'window', 'fan', 'wifi', 'gas', 'custom'];
const METHODS: readonly ProofMethod[] = ['photo', 'video', 'manual'];

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object';

function parseVerification(v: unknown): Verification | null {
  if (!isRec(v) || typeof v.verifiedAt !== 'number') return null;
  if (!METHODS.includes(v.method as ProofMethod)) return null;
  const method = v.method as ProofMethod;
  const mediaUri = typeof v.mediaUri === 'string' ? v.mediaUri : null;
  if (method !== 'manual' && !mediaUri) return null;
  return { method, mediaUri: method === 'manual' ? null : mediaUri, verifiedAt: v.verifiedAt };
}

function parseCheck(v: unknown): Check | null {
  if (!isRec(v) || typeof v.id !== 'string' || typeof v.label !== 'string') return null;
  return {
    id: v.id,
    label: v.label,
    art: ART_KINDS.includes(v.art as ArtKind) ? (v.art as ArtKind) : 'custom',
    enabled: v.enabled !== false,
    custom: v.custom === true,
    verification: parseVerification(v.verification),
  };
}

function parseStreak(v: unknown): Streak {
  if (isRec(v) && typeof v.count === 'number' && (v.lastDay === null || typeof v.lastDay === 'string')) {
    return { count: v.count, lastDay: v.lastDay };
  }
  return { count: 0, lastDay: null };
}

/** Adds built-ins introduced after the user's data was saved. */
function withCatalog(checks: Check[]): Check[] {
  const ids = new Set(checks.map((c) => c.id));
  const missing = defaultChecks().filter((c) => !ids.has(c.id));
  return missing.length ? [...checks, ...missing] : checks;
}

// ── v1 → v2 migration ──────────────────────────────────────────────────────
const V1_ID_MAP: Record<string, string> = {
  'default-front-door': 'builtin-door',
  'default-stove': 'builtin-stove',
  'default-iron': 'builtin-iron',
  'default-windows': 'builtin-window',
};

/** "🚪 Front Door" → "Front Door" (no Unicode property escapes needed). */
function stripLeadingEmoji(label: string): string {
  const match = /^(\S+)\s+(.+)$/.exec(label);
  return match && !/[A-Za-z0-9]/.test(match[1] ?? '') ? (match[2] ?? label) : label;
}

function migrateV1(raw: unknown): Check[] | null {
  if (!Array.isArray(raw)) return null;
  const migrated: Check[] = [];
  for (const t of raw) {
    if (!isRec(t) || typeof t.id !== 'string' || typeof t.label !== 'string') continue;
    const builtinId = V1_ID_MAP[t.id];
    const catalog = builtinId ? CATALOG_BY_ID.get(builtinId) : undefined;
    const v = isRec(t.verification) ? t.verification : null;
    migrated.push({
      id: builtinId ?? t.id,
      label: catalog?.label ?? stripLeadingEmoji(t.label),
      art: catalog?.art ?? 'custom',
      enabled: true,
      custom: !catalog,
      verification: v ? parseVerification({ ...v, method: v.mediaType }) : null,
    });
  }
  return migrated;
}

// ── Public API ─────────────────────────────────────────────────────────────
/** Never returns null: first launch / corrupt data → defaults. Throws on read failure. */
export async function loadData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isRec(parsed) && Array.isArray(parsed.checks)) {
        const checks = parsed.checks.map(parseCheck).filter((c): c is Check => c !== null);
        return { checks: withCatalog(checks), streak: parseStreak(parsed.streak) };
      }
    } catch (error) {
      console.warn('[storage] Corrupt data, using defaults', error);
    }
    return { checks: defaultChecks(), streak: { count: 0, lastDay: null } };
  }

  const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy !== null) {
    try {
      const migrated = migrateV1(JSON.parse(legacy));
      if (migrated) return { checks: withCatalog(migrated), streak: { count: 0, lastDay: null } };
    } catch (error) {
      console.warn('[storage] Could not migrate v1 data', error);
    }
  }
  return { checks: defaultChecks(), streak: { count: 0, lastDay: null } };
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Once v2 is written, the legacy key is no longer needed.
  await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
}

