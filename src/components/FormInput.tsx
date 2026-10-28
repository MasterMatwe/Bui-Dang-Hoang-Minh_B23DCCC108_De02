import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, fontSize, spacing } from '../theme/colors';

type Props = TextInputProps & { label: string; error?: string; hint?: string };

export function FormInput({ label, error, hint, style, ...props }: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.secondary}
        accessibilityLabel={label}
        style={[
          styles.input,
          error && styles.invalid,
          props.editable === false && styles.disabled,
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  label: { fontSize: fontSize.small, color: colors.text, fontWeight: '600' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  invalid: { borderColor: colors.danger, borderWidth: 1.5 },
  disabled: { backgroundColor: colors.disabled },
  error: { fontSize: fontSize.caption, lineHeight: 18, color: colors.danger },
  hint: { fontSize: fontSize.caption, lineHeight: 18, color: colors.secondary },
});
