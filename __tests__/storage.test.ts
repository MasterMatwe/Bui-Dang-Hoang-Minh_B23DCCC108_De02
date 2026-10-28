import {
  AppRepository,
  isAppData,
  STORAGE_KEY,
} from '../src/storage/appStorage';
import { createSeed } from '../src/data/seed';
import {
  addBooking,
  cancelBooking,
  deleteField,
  saveField,
} from '../src/data/operations';
import type { AppData } from '../src/types';

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, next: string) => {
      value = next;
    }),
  };
}

test('chỉ seed lần đầu và không seed lại khi lưu mảng rỗng', async () => {
  const storage = memoryStorage();
  const repo = new AppRepository(storage);
  const seed = await repo.load();
  expect(seed.fields).toHaveLength(4);
  expect(seed.bookings).toHaveLength(3);
  expect(isAppData(seed)).toBe(true);
  expect(storage.setItem).toHaveBeenCalledWith(
    STORAGE_KEY,
    JSON.stringify(seed),
  );
  await repo.commit(() => ({ version: 1, fields: [], bookings: [] }));
  expect(await new AppRepository(storage).load()).toEqual({
    version: 1,
    fields: [],
    bookings: [],
  });
  expect(storage.setItem).toHaveBeenCalledTimes(2);
});
test.each([
  '{broken',
  JSON.stringify({ version: 2, fields: [], bookings: [] }),
  JSON.stringify({ ...createSeed(), fields: [] }),
])('dữ liệu sai không bị ghi đè', async raw => {
  const storage = memoryStorage(raw);
  await expect(new AppRepository(storage).load()).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
});
test('lỗi đọc không tự seed', async () => {
  const storage = memoryStorage();
  storage.getItem.mockRejectedValueOnce(new Error('Read failed'));
  await expect(new AppRepository(storage).load()).rejects.toThrow(
    'Read failed',
  );
  expect(storage.setItem).not.toHaveBeenCalled();
});
test('lỗi ghi giữ snapshot cũ; có thể thử lại', async () => {
  const storage = memoryStorage(JSON.stringify(createSeed()));
  const repo = new AppRepository(storage);
  const initial = await repo.load();
  storage.setItem.mockRejectedValueOnce(new Error('Disk full'));
  await expect(
    repo.commit(data => deleteField(data, 'field-a2')),
  ).rejects.toThrow('Disk full');
  expect(repo.data).toEqual(initial);
  await repo.commit(data => deleteField(data, 'field-a2'));
  expect(repo.data?.fields).toHaveLength(3);
});
test('chặn hai lần ghi đồng thời và giữ kết quả ghi thành công', async () => {
  const storage = memoryStorage(JSON.stringify(createSeed()));
  const repo = new AppRepository(storage);
  await repo.load();
  let release!: () => void;
  storage.setItem.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        release = resolve;
      }),
  );
  const first = repo.commit(data => deleteField(data, 'field-a2'));
  await expect(
    repo.commit(data => deleteField(data, 'field-b2')),
  ).rejects.toThrow('Đang lưu');
  release();
  await first;
  expect(repo.data?.fields.some(field => field.id === 'field-a2')).toBe(false);
  expect(repo.data?.fields.some(field => field.id === 'field-b2')).toBe(true);
});
test('chuỗi thêm/sửa/đặt/huỷ/xoá được khôi phục chính xác khi mở lại', async () => {
  const storage = memoryStorage();
  const repo = new AppRepository(storage);
  await repo.load();
  await repo.commit(data =>
    saveField(data, {
      name: 'Sân kiểm thử',
      pricePerHour: 200000,
      type: '5 người',
      status: 'Hoạt động',
    }),
  );
  const id = repo.data!.fields[4].id;
  await repo.commit(data =>
    saveField(data, { ...data.fields[4], pricePerHour: 250000 }, id),
  );
  await repo.commit(data =>
    addBooking(data, {
      fieldId: id,
      customerName: 'Khách thử',
      phone: '0901234567',
      date: '28/10/2026',
      startHour: 22,
      hours: 1,
    }),
  );
  expect(await new AppRepository(storage).load()).toEqual(repo.data);
  await repo.commit(data => cancelBooking(data, data.bookings[3].id));
  await repo.commit(data => deleteField(data, id));
  expect(await new AppRepository(storage).load()).toEqual(repo.data);
});
test('schema từ chối lịch giao nhau, id trùng và giá không hữu hạn', () => {
  const data = createSeed();
  const overlapping: AppData = {
    ...data,
    bookings: [
      ...data.bookings,
      { ...data.bookings[0], id: 'new', startHour: 18 },
    ],
  };
  expect(isAppData(overlapping)).toBe(false);
  expect(isAppData({ ...data, fields: [...data.fields, data.fields[0]] })).toBe(
    false,
  );
  expect(
    isAppData({
      ...data,
      fields: [{ ...data.fields[0], pricePerHour: Infinity }],
    }),
  ).toBe(false);
});
