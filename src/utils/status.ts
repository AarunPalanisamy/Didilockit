import { colors } from '../theme';
import type { Check } from '../types';
import { formatTime12 } from './time';

export type CheckState = 'scanned' | 'manual' | 'pending';

export function stateOf(check: Check): CheckState {
  if (!check.verification) return 'pending';
  return check.verification.method === 'manual' ? 'manual' : 'scanned';
}

export function statusLabel(check: Check): string {
  const v = check.verification;
  if (!v) return 'Not checked';
  const time = formatTime12(v.verifiedAt);
  if (v.method === 'manual') return `By hand · ${time}`;
  return `Verified · ${time} · ${v.method}`;
}

export const statusColors: Record<CheckState, { bg: string; ink: string }> = {
  scanned: { bg: colors.verifiedBg, ink: colors.verifiedInk },
  manual: { bg: colors.manualBg, ink: colors.manualInk },
  pending: { bg: colors.pendingBg, ink: colors.pendingInk },
};
