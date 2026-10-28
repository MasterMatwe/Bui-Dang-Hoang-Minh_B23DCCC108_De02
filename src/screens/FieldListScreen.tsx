import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Field, RootStackParamList } from '../types';
import { errorMessage, useApp } from '../context/AppContext';
import { colors, fontSize, spacing } from '../theme/colors';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { FieldCard } from '../components/FieldCard';

export function FieldListScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'FieldList'>) {
  const { fields, bookings, isSaving, deleteField } = useApp();
  const active = fields.filter(field => field.status === 'Hoạt động').length;
  const confirmDelete = (field: Field) => {
    if (bookings.some(booking => booking.fieldId === field.id)) {
      Alert.alert(
        'Không thể xoá sân',
        'Sân đang có lượt đặt. Hãy huỷ các lượt đặt trước khi xoá sân.',
      );
      return;
    }
    Alert.alert('Xoá sân?', `Bạn có chắc muốn xoá ${field.name}?`, [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Xoá sân',
        style: 'destructive',
        onPress: () => {
          void deleteField(field.id).catch(error =>
            Alert.alert('Không thể xoá sân', errorMessage(error)),
          );
        },
      },
    ]);
  };
  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <FlatList
        data={fields}
        keyExtractor={field => field.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.markText}>S</Text>
              </View>
              <View>
                <Text style={styles.brand}>SÂN NHÀ</Text>
                <Text style={styles.tagline}>Quản lý sân bóng mini</Text>
              </View>
            </View>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>SẴN SÀNG CHO TRẬN ĐẤU</Text>
              <Text style={styles.heading}>Sân bóng của bạn</Text>
              <Text style={styles.summary}>
                {active}/{fields.length} sân hoạt động
              </Text>
              <View style={styles.heroFooter}>
                <Text style={styles.heroNote}>
                  {bookings.length} lượt đặt đã ghi nhận
                </Text>
                <Text style={styles.heroSymbol}>○</Text>
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={styles.title}>Danh sách sân</Text>
                <Text style={styles.count}>{fields.length}</Text>
              </View>
              <Button
                title="+ Thêm sân"
                compact
                testID="add-field"
                onPress={() => navigation.navigate('FieldForm')}
                disabled={isSaving}
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Chưa có sân bóng"
            description="Thêm sân đầu tiên để bắt đầu quản lý và nhận lịch đặt của khách."
          />
        }
        renderItem={({ item }) => (
          <FieldCard
            field={item}
            bookingsCount={
              bookings.filter(booking => booking.fieldId === item.id).length
            }
            disabled={isSaving}
            onOpen={() =>
              navigation.navigate('FieldDetail', { fieldId: item.id })
            }
            onEdit={() =>
              navigation.navigate('FieldForm', { fieldId: item.id })
            }
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListFooterComponent={
          fields.length ? (
            <Text style={styles.footer}>
              Chọn một sân để xem và quản lý lịch đặt
            </Text>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 24, color: colors.white, fontWeight: '900' },
  brand: {
    fontSize: fontSize.body,
    letterSpacing: 3,
    color: colors.text,
    fontWeight: '800',
  },
  tagline: {
    fontSize: fontSize.caption,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  hero: {
    padding: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 24,
    gap: spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  heading: {
    fontSize: fontSize.heading,
    color: colors.white,
    fontWeight: '800',
  },
  summary: { fontSize: fontSize.body, color: colors.white, fontWeight: '500' },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.primaryBorder,
    paddingTop: spacing.md,
  },
  heroNote: { fontSize: fontSize.caption, color: colors.primaryLight },
  heroSymbol: { fontSize: 24, color: colors.primaryLight },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.title, color: colors.text, fontWeight: '700' },
  count: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  footer: {
    fontSize: fontSize.caption,
    color: colors.secondary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
});
