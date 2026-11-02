import { describe, expect, it } from 'vitest';
import { dateKey, getMonthDays, getWeekStart, mondayIndex, parseDate, shiftDays } from './date';

describe('lifeboard local dates', () => {
  it('uses local calendar days, not UTC dates', () => {
    const date = new Date(2026, 10, 2);
    expect(dateKey(date)).toBe('2026-11-02');
    expect(mondayIndex(date)).toBe(1);
    expect(dateKey(shiftDays(date, 13))).toBe('2026-11-15');
  });

  it('starts weeks on Monday, including Sundays', () => {
    expect(dateKey(getWeekStart(parseDate('2026-11-08')))).toBe('2026-11-02');
    expect(mondayIndex(parseDate('2026-11-08'))).toBe(7);
  });

  it('calculates month length', () => {
    expect(getMonthDays(parseDate('2026-11-01'))).toHaveLength(30);
    expect(getMonthDays(parseDate('2028-02-01'))).toHaveLength(29);
  });
});
