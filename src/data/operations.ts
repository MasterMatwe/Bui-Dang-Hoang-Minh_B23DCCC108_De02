import type { AppData, BookingInput, FieldInput } from '../types';
import { findConflict } from '../utils/booking';
import { formatHour } from '../utils/format';
import { validateBooking, validateField } from '../utils/validation';

let sequence = 0;
function createId(data: AppData): string {
  let id: string;
  do {
    id = `${Date.now().toString(36)}-${(++sequence).toString(36)}`;
  } while (
    data.fields.some(item => item.id === id) ||
    data.bookings.some(item => item.id === id)
  );
  return id;
}

function requireValid(errors: object) {
  const message = Object.values(errors)[0];
  if (message) {
    throw new Error(String(message));
  }
}

export function saveField(
  data: AppData,
  input: FieldInput,
  id?: string,
): AppData {
  if (id && !data.fields.some(field => field.id === id)) {
    throw new Error('Sân không còn tồn tại. Vui lòng quay lại danh sách.');
  }
  requireValid(
    validateField(
      { ...input, pricePerHour: String(input.pricePerHour) },
      data.fields,
      id,
    ),
  );
  const field = { ...input, id: id ?? createId(data), name: input.name.trim() };
  return {
    ...data,
    fields: id
      ? data.fields.map(item => (item.id === id ? field : item))
      : [...data.fields, field],
  };
}

export function deleteField(data: AppData, id: string): AppData {
  if (data.bookings.some(booking => booking.fieldId === id)) {
    throw new Error(
      'Sân đang có lượt đặt. Hãy huỷ các lượt đặt trước khi xoá sân.',
    );
  }
  return { ...data, fields: data.fields.filter(field => field.id !== id) };
}

export function addBooking(data: AppData, input: BookingInput): AppData {
  const field = data.fields.find(item => item.id === input.fieldId);
  if (!field) {
    throw new Error('Sân không còn tồn tại.');
  }
  if (field.status === 'Bảo trì') {
    throw new Error('Sân đang bảo trì, không thể nhận lượt đặt mới.');
  }
  const booking = {
    ...input,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    date: input.date.trim(),
  };
  requireValid(
    validateBooking({
      ...booking,
      startHour: String(input.startHour),
      hours: String(input.hours),
    }),
  );
  const conflict = findConflict(booking, data.bookings);
  if (conflict) {
    throw new Error(
      `Trùng lịch: sân đã được đặt ngày ${conflict.date}, ${formatHour(
        conflict.startHour,
      )}–${formatHour(
        conflict.startHour + conflict.hours,
      )}. Vui lòng chọn khung giờ khác.`,
    );
  }
  return {
    ...data,
    bookings: [...data.bookings, { ...booking, id: createId(data) }],
  };
}

export function cancelBooking(data: AppData, id: string): AppData {
  return {
    ...data,
    bookings: data.bookings.filter(booking => booking.id !== id),
  };
}
