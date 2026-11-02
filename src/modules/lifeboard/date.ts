export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function getWeekStart(date: Date): Date {
  const mondayOffset = (date.getDay() + 6) % 7;
  return shiftDays(date, -mondayOffset);
}

export function mondayIndex(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

export function monthKey(date: Date): string {
  return dateKey(date).slice(0, 7);
}

export function formatDay(date: Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }): string {
  return date.toLocaleDateString('ru-RU', opts);
}

export function getMonthDays(date: Date): Date[] {
  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: total }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1));
}
