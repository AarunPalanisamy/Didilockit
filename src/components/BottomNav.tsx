import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadow } from '../theme';

export type Tab = 'home' | 'profile';

type Props = {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onScan: () => void;
};

export const NAV_HEIGHT = 68;

const OUTLINE = { home: 'home-outline', person: 'person-outline' } as const;

export function BottomNav({ tab, onTab, onScan }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tabbar"
      style={[styles.bar, shadow.soft, { paddingBottom: Math.max(insets.bottom, 12), height: NAV_HEIGHT + Math.max(insets.bottom, 12) }]}
    >
      <NavItem active={tab === 'home'} icon="home" label="Home" onPress={() => onTab('home')} />
      <Pressable
        onPress={onScan}
        accessibilityRole="button"
        accessibilityLabel="Scan the next check"
        style={({ pressed }) => [styles.scan, shadow.accent, pressed && styles.pressed]}
      >
        <Ionicons name="scan" size={26} color={colors.onDark} />
      </Pressable>
      <NavItem active={tab === 'profile'} icon="person" label="Profile" onPress={() => onTab('profile')} />
    </View>
  );
}

function NavItem({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: 'home' | 'person';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={styles.item}
    >
      <Ionicons name={active ? icon : OUTLINE[icon]} size={23} color={active ? colors.accentText : colors.muted} />
      <View style={[styles.dot, active && styles.dotActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 44,
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  item: { width: 56, height: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  dot: { width: 16, height: 3, borderRadius: 2, backgroundColor: 'transparent' },
  dotActive: { backgroundColor: colors.accentText },
  scan: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -34,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.95 }] },
});
