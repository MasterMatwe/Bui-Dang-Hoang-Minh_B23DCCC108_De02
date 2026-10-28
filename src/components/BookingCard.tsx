import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Booking } from '../types';
import { colors, fontSize, spacing } from '../theme/colors';
import { formatHour, formatMoney } from '../utils/format';
import { Button } from './Button';

export function BookingCard({
  booking,
  pricePerHour,
  disabled,
  onCancel,
}: {
  booking: Booking;
  pricePerHour: number;
  disabled: boolean;
  onCancel: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.date}>{booking.date}</Text>
        <Text style={styles.duration}>{booking.hours} giờ</Text>
      </View>
      <Text style={styles.time}>
        {formatHour(booking.startHour)} —{' '}
        {formatHour(booking.startHour + booking.hours)}
      </Text>
      <Text style={styles.customer}>{booking.customerName}</Text>
      <Text style={styles.phone}>{booking.phone}</Text>
      <View style={styles.bottom}>
        <Text style={styles.total}>
          {formatMoney(pricePerHour * booking.hours)}
        </Text>
        <Button
          title="Huỷ lượt đặt"
          accessibilityLabel={`Huỷ lượt đặt của ${booking.customerName}`}
          compact
          variant="danger"
          onPress={onCancel}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: { fontSize: fontSize.small, color: colors.primary, fontWeight: '700' },
  duration: { fontSize: fontSize.caption, color: colors.secondary },
  time: { fontSize: fontSize.title, color: colors.text, fontWeight: '700' },
  customer: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  phone: { fontSize: fontSize.small, color: colors.secondary },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  total: { fontSize: fontSize.body, fontWeight: '700', color: colors.primary },
});
