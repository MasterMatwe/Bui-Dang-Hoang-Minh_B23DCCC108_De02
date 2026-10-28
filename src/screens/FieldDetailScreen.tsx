import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Booking, RootStackParamList } from '../types';
import { errorMessage, useApp } from '../context/AppContext';
import { colors, fontSize, spacing } from '../theme/colors';
import { dateSortKey, formatMoney } from '../utils/format';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { BookingCard } from '../components/BookingCard';
import { BookingModal } from '../components/BookingModal';

export function FieldDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'FieldDetail'>) {
  const { fields, bookings, cancelBooking, isSaving } = useApp();
  const field = fields.find(item => item.id === route.params.fieldId);
  const [modalOpen, setModalOpen] = useState(false);
  const fieldBookings = bookings
    .filter(booking => booking.fieldId === field?.id)
    .sort(
      (a, b) =>
        dateSortKey(a.date).localeCompare(dateSortKey(b.date)) ||
        a.startHour - b.startHour,
    );
  if (!field) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Không tìm thấy sân"
          description="Sân có thể đã bị xoá. Vui lòng quay lại danh sách."
        />
        <Button title="Danh sách sân" onPress={() => navigation.popToTop()} />
      </View>
    );
  }
  const confirmCancel = (booking: Booking) => {
    Alert.alert(
      'Huỷ lượt đặt?',
      `Huỷ lịch của ${booking.customerName} ngày ${booking.date}?`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Huỷ lượt đặt',
          style: 'destructive',
          onPress: () => {
            void cancelBooking(booking.id).catch(error =>
              Alert.alert('Không thể huỷ lượt đặt', errorMessage(error)),
            );
          },
        },
      ],
    );
  };
  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={fieldBookings}
        keyExtractor={booking => booking.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.info}>
              <StatusBadge status={field.status} />
              <Text style={styles.heading}>{field.name}</Text>
              <Text style={styles.type}>Sân bóng {field.type}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {formatMoney(field.pricePerHour)}
                </Text>
                <Text style={styles.unit}>/giờ</Text>
              </View>
              <Button
                title="Sửa thông tin sân"
                variant="secondary"
                onPress={() =>
                  navigation.navigate('FieldForm', { fieldId: field.id })
                }
                disabled={isSaving}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lịch đặt sân</Text>
              <Text style={styles.count}>{fieldBookings.length} lượt đặt</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Sân chưa có lượt đặt"
            description={
              field.status === 'Bảo trì'
                ? 'Sân đang bảo trì. Chuyển sang Hoạt động để nhận lượt đặt mới.'
                : 'Nhấn Đặt sân để tạo lịch đầu tiên cho khách hàng.'
            }
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            pricePerHour={field.pricePerHour}
            disabled={isSaving}
            onCancel={() => confirmCancel(item)}
          />
        )}
      />
      <View style={styles.footer}>
        {field.status === 'Bảo trì' ? (
          <Text style={styles.maintenance}>
            Sân đang bảo trì, tạm ngừng nhận lượt đặt mới.
          </Text>
        ) : (
          <Text style={styles.footerNote}>
            Giờ đặt sân: 06:00–23:00 · Mỗi lượt 1–3 giờ
          </Text>
        )}
        <Button
          title="Đặt sân"
          testID="open-booking"
          disabled={field.status === 'Bảo trì' || isSaving}
          onPress={() => setModalOpen(true)}
        />
      </View>
      {modalOpen ? (
        <BookingModal field={field} onClose={() => setModalOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  info: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 22,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: { fontSize: 32, fontWeight: '800', color: colors.text },
  type: { fontSize: fontSize.body, color: colors.secondary },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.primary,
  },
  unit: { fontSize: fontSize.small, color: colors.secondary },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  count: { fontSize: fontSize.caption, color: colors.secondary },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  footerNote: {
    fontSize: fontSize.caption,
    color: colors.secondary,
    textAlign: 'center',
  },
  maintenance: {
    fontSize: fontSize.caption,
    color: colors.maintenance,
    textAlign: 'center',
    lineHeight: 18,
  },
});
