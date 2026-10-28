import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BookingDraft, Field } from '../types';
import { errorMessage, useApp } from '../context/AppContext';
import { colors, fontSize, spacing } from '../theme/colors';
import { formatDate, formatHour, formatMoney } from '../utils/format';
import { parseNumber, validateBooking } from '../utils/validation';
import { findConflict } from '../utils/booking';
import { Button } from './Button';
import { FormInput } from './FormInput';
import { ChoiceGroup } from './ChoiceGroup';

export function BookingModal({
  field,
  onClose,
}: {
  field: Field;
  onClose: () => void;
}) {
  const { bookings, addBooking, isSaving } = useApp();
  const [draft, setDraft] = useState<BookingDraft>({
    fieldId: field.id,
    customerName: '',
    phone: '',
    date: formatDate(new Date()),
    startHour: '',
    hours: '1',
  });
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof BookingDraft, boolean>>
  >({});
  const [conflictError, setConflictError] = useState('');
  const errors = validateBooking(draft);
  const hours = parseNumber(draft.hours);
  const start = parseNumber(draft.startHour);
  const validHours = Number.isFinite(hours) && hours >= 1 && hours <= 3;
  const change = (key: keyof BookingDraft, value: string) => {
    setDraft(current => ({ ...current, [key]: value }));
    setConflictError('');
  };
  const errorFor = (key: keyof BookingDraft) =>
    submitted || touched[key] ? errors[key] : undefined;
  const blur = (key: keyof BookingDraft) => () =>
    setTouched(current => ({ ...current, [key]: true }));
  const close = () => {
    if (!isSaving) {
      onClose();
    }
  };
  const submit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length) {
      return;
    }
    const input = {
      ...draft,
      date: draft.date.trim(),
      startHour: start,
      hours,
    };
    const conflict = findConflict(input, bookings);
    if (conflict) {
      setConflictError(
        `Sân đã được đặt từ ${formatHour(conflict.startHour)} đến ${formatHour(
          conflict.startHour + conflict.hours,
        )} ngày ${conflict.date}. Vui lòng chọn khung giờ khác.`,
      );
      return;
    }
    try {
      await addBooking(input);
      onClose();
    } catch (error) {
      Alert.alert('Không thể đặt sân', errorMessage(error));
    }
  };
  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <SafeAreaView
          style={styles.sheet}
          edges={['top', 'bottom', 'left', 'right']}
        >
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>LƯỢT ĐẶT MỚI</Text>
                <Text style={styles.title}>Đặt {field.name}</Text>
              </View>
              <Button
                title="Đóng"
                variant="secondary"
                compact
                onPress={close}
                disabled={isSaving}
              />
            </View>
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.subtitle}>
                Sân {field.type} · {formatMoney(field.pricePerHour)}/giờ
              </Text>
              <FormInput
                label="Tên khách hàng"
                testID="booking-customer"
                placeholder="Họ và tên khách"
                value={draft.customerName}
                onChangeText={value => change('customerName', value)}
                onBlur={blur('customerName')}
                error={errorFor('customerName')}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <FormInput
                label="Số điện thoại"
                testID="booking-phone"
                placeholder="0901234567"
                value={draft.phone}
                onChangeText={value => change('phone', value)}
                onBlur={blur('phone')}
                error={errorFor('phone')}
                keyboardType="phone-pad"
                editable={!isSaving}
              />
              <FormInput
                label="Ngày đặt sân"
                testID="booking-date"
                placeholder="dd/mm/yyyy"
                value={draft.date}
                onChangeText={value => change('date', value)}
                onBlur={blur('date')}
                error={errorFor('date')}
                hint="Định dạng dd/mm/yyyy. Ví dụ: 28/10/2026."
                keyboardType="numbers-and-punctuation"
                editable={!isSaving}
              />
              <FormInput
                label="Giờ bắt đầu (6–22)"
                testID="booking-start"
                placeholder="Ví dụ: 17"
                value={draft.startHour}
                onChangeText={value => change('startHour', value)}
                onBlur={blur('startHour')}
                error={errorFor('startHour')}
                hint="Có thể nhập 17.5 để đặt lúc 17:30."
                keyboardType="decimal-pad"
                editable={!isSaving}
              />
              <ChoiceGroup
                label="Chọn nhanh số giờ"
                options={['1', '2', '3']}
                value={draft.hours}
                onChange={value => change('hours', value)}
                disabled={isSaving}
              />
              <FormInput
                label="Số giờ thuê (1–3)"
                testID="booking-hours"
                value={draft.hours}
                onChangeText={value => change('hours', value)}
                onBlur={blur('hours')}
                error={errorFor('hours')}
                keyboardType="decimal-pad"
                editable={!isSaving}
              />
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>THÀNH TIỀN</Text>
                <Text
                  testID="booking-total"
                  accessibilityLiveRegion="polite"
                  style={styles.total}
                >
                  {validHours ? formatMoney(field.pricePerHour * hours) : '—'}
                </Text>
                <Text style={styles.totalHint}>
                  {validHours
                    ? `${formatMoney(field.pricePerHour)} × ${hours} giờ`
                    : 'Nhập số giờ hợp lệ để tính tiền'}
                  {validHours &&
                  Number.isFinite(start) &&
                  !errors.startHour &&
                  !errors.hours
                    ? ` · kết thúc ${formatHour(start + hours)}`
                    : ''}
                </Text>
              </View>
              {conflictError ? (
                <Text accessibilityLiveRegion="polite" style={styles.error}>
                  {conflictError}
                </Text>
              ) : null}
              <Button
                title="Xác nhận đặt sân"
                testID="confirm-booking"
                loading={isSaving}
                disabled={field.status === 'Bảo trì'}
                onPress={() => {
                  void submit();
                }}
              />
              <Text style={styles.footnote}>
                Lượt đặt được lưu trên thiết bị ngay khi xác nhận.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    paddingTop: spacing.xl,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  headerText: { flex: 1, gap: spacing.xs },
  eyebrow: {
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  title: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { fontSize: fontSize.small, color: colors.secondary },
  totalBox: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    gap: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.caption,
    letterSpacing: 1.3,
    fontWeight: '700',
    color: colors.primary,
  },
  total: {
    fontSize: fontSize.heading,
    color: colors.primary,
    fontWeight: '800',
  },
  totalHint: {
    fontSize: fontSize.caption,
    color: colors.secondary,
    lineHeight: 20,
  },
  error: { fontSize: fontSize.small, color: colors.danger, lineHeight: 22 },
  footnote: {
    fontSize: fontSize.caption,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
