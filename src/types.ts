/** Illustration shown for a check (tile, card, sheets). */
export type ArtKind = 'door' | 'stove' | 'iron' | 'window' | 'fan' | 'wifi' | 'gas' | 'custom';

/** photo/video = scanned with the camera; manual = ticked by hand, no media. */
export type ProofMethod = 'photo' | 'video' | 'manual';

export type MediaType = Exclude<ProofMethod, 'manual'>;

export type Verification = {
  method: ProofMethod;
  /** file:// URI inside the app's document directory; null for manual ticks */
  mediaUri: string | null;
  /** Epoch milliseconds */
  verifiedAt: number;
};

export type Check = {
  id: string;
  label: string;
  art: ArtKind;
  /** Shown on the home screen (toggled in Profile) */
  enabled: boolean;
  /** User-created (can be deleted); built-ins can only be hidden */
  custom: boolean;
  verification: Verification | null;
};

export type Streak = {
  count: number;
  /** Local day key YYYY-MM-DD of the last day every check was done */
  lastDay: string | null;
};

export type AppData = {
  checks: Check[];
  streak: Streak;
};
