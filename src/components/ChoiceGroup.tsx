import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme/colors';

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: Props<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {options.map(option => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={`${label}: ${option}`}
            accessibilityState={{ checked: value === option, disabled }}
            disabled={disabled}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.option,
              value === option && styles.selected,
              disabled && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                value === option && styles.selectedText,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  label: { fontSize: fontSize.small, color: colors.text, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    color: colors.secondary,
    fontSize: fontSize.small,
    fontWeight: '600',
  },
  selectedText: { color: colors.primary },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.65 },
});
