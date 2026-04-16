import { describe, it, expect } from 'vitest';
import { weekToDateRange, formatViews, formatCount, WEEK_1_START } from './weekUtils';

describe('weekToDateRange', () => {
  it('returns empty string for unrecognized formats', () => {
    expect(weekToDateRange('')).toBe('');
    expect(weekToDateRange('week')).toBe('');
    expect(weekToDateRange('2026-w1')).toBe('');
  });

  it('formats week1 as a 7-day range starting on WEEK_1_START', () => {
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(WEEK_1_START.getTime() + 6 * 24 * 60 * 60 * 1000);
    const result = weekToDateRange('week1');
    expect(result).toContain(fmt(WEEK_1_START));
    expect(result).toContain(fmt(end));
    expect(result).toContain(String(end.getFullYear()));
  });

  it('week2 starts exactly 7 days after week1', () => {
    const w2Start = new Date(WEEK_1_START.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    expect(weekToDateRange('week2')).toContain(fmt(w2Start));
    expect(weekToDateRange('week1')).not.toContain(fmt(w2Start));
  });

  it('matches format: "Mon D – Mon D, YYYY"', () => {
    expect(weekToDateRange('week1')).toMatch(/^[A-Z][a-z]{2} \d+ – [A-Z][a-z]{2} \d+, \d{4}$/);
  });
});

describe('formatViews', () => {
  it('formats millions with one decimal place', () => {
    expect(formatViews(2_737_594)).toBe('2.7M views');
  });

  it('formats thousands as rounded K', () => {
    expect(formatViews(45_000)).toBe('45K views');
  });

  it('returns plain number below 1000', () => {
    expect(formatViews(500)).toBe('500 views');
  });
});

describe('formatCount', () => {
  it('formats millions with one decimal place and no unit label', () => {
    expect(formatCount(1_500_000)).toBe('1.5M');
  });

  it('formats thousands as rounded K with no unit label', () => {
    expect(formatCount(45_000)).toBe('45K');
  });

  it('returns plain number below 1000', () => {
    expect(formatCount(500)).toBe('500');
  });

  it('handles exactly 1000 as 1K', () => {
    expect(formatCount(1_000)).toBe('1K');
  });

  it('handles exactly 1000000 as 1.0M', () => {
    expect(formatCount(1_000_000)).toBe('1.0M');
  });

  it('handles 0', () => {
    expect(formatCount(0)).toBe('0');
  });
});
