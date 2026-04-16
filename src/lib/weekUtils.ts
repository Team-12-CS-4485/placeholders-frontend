/**
 * The Monday that Week 1 of the dataset begins.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  UPDATE THIS when you know the actual recording epoch.  │
 * └─────────────────────────────────────────────────────────┘
 */
export const WEEK_1_START = new Date('2026-03-02');

/**
 * Returns the weekId (e.g. "week7") for the current calendar week
 * based on WEEK_1_START.
 */
export function getCurrentWeekId(): string {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - WEEK_1_START.getTime();
  const weekNum = Math.max(1, Math.floor(elapsed / msPerWeek) + 1);
  return `week${weekNum}`;
}

export function weekToDateRange(weekId: string): string {
  const match = weekId.match(/^week(\d+)$/i);
  if (!match) return '';

  const n = parseInt(match[1], 10);
  const startMs = WEEK_1_START.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000;
  const endMs = startMs + 6 * 24 * 60 * 60 * 1000;
  const start = new Date(startMs);
  const end = new Date(endMs);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K views`;
  return `${n} views`;
}

/** Format a count with K/M suffixes but no unit label — for likes, comments, views in stat displays. */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}
