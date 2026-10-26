# Did I Lock It? — Engineering & UX Analysis (V3 · Soft Tiles)

## 1. The problem and the answer

"Did I lock it?" is checking anxiety. Memory of a routine action is weak, so doubt shows up after you've left. **Evidence beats memory**: a timestamped photo or 3-second clip lets you *look* instead of *remember*.

V3 adds two things people asked for:

| Need | Answer in the app |
|---|---|
| Sometimes I just want to tick it | **Two ways to confirm** every check: *Scan & verify* (photo / 3 s clip, recommended) or *Mark done by hand* (quick, no proof). They look different on purpose: green "Verified · photo" vs amber "By hand", and a hand tick offers **Add proof**. |
| My home has other things to check | **Profile → Your checks**: switch built-ins on/off (Door, Stove, Iron, Windows, **Gas cylinder, Fans, Wi‑Fi router**) and **add your own** with a name and a picture. Only switched-on checks appear on Home. |

### Flows

```
Home ─ tile / center Scan ─► "Is the iron unplugged?" sheet ─┬─► Scan ─► camera ─► Proof pass ─► Next: Windows
                                                               └─► By hand ─────────► Proof pass
Home card ─ ✓ (quick tick, no sheet) · Scan (straight to camera) · 👁 (view proof) · Add proof (upgrade a hand tick)
Long-press card ─ Clear status / Hide from home / Delete (custom)
Profile ─ toggle checks · add your own · delete custom
24 h later ─ every proof (scan or hand) resets automatically
```

---

## 2. Key decisions

| Decision | Choice | Why / tradeoff |
|---|---|---|
| Navigation | Two tabs (Home, Profile) + centre Scan, **no navigation library** | Two screens don't justify `react-navigation`. A `tab` state plus a single-modal flow keeps the bundle small. If more screens arrive (history, settings), add Expo Router then. |
| Modals | `useModalFlow`: one modal at a time, with a queue on iOS | iOS can't present a modal while another is dismissing. Sheet → camera → proof pass needs chaining, so on iOS the next modal opens from `onDismiss`. |
| Illustrations | `react-native-svg`, ported 1:1 from the design | Crisp at any size, no image assets, themable. It's an official Expo-supported package. |
| Font | Plus Jakarta Sans via `@expo-google-fonts` | Matches the design. If the font fails to load, the app falls back to the system font instead of blocking. |
| Hand ticks | `method: 'manual'`, `mediaUri: null` | One `Verification` shape for all methods. The UI and the streak treat it as done. Expiry treats it like any proof (no file to delete). |
| Custom checks | `custom: true`, user picks one of 8 pictures | Built-ins can only be hidden, so their ids stay stable. New built-ins added to `CATALOG` later are merged in for existing users automatically. |
| Streak | A day counts when **every check shown on Home** is done | Hidden checks don't break it. A streak survives through the next day (`visibleStreak`), so it doesn't vanish at midnight before you've had a chance. |
| Clock | Live time pill in the header | Keeps the original "current time at the top" requirement in the new layout. |
| Camera / audio / playback / files | Unchanged from V1 | `expo-camera` CameraView, muted 3 s clips (no mic permission), `expo-video`, `expo-file-system` object API, and media moved out of cache into `Documents/proofs/`. |

---

## 3. Architecture

```
App.tsx                         fonts → Root: tab state, modal flow, wires handlers
src/
├─ screens/   HomeScreen · ProfileScreen
├─ components/
│  ├─ home/   TopBar (streak + clock) · CheckTile · CheckCard
│  ├─ art/    CheckArt (8 SVG illustrations)
│  ├─ ui/     Button · IconButton · Sheet · StatusPill
│  ├─ VerifySheet · CaptureModal · PermissionGate · ProofPassModal · MediaViewerModal · AddCheckSheet · BottomNav
├─ hooks/     useChecks (state + persistence + cleanup + actions) · useModalFlow · useNow
├─ services/  expiry.ts · streak.ts (PURE, unit-tested) · storage.ts (v2 + v1 migration) · media.ts
└─ constants.ts (CATALOG, art choices) · theme.ts · types.ts · utils/
```

Layering: **Screen → hook → service → AsyncStorage / FileSystem**. Components never touch storage directly.

### Data model (stored as one JSON blob, key `didilockit:data:v2`)

```ts
type Check = {
  id: string;                       // 'builtin-gas' | 'custom-<ts>-<rand>'
  label: string;
  art: 'door'|'stove'|'iron'|'window'|'fan'|'wifi'|'gas'|'custom';
  enabled: boolean;                 // shown on Home
  custom: boolean;                  // deletable
  verification: { method: 'photo'|'video'|'manual'; mediaUri: string|null; verifiedAt: number } | null;
};
type AppData = { checks: Check[]; streak: { count: number; lastDay: 'YYYY-MM-DD'|null } };
```

**Migration from V1**: on first launch, `didilockit:tasks:v1` is read and mapped. Default ids become built-in ids, emoji prefixes are stripped from labels, and `mediaType` becomes `method`. Today's proofs carry over. The old key is removed after the first v2 save.

---

## 4. Auto-cleanup (24 h)

Cleanup runs on **cold launch**, when the app returns to the **foreground**, and on a **timer to the earliest expiry** while the app is open.

`resetExpired()` is pure. It:

- expires proofs that are 24 h old or more, and proofs dated more than 1 minute in the future (a sign the clock was moved back);
- resets scanned rows whose file has gone missing;
- never deletes anything for hand ticks, because they have no file.

On launch, files in `proofs/` that no check references are swept. File deletes never throw.

Tests (`npm run test:logic`, Node ≥ 22.6) cover these cases: expiry at exactly 24 h, clock skew, manual expiry, missing file, immutability, streak start/continue/reset/once-per-day, month and year boundaries, and hidden checks not counting toward the streak.

---

## 5. UI states

| Surface | Covered |
|---|---|
| App | Font loading (blank ground), data loading (spinner), load error → retry, save error → inline banner |
| Home | Empty (no checks switched on → "Choose checks"), progress "2 of 4 done", all-done headline, pending / by-hand / scanned cards |
| Centre Scan | Next pending check → sheet. All done → "All clear" alert. No checks → Profile |
| Camera | Permission explainer; blocked → Settings **or "Mark done by hand instead"**; camera warming up; capture, recording countdown, save failure (modal stays open); torch toggle |
| Proof pass | Photo shows the real image; video or by-hand shows the illustration with a method chip; "Next: X" or "All clear" |
| Viewer | Looping muted video or photo; broken file → "retake" message |
| Add check | Empty and duplicate validation, 32-character cap with counter, picture picker |

**Accessibility**: every control has a role and label ("Mark Iron / Straightener done by hand"). Tabs expose `selected`, radios expose `selected`, and the status and error text uses live regions. Touch targets are ≥ 44–48 dp. Text contrast: muted `#6B6B78` on white 5.3:1, accent text `#4A3AF0` 6.0:1, and all status pills ≥ 4.7:1.

---

## 6. Risks & limits

- **"Scan" means capture with the camera.** It does not detect whether the lock is actually turned. On-device detection (e.g. a TFLite model per check type) is a possible later feature.
- **Untested on a device.** This code was written without access to npm, so it was not run here. Imports target Expo SDK 54 APIs. Run `npx expo install --fix` and test on a physical phone (simulators have no camera).
- **Streak logic** uses the phone's own timezone and clock, so a user can cheat it by changing the clock. That's acceptable for a personal reassurance tool.

## 7. Setup

```bash
npx create-expo-app@latest did-i-lock-it --template blank-typescript
# copy App.tsx, index.ts, app.json, tsconfig.json, src/ into the project
npx expo install expo-camera expo-video expo-file-system expo-haptics expo-font \
  @react-native-async-storage/async-storage react-native-safe-area-context \
  react-native-svg @expo/vector-icons @expo-google-fonts/plus-jakarta-sans
npx expo install --fix
npx expo run:ios    # or run:android, or a dev build
npm run test:logic
```
