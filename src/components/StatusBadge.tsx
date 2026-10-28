import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme/colors';
import type { FieldStatus } from '../types';

export function StatusBadge({ status }: { status: FieldStatus }) {
  const active = status === 'Hoạt động';
  return (
    <View style={[styles.badge, active ? styles.active : styles.maintenance]}>
      <View
        style={[styles.dot, active ? styles.activeDot : styles.maintenanceDot]}
      />
      <Text
        style={[
          styles.label,
          active ? styles.activeText : styles.maintenanceText,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: fontSize.caption, fontWeight: '700' },
  active: { backgroundColor: colors.activeSoft },
  maintenance: { backgroundColor: colors.maintenanceSoft },
  activeDot: { backgroundColor: colors.active },
  maintenanceDot: { backgroundColor: colors.maintenance },
  activeText: { color: colors.active },
  maintenanceText: { color: colors.maintenance },
});
