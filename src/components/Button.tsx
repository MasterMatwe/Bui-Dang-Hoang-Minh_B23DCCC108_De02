import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, fontSize, spacing } from '../theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  compact,
  style,
  testID,
  accessibilityLabel,
}: Props) {
  const blocked = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{
        disabled: Boolean(blocked),
        busy: Boolean(loading),
      }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        compact && styles.compact,
        style,
        pressed && styles.pressed,
        blocked && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.disabledText} />
      ) : null}
      <Text
        style={[
          styles.label,
          variant !== 'primary' && styles[`${variant}Label`],
          blocked && styles.disabledLabel,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  danger: { backgroundColor: colors.dangerSoft },
  compact: { minHeight: 44, paddingVertical: spacing.sm },
  label: {
    fontSize: fontSize.small,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  secondaryLabel: { color: colors.primary },
  dangerLabel: { color: colors.danger },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { backgroundColor: colors.disabled },
  disabledLabel: { color: colors.disabledText },
});
