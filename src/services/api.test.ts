import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchArticles, fetchVideoDetail, fetchVideosList, fetchWeeks } from './api';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('api static snapshot mode', () => {
  it('serves weeks from local snapshot without network', async () => {
    vi.stubGlobal('__DEMO_STATIC_MODE__', 'true');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const res = await fetchWeeks();

    expect(res.total).toBeGreaterThan(0);
    expect(res.weeks[0]).toHaveProperty('week');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('filters articles by week and cluster in static mode', async () => {
    vi.stubGlobal('__DEMO_STATIC_MODE__', 'true');

    const weekOnly = await fetchArticles({ week: 2 });
    expect(weekOnly.articles.every(article => article.week_number === 2)).toBe(true);

    const byCluster = await fetchArticles({ cluster_id: 8, week: 2 });
    expect(byCluster.articles.every(article => article.cluster_id === 8)).toBe(true);
  });

  it('supports cursor pagination for static videos', async () => {
    vi.stubGlobal('__DEMO_STATIC_MODE__', 'true');

    const firstPage = await fetchVideosList(2);
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.next_cursor).toBeTruthy();

    const secondPage = await fetchVideosList(2, firstPage.next_cursor ?? undefined);
    expect(secondPage.items.length).toBeGreaterThan(0);
  });

  it('returns video detail by id in static mode', async () => {
    vi.stubGlobal('__DEMO_STATIC_MODE__', 'true');

    const list = await fetchVideosList(1);
    const firstVideo = list.items[0];
    expect(firstVideo).toBeDefined();
    if (!firstVideo) return;
    const detail = await fetchVideoDetail(firstVideo.video_id);

    expect(detail.video_id).toBe(firstVideo.video_id);
    expect(typeof detail.transcript).toBe('string');
  });
});

describe('api live mode', () => {
  it('uses network fetch when static mode is disabled', async () => {
    vi.stubGlobal('__DEMO_STATIC_MODE__', 'false');
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ weeks: [], total: 0 }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchWeeks();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
