import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSeed } from '../data/seed';
import type { AppData } from '../types';
import { isValidDate, normalizeName } from '../utils/validation';
import { findConflict } from '../utils/booking';

export const STORAGE_KEY = '@FootballFieldApp/data/v1';
type StorageAdapter = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;

// Treat disk contents as untrusted: never replace malformed data with a seed.
export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const data = value as AppData;
  if (
    data.version !== 1 ||
    !Array.isArray(data.fields) ||
    !Array.isArray(data.bookings)
  ) {
    return false;
  }
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const field of data.fields) {
    if (
      !field ||
      typeof field.id !== 'string' ||
      !field.id ||
      ids.has(field.id) ||
      typeof field.name !== 'string' ||
      !field.name.trim() ||
      names.has(normalizeName(field.name)) ||
      !['5 người', '7 người'].includes(field.type) ||
      !['Hoạt động', 'Bảo trì'].includes(field.status) ||
      typeof field.pricePerHour !== 'number' ||
      !Number.isFinite(field.pricePerHour) ||
      field.pricePerHour <= 0
    ) {
      return false;
    }
    ids.add(field.id);
    names.add(normalizeName(field.name));
  }
  const bookingIds = new Set<string>();
  for (const booking of data.bookings) {
    if (
      !booking ||
      typeof booking.id !== 'string' ||
      !booking.id ||
      bookingIds.has(booking.id) ||
      !ids.has(booking.fieldId) ||
      typeof booking.customerName !== 'string' ||
      !booking.customerName.trim() ||
      typeof booking.phone !== 'string' ||
      !/^0\d{9}$/.test(booking.phone) ||
      typeof booking.date !== 'string' ||
      !isValidDate(booking.date) ||
      typeof booking.startHour !== 'number' ||
      !Number.isFinite(booking.startHour) ||
      booking.startHour < 6 ||
      booking.startHour > 22 ||
      typeof booking.hours !== 'number' ||
      !Number.isFinite(booking.hours) ||
      booking.hours < 1 ||
      booking.hours > 3 ||
      booking.startHour + booking.hours > 23
    ) {
      return false;
    }
    bookingIds.add(booking.id);
  }
  return !data.bookings.some((booking, index) =>
    findConflict(booking, data.bookings.slice(0, index)),
  );
}

export class AppRepository {
  private snapshot: AppData | null = null;
  private busy = false;

  constructor(private storage: StorageAdapter = AsyncStorage) {}

  get data() {
    return this.snapshot;
  }

  async load(): Promise<AppData> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seed = createSeed();
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(seed));
      this.snapshot = seed;
    } else {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(
          'Dữ liệu đã lưu không đọc được. Dữ liệu cũ vẫn được giữ; hãy kiểm tra bộ nhớ và thử lại.',
        );
      }
      if (!isAppData(parsed)) {
        throw new Error(
          'Dữ liệu đã lưu không hợp lệ. Ứng dụng giữ nguyên dữ liệu để tránh mất thông tin.',
        );
      }
      this.snapshot = parsed;
    }
    return this.snapshot;
  }

  async commit(update: (current: AppData) => AppData): Promise<AppData> {
    if (this.busy) {
      throw new Error('Đang lưu dữ liệu. Vui lòng chờ một chút.');
    }
    if (!this.snapshot) {
      throw new Error('Dữ liệu chưa sẵn sàng. Vui lòng thử lại.');
    }
    this.busy = true;
    try {
      const next = update(this.snapshot);
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
      this.snapshot = next;
      return next;
    } finally {
      this.busy = false;
    }
  }
}
