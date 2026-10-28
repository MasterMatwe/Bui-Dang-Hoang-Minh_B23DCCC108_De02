import type { BookingDraft, Field, FieldDraft, FormErrors } from '../types';

export const normalizeName = (name: string) =>
  name.trim().normalize('NFC').toLocaleLowerCase('vi-VN');

// Reject partial numbers such as "300abc", Infinity, and exponential notation.
export function parseNumber(value: string): number {
  const trimmed = value.trim();
  return /^\d+(?:[.,]\d+)?$/.test(trimmed)
    ? Number(trimmed.replace(',', '.'))
    : NaN;
}

export function isValidDate(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return false;
  }
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

export function validateField(
  draft: FieldDraft,
  fields: Field[],
  editingId?: string,
): FormErrors<FieldDraft> {
  const errors: FormErrors<FieldDraft> = {};
  if (!draft.name.trim()) {
    errors.name = 'Vui lòng nhập tên sân.';
  } else if (
    fields.some(
      field =>
        field.id !== editingId &&
        normalizeName(field.name) === normalizeName(draft.name),
    )
  ) {
    errors.name = 'Tên sân đã tồn tại. Vui lòng chọn tên khác.';
  }
  const price = parseNumber(draft.pricePerHour);
  if (!Number.isFinite(price) || price <= 0) {
    errors.pricePerHour = 'Giá thuê phải là số lớn hơn 0.';
  }
  if (!['5 người', '7 người'].includes(draft.type)) {
    errors.type = 'Loại sân không hợp lệ.';
  }
  if (!['Hoạt động', 'Bảo trì'].includes(draft.status)) {
    errors.status = 'Trạng thái không hợp lệ.';
  }
  return errors;
}

export function validateBooking(draft: BookingDraft): FormErrors<BookingDraft> {
  const errors: FormErrors<BookingDraft> = {};
  if (!draft.customerName.trim()) {
    errors.customerName = 'Vui lòng nhập tên khách hàng.';
  }
  if (!/^0\d{9}$/.test(draft.phone.trim())) {
    errors.phone = 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.';
  }
  if (!isValidDate(draft.date.trim())) {
    errors.date = 'Nhập ngày có thật theo định dạng dd/mm/yyyy.';
  }
  const start = parseNumber(draft.startHour);
  const hours = parseNumber(draft.hours);
  if (!Number.isFinite(start) || start < 6 || start > 22) {
    errors.startHour = 'Giờ bắt đầu phải từ 6 đến 22.';
  }
  if (!Number.isFinite(hours) || hours < 1 || hours > 3) {
    errors.hours = 'Số giờ thuê phải từ 1 đến 3.';
  } else if (Number.isFinite(start) && start + hours > 23) {
    errors.hours = 'Giờ kết thúc không được quá 23:00.';
  }
  return errors;
}
