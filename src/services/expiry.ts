// Pure, side-effect-free expiry logic. No React Native imports, so it runs
// under plain Node for tests (see logic.test.mjs).
import type { Check, Verification } from '../types';

export function isExpired(verification: Verification, now: number, ttlMs: number): boolean {
  const age = now - verification.verifiedAt;
  // A timestamp in the future means the device clock moved backwards.
  // Treat it as untrustworthy and expire it.
  return age >= ttlMs || age < -60_000;
}

export type ExpiryResult = {
  checks: Check[];
  /** Media files that should now be deleted from disk */
  expiredUris: string[];
  changed: boolean;
};

/**
 * Resets every check whose proof is older than `ttlMs`, or whose media file
 * no longer exists. Manual ticks have no file and expire on time only.
 * Returns a new array; never mutates.
 */
export function resetExpired(
  checks: readonly Check[],
  now: number,
  ttlMs: number,
  fileExists: (uri: string) => boolean = () => true,
): ExpiryResult {
  const expiredUris: string[] = [];
  let changed = false;

  const next = checks.map((check) => {
    const v = check.verification;
    if (!v) return check;

    const expired = isExpired(v, now, ttlMs);
    const missing = !expired && v.mediaUri !== null && !fileExists(v.mediaUri);
    if (!expired && !missing) return check;

    if (expired && v.mediaUri) expiredUris.push(v.mediaUri);
    changed = true;
    return { ...check, verification: null };
  });

  return { checks: changed ? next : [...checks], expiredUris, changed };
}

/** Earliest moment any current proof will expire, or null if none. */
export function nextExpiryAt(checks: readonly Check[], ttlMs: number): number | null {
  let earliest: number | null = null;
  for (const check of checks) {
    if (!check.verification) continue;
    const at = check.verification.verifiedAt + ttlMs;
    if (earliest === null || at < earliest) earliest = at;
  }
  return earliest;
}
