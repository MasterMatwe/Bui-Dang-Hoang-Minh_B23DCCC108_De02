import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Field } from '../types';
import { colors, fontSize, spacing } from '../theme/colors';
import { formatMoney } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

type Props = {
  field: Field;
  bookingsCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
};

export function FieldCard({
  field,
  bookingsCount,
  onOpen,
  onEdit,
  onDelete,
  disabled,
}: Props) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Chi tiết ${field.name}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.top}>
          <View style={styles.nameGroup}>
            <Text style={styles.name}>{field.name}</Text>
            <Text style={styles.type}>Sân {field.type}</Text>
          </View>
          <StatusBadge status={field.status} />
        </View>
        <Text style={styles.price}>
          {formatMoney(field.pricePerHour)}
          <Text style={styles.unit}>/giờ</Text>
        </Text>
        <View style={styles.bottom}>
          <Text style={styles.note}>{bookingsCount} lượt đặt</Text>
          <Text style={styles.open}>Xem lịch sân →</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Button
          title="Sửa sân"
          accessibilityLabel={`Sửa ${field.name}`}
          variant="secondary"
          compact
          style={styles.action}
          disabled={disabled}
          onPress={onEdit}
        />
        <Button
          title="Xoá sân"
          accessibilityLabel={`Xoá ${field.name}`}
          variant="danger"
          compact
          style={styles.action}
          disabled={disabled}
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  main: { padding: spacing.lg, gap: spacing.md },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nameGroup: { flex: 1, gap: spacing.xs },
  name: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  type: { fontSize: fontSize.small, color: colors.secondary },
  price: { fontSize: fontSize.title, color: colors.primary, fontWeight: '700' },
  unit: {
    fontSize: fontSize.small,
    color: colors.secondary,
    fontWeight: '400',
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  note: { fontSize: fontSize.caption, color: colors.secondary },
  open: {
    fontSize: fontSize.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  action: { flex: 1 },
  pressed: { opacity: 0.65 },
});
