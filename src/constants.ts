import type { ArtKind, Check } from './types';

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const VIDEO_MAX_SECONDS = 3;
export const CHECK_LABEL_MAX_LENGTH = 32;

export const STORAGE_KEY = 'didilockit:data:v2';
/** Pre-V3 key — read once and migrated. */
export const LEGACY_STORAGE_KEY = 'didilockit:tasks:v1';

type CatalogItem = {
  id: string;
  label: string;
  art: ArtKind;
  /** One-line "what good looks like", shown under the name */
  hint: string;
  question: string;
  enabledByDefault: boolean;
};

/**
 * Built-in checks. New entries added here appear for existing users too
 * (merged on load, using `enabledByDefault`).
 */
export const CATALOG: readonly CatalogItem[] = [
  { id: 'builtin-door', label: 'Front Door', art: 'door', hint: 'Locked', question: 'Is the door locked?', enabledByDefault: true },
  { id: 'builtin-stove', label: 'Kitchen Stove', art: 'stove', hint: 'Knobs off', question: 'Are the stove knobs off?', enabledByDefault: true },
  { id: 'builtin-iron', label: 'Iron / Straightener', art: 'iron', hint: 'Unplugged', question: 'Is the iron unplugged?', enabledByDefault: true },
  { id: 'builtin-window', label: 'Windows', art: 'window', hint: 'Shut & latched', question: 'Are the windows shut?', enabledByDefault: true },
  { id: 'builtin-gas', label: 'Gas cylinder', art: 'gas', hint: 'Regulator off', question: 'Is the gas regulator off?', enabledByDefault: false },
  { id: 'builtin-fan', label: 'Fans', art: 'fan', hint: 'Switched off', question: 'Are the fans off?', enabledByDefault: false },
  { id: 'builtin-wifi', label: 'Wi‑Fi router', art: 'wifi', hint: 'Off or on standby', question: 'Is the Wi‑Fi router off?', enabledByDefault: false },
];

export const CATALOG_BY_ID: ReadonlyMap<string, CatalogItem> = new Map(CATALOG.map((c) => [c.id, c]));

export function defaultChecks(): Check[] {
  return CATALOG.map((c) => ({
    id: c.id,
    label: c.label,
    art: c.art,
    enabled: c.enabledByDefault,
    custom: false,
    verification: null,
  }));
}

export function hintFor(check: Check): string {
  return CATALOG_BY_ID.get(check.id)?.hint ?? 'Your own check';
}

export function questionFor(check: Check): string {
  return CATALOG_BY_ID.get(check.id)?.question ?? `Did you check ${check.label}?`;
}

/** Art choices offered when creating a custom check. */
export const ART_CHOICES: readonly { art: ArtKind; label: string }[] = [
  { art: 'custom', label: 'Home' },
  { art: 'door', label: 'Door' },
  { art: 'window', label: 'Window' },
  { art: 'stove', label: 'Stove' },
  { art: 'iron', label: 'Appliance' },
  { art: 'fan', label: 'Fan' },
  { art: 'wifi', label: 'Device' },
  { art: 'gas', label: 'Gas' },
];
