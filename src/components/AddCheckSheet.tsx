import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ART_CHOICES, CHECK_LABEL_MAX_LENGTH } from '../constants';
import { artTint, colors, fonts, radius, spacing } from '../theme';
import type { ArtKind } from '../types';
import { CheckArt } from './art/CheckArt';
import { Button } from './ui/Button';
import { Sheet } from './ui/Sheet';

type Props = {
  visible: boolean;
  existingLabels: readonly string[];
  onClose: () => void;
  onDismiss?: () => void;
  onAdd: (label: string, art: ArtKind) => void;
};

export function AddCheckSheet({ visible, existingLabels, onClose, onDismiss, onAdd }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose} onDismiss={onDismiss}>
      {/* Remount per open so the form resets without an effect. */}
      {visible && <Form existingLabels={existingLabels} onClose={onClose} onAdd={onAdd} />}
    </Sheet>
  );
}

function Form({ existingLabels, onClose, onAdd }: Pick<Props, 'existingLabels' | 'onClose' | 'onAdd'>) {
  const [label, setLabel] = useState('');
  const [art, setArt] = useState<ArtKind>('custom');
  const [touched, setTouched] = useState(false);

  const trimmed = label.trim();
  const duplicate = existingLabels.some((l) => l.toLowerCase() === trimmed.toLowerCase());
  const error = !trimmed ? 'Give it a name' : duplicate ? 'That check already exists' : null;

  const submit = () => {
    setTouched(true);
    if (error) return;
    onAdd(trimmed, art);
    onClose();
  };

  return (
    <View>
      <Text style={styles.eyebrow}>NEW CHECK</Text>
      <Text style={styles.title} accessibilityRole="header">
        What do you forget?
      </Text>

      <TextInput
        value={label}
        onChangeText={setLabel}
        onBlur={() => setTouched(true)}
        placeholder="e.g. Geyser, AC, Balcony door"
        placeholderTextColor={colors.muted}
        maxLength={CHECK_LABEL_MAX_LENGTH}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={submit}
        accessibilityLabel="Check name"
        style={[styles.input, touched && error ? styles.inputError : null]}
      />
      <View style={styles.helper}>
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {touched && error ? error : ' '}
        </Text>
        <Text style={styles.counter}>
          {label.length}/{CHECK_LABEL_MAX_LENGTH}
        </Text>
      </View>

      <Text style={styles.pickLabel}>Pick a picture</Text>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {ART_CHOICES.map((choice) => {
          const selected = choice.art === art;
          return (
            <Pressable
              key={choice.art}
              onPress={() => setArt(choice.art)}
              accessibilityRole="radio"
              accessibilityLabel={choice.label}
              accessibilityState={{ selected }}
              style={[styles.choice, { backgroundColor: artTint[choice.art] }, selected && styles.choiceSelected]}
            >
              <CheckArt kind={choice.art} width={52} />
            </Pressable>
          );
        })}
      </View>

      <Button label="Add to home" variant="accent" onPress={submit} disabled={touched && !!error} style={styles.cta} />
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.muted },
  title: { fontFamily: fonts.semibold, fontSize: 24, letterSpacing: -0.4, color: colors.ink, marginTop: 6 },
  input: {
    marginTop: spacing.lg,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  helper: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.danger },
  counter: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  pickLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, marginTop: spacing.md, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: {
    width: 70,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceSelected: { borderColor: colors.accent },
  cta: { marginTop: spacing.xl },
});
