import { createSeed } from '../src/data/seed';
import {
  addBooking,
  cancelBooking,
  deleteField,
  saveField,
} from '../src/data/operations';
import { findConflict } from '../src/utils/booking';
import {
  isValidDate,
  parseNumber,
  validateBooking,
  validateField,
} from '../src/utils/validation';
import { formatMoney } from '../src/utils/format';
import type { BookingDraft, BookingInput, FieldDraft } from '../src/types';

const fieldDraft: FieldDraft = {
  name: 'Sân mới',
  type: '5 người',
  status: 'Hoạt động',
  pricePerHour: '300000',
};
const bookingDraft: BookingDraft = {
  fieldId: 'field-a1',
  customerName: 'Khách mới',
  phone: '0901234567',
  date: '28/10/2026',
  startHour: '17',
  hours: '2',
};
const candidate: BookingInput = { ...bookingDraft, startHour: 17, hours: 2 };

describe('Ngày và số nhập', () => {
  test.each(['29/02/2024', '29/02/2000', '31/12/2026', '01/01/2026'])(
    'ngày hợp lệ %s',
    date => expect(isValidDate(date)).toBe(true),
  );
  test.each([
    '29/02/2025',
    '29/02/1900',
    '31/02/2026',
    '31/04/2026',
    '00/01/2026',
    '01/13/2026',
    '1/01/2026',
    '2026-10-28',
    '01/01/0000',
  ])('ngày sai %s', date => expect(isValidDate(date)).toBe(false));
  test.each(['300abc', '', ' ', 'Infinity', '1e4', '-1', '1.2.3'])(
    'không nhận số sai %s',
    value => expect(parseNumber(value)).toBeNaN(),
  );
  test('định dạng tiền đúng mẫu đề', () =>
    expect(formatMoney(300000)).toBe('300.000 đ'));
});

describe('Thêm và sửa sân', () => {
  test('bắt tên rỗng, trùng không phân biệt hoa thường và giá sai', () => {
    const data = createSeed();
    expect(
      validateField({ ...fieldDraft, name: ' ' }, data.fields).name,
    ).toBeTruthy();
    expect(
      validateField({ ...fieldDraft, name: ' sân a1 ' }, data.fields).name,
    ).toBeTruthy();
    for (const pricePerHour of ['0', '-2', 'NaN', '300abc']) {
      expect(
        validateField({ ...fieldDraft, pricePerHour }, data.fields)
          .pricePerHour,
      ).toBeTruthy();
    }
  });
  test('sửa chính sân giữ id và tên không báo trùng', () => {
    const data = createSeed();
    const field = data.fields[0];
    const next = saveField(data, { ...field, pricePerHour: 420000 }, field.id);
    expect(next.fields).toHaveLength(4);
    expect(next.fields[0]).toEqual({ ...field, pricePerHour: 420000 });
    expect(data.fields[0].pricePerHour).toBe(300000);
  });
  test('thêm tự sinh id và loại khoảng trắng tên', () => {
    const next = saveField(createSeed(), {
      ...fieldDraft,
      name: ' Sân C1 ',
      pricePerHour: 350000,
    });
    expect(next.fields).toHaveLength(5);
    expect(next.fields[4].name).toBe('Sân C1');
    expect(new Set(next.fields.map(field => field.id)).size).toBe(5);
  });
  test('chặn xoá sân có lịch; cho xoá sân không có lịch', () => {
    const data = createSeed();
    expect(() => deleteField(data, 'field-a1')).toThrow('đang có lượt đặt');
    expect(deleteField(data, 'field-a2').fields).toHaveLength(3);
  });
  test('sửa sang bảo trì giữ lịch cũ', () => {
    const data = createSeed();
    expect(
      saveField(data, { ...data.fields[0], status: 'Bảo trì' }, 'field-a1')
        .bookings,
    ).toEqual(data.bookings);
  });
});

describe('Đặt sân và trùng lịch', () => {
  const old = { ...candidate, id: 'old' };
  test.each([
    [18, 2],
    [17, 2],
    [16, 2],
    [16, 3],
    [17.5, 1],
  ])('chặn giao nhau %s + %s', (startHour, hours) => {
    expect(findConflict({ ...candidate, startHour, hours }, [old])).toBe(old);
  });
  test.each([
    [19, 1],
    [16, 1],
    [6, 1],
    [22, 1],
  ])('cho lịch không giao %s + %s', (startHour, hours) => {
    expect(
      findConflict({ ...candidate, startHour, hours }, [old]),
    ).toBeUndefined();
  });
  test('cùng giờ khác ngày hoặc khác sân được nhận', () => {
    expect(
      findConflict({ ...candidate, date: '29/10/2026' }, [old]),
    ).toBeUndefined();
    expect(
      findConflict({ ...candidate, fieldId: 'field-b1' }, [old]),
    ).toBeUndefined();
  });
  test.each(['901234567', '1901234567', '09012345678', '09012a4567'])(
    'chặn điện thoại %s',
    phone => {
      expect(validateBooking({ ...bookingDraft, phone }).phone).toBeTruthy();
    },
  );
  test('chặn tên khách rỗng, ngày sai và khung giờ ngoài giới hạn', () => {
    expect(
      validateBooking({ ...bookingDraft, customerName: ' ' }).customerName,
    ).toBeTruthy();
    expect(
      validateBooking({ ...bookingDraft, date: '31/02/2026' }).date,
    ).toBeTruthy();
    for (const startHour of ['5', '23', 'abc']) {
      expect(
        validateBooking({ ...bookingDraft, startHour }).startHour,
      ).toBeTruthy();
    }
    for (const hours of ['0', '4', 'abc']) {
      expect(validateBooking({ ...bookingDraft, hours }).hours).toBeTruthy();
    }
    expect(
      validateBooking({ ...bookingDraft, startHour: '22', hours: '2' }).hours,
    ).toBeTruthy();
    expect(
      validateBooking({ ...bookingDraft, startHour: '22', hours: '1' }),
    ).toEqual({});
    expect(
      validateBooking({ ...bookingDraft, startHour: '17.5', hours: '1.5' }),
    ).toEqual({});
  });
  test('lớp nghiệp vụ cũng chặn bảo trì, sân mất và trùng lịch', () => {
    const data = createSeed();
    expect(() =>
      addBooking(data, { ...candidate, fieldId: 'field-b2' }),
    ).toThrow('bảo trì');
    expect(() =>
      addBooking(data, { ...candidate, fieldId: 'missing' }),
    ).toThrow('không còn tồn tại');
    expect(() => addBooking({ ...data, bookings: [old] }, candidate)).toThrow(
      'Trùng lịch',
    );
  });
  test('đặt rồi huỷ chỉ thay đổi lượt tương ứng', () => {
    const data = createSeed();
    const next = addBooking(data, { ...candidate, fieldId: 'field-a2' });
    expect(next.bookings).toHaveLength(4);
    const added = next.bookings[3];
    expect(added.phone).toBe('0901234567');
    expect(cancelBooking(next, added.id)).toEqual(data);
  });
});
