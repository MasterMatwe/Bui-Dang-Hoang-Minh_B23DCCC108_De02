export function formatMoney(value: number): string {
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ`;
}

export function formatHour(hour: number): string {
  const minutes = Math.round(hour * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(
    minutes % 60,
  ).padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;
}

export function dateSortKey(date: string): string {
  return date.split('/').reverse().join('');
}
