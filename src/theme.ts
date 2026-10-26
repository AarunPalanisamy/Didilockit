import type { ArtKind } from './types';

/** "Soft Tiles" — light lavender ground, white cards, one indigo accent. */
export const colors = {
  bg: '#F4F3F8',
  card: '#FFFFFF',
  ink: '#15151A',
  muted: '#6B6B78', // 5.3:1 on white
  line: '#E3E1EE',
  subtle: '#F1F0F6',

  accent: '#5B4BFF', // white text 5.4:1
  accentText: '#4A3AF0', // on bg 6.0:1
  accentSoft: '#F3F1FF',
  accentLine: '#C9C3FF',

  verifiedBg: '#E3F5EC',
  verifiedInk: '#157A4C',
  manualBg: '#FFF1DB',
  manualInk: '#8A4B00',
  pendingBg: '#F1F0F6',
  pendingInk: '#5E5E6B',

  streak: '#FF7A59',
  danger: '#C8362A',
  camera: '#1E1E26',
  scrim: 'rgba(21, 21, 26, 0.35)',
  onDark: '#FFFFFF',
  onDarkGlass: 'rgba(255, 255, 255, 0.16)',
} as const;

export const artTint: Record<ArtKind, string> = {
  door: '#FFE8DC',
  stove: '#DDF3EA',
  iron: '#E8E4FF',
  window: '#DDEEFB',
  fan: '#E0F4F8',
  wifi: '#EAF0FF',
  gas: '#FFE4E0',
  custom: '#ECEBF3',
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 14, md: 18, lg: 22, xl: 28, pill: 999 } as const;

/** Minimum touch target (Apple 44pt / Material 48dp). */
export const HIT = 48;

export const shadow = {
  soft: {
    shadowColor: '#15151A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  accent: {
    shadowColor: '#5B4BFF',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
