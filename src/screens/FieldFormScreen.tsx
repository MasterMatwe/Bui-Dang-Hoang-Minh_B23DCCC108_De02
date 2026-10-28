import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  FieldDraft,
  FieldStatus,
  FieldType,
  RootStackParamList,
} from '../types';
import { errorMessage, useApp } from '../context/AppContext';
import { colors, fontSize, spacing } from '../theme/colors';
import { parseNumber, validateField } from '../utils/validation';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { ChoiceGroup } from '../components/ChoiceGroup';

export function FieldFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'FieldForm'>) {
  const { fields, saveField, isSaving } = useApp();
  const id = route.params?.fieldId;
  const existing = fields.find(field => field.id === id);
  const [draft, setDraft] = useState<FieldDraft>(() => ({
    name: existing?.name ?? '',
    pricePerHour: existing ? String(existing.pricePerHour) : '',
    type: existing?.type ?? '5 người',
    status: existing?.status ?? 'Hoạt động',
  }));
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FieldDraft, boolean>>
  >({});
  const errors = validateField(draft, fields, id);
  const change = <K extends keyof FieldDraft>(key: K, value: FieldDraft[K]) =>
    setDraft(current => ({ ...current, [key]: value }));
  const errorFor = (key: keyof FieldDraft) =>
    submitted || touched[key] ? errors[key] : undefined;
  const submit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length) {
      return;
    }
    try {
      await saveField(
        { ...draft, pricePerHour: parseNumber(draft.pricePerHour) },
        id,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Không thể lưu sân', errorMessage(error));
    }
  };
  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={96}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.eyebrow}>
            {id ? 'CẬP NHẬT THÔNG TIN' : 'MỞ RỘNG CỤM SÂN'}
          </Text>
          <Text style={styles.heading}>
            {id ? 'Chỉnh sửa sân bóng' : 'Thêm sân bóng mới'}
          </Text>
          <Text style={styles.description}>
            Thông tin rõ ràng giúp bạn quản lý sân và nhận lịch đặt chính xác.
          </Text>
          <View style={styles.form}>
            <FormInput
              label="Tên sân"
              testID="field-name"
              placeholder="Ví dụ: Sân A3"
              value={draft.name}
              onChangeText={value => change('name', value)}
              onBlur={() => setTouched(current => ({ ...current, name: true }))}
              error={errorFor('name')}
              editable={!isSaving}
              autoCapitalize="words"
            />
            <ChoiceGroup<FieldType>
              label="Loại sân"
              options={['5 người', '7 người']}
              value={draft.type}
              onChange={value => change('type', value)}
              disabled={isSaving}
            />
            <FormInput
              label="Giá thuê mỗi giờ (VNĐ)"
              testID="field-price"
              placeholder="300000"
              value={draft.pricePerHour}
              onChangeText={value => change('pricePerHour', value)}
              onBlur={() =>
                setTouched(current => ({ ...current, pricePerHour: true }))
              }
              error={errorFor('pricePerHour')}
              hint="Nhập số tiền, không dùng dấu phân cách hàng nghìn."
              keyboardType="numeric"
              editable={!isSaving}
            />
            <ChoiceGroup<FieldStatus>
              label="Trạng thái"
              options={['Hoạt động', 'Bảo trì']}
              value={draft.status}
              onChange={value => change('status', value)}
              disabled={isSaving}
            />
            <Text style={styles.note}>
              Sân bảo trì vẫn giữ lịch đã có và tạm ngừng nhận lượt đặt mới.
            </Text>
          </View>
          <Button
            title={id ? 'Lưu thay đổi' : 'Thêm sân'}
            testID="save-field"
            loading={isSaving}
            onPress={() => {
              void submit();
            }}
          />
          <Button
            title="Quay lại"
            variant="secondary"
            disabled={isSaving}
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl },
  eyebrow: {
    fontSize: fontSize.caption,
    letterSpacing: 1.5,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  heading: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.small,
    color: colors.secondary,
    lineHeight: 22,
  },
  form: { gap: spacing.xl, marginVertical: spacing.lg },
  note: { fontSize: fontSize.caption, color: colors.secondary, lineHeight: 20 },
});
