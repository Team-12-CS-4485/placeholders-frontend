import { describe, it, expect } from 'vitest';
import {
  adaptWeeks,
  adaptNarrativesList,
  adaptNarrativeDetail,
  adaptClaims,
  adaptTrendsList,
  adaptTrendDetail,
  generateTrendAlerts,
} from './adapters';
import type {
  BackendWeeksResponse,
  BackendNarrativeListItem,
  BackendNarrativeDetail,
  BackendNarrativeClaims,
  BackendTrendListItem,
  BackendTrendDetail,
} from '../services/api';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const WEEKS_RESPONSE: BackendWeeksResponse = {
  weeks: [
    {
      week: 'week1',
      total_videos: 37,
      total_views: 2737594,
      active_clusters: 7,
      breaking_count: 19,
      dominant_sentiment: 'negative',
    },
  ],
  total: 1,
};

const NARRATIVE_LIST_ITEM: BackendNarrativeListItem = {
  cluster_id: 9,
  label: 'Iran-Israel Energy Crisis',
  category: 'Middle East Conflict',
  narrative_headline: 'US-Israel Strikes Trigger Energy Crisis',
  top_topics: ['Middle East', 'Oil Markets'],
  video_count: 37,
  dominant_sentiment: 'negative',
};

const NARRATIVE_DETAIL: BackendNarrativeDetail = {
  cluster_id: 9,
  label: 'Iran-Israel Energy Crisis',
  category: 'Middle East Conflict',
  narrative_headline: 'US-Israel Strikes Trigger Energy Crisis',
  narrative_summary: 'Following hostilities, 32 countries released oil reserves.',
  top_topics: ['Middle East', 'Oil Markets'],
  top_claims: ['Claim one.', 'Claim two.'],
  video_count: 37,
  channel_count: 7,
  breaking_count: 29,
  dominant_sentiment: 'negative',
  channels: ['BBCNews', 'CBSNews'],
  week_data: [
    {
      week: 'week1',
      video_count: 16,
      channel_count: 5,
      view_count: 776779,
      breaking_count: 14,
      sentiment_breakdown: { neutral: 3, negative: 13 },
    },
  ],
  creator_risk: [],
  avg_clickbait_rating: null,
  thumbnail_tone_breakdown: {},
};

const CLAIMS_RESPONSE: BackendNarrativeClaims = {
  cluster_id: 9,
  claims: {
    consensus: [
      {
        claim: 'The US destroyed 16 Iranian mine-laying boats.',
        channel: 'BBCNews',
        sources: ['BBCNews', 'CBSNews'],
        source_count: 2,
        video_ids: ['abc123'],
        transcript_excerpt: 'The US military reported destroying 16 boats.',
        risk_score: 0.25,
      },
    ],
    debated: [
      {
        claim: 'Airspace disruptions forced longer airline routes.',
        channel: 'FoxNews',
        perspectives: [{ text: 'Airlines are adding hours to routes.' }],
        source_count: 2,
        framing_divergence: 0.54,
        risk_score: 0.54,
      },
    ],
    unique: [
      {
        claim: 'US struck PMF forces south of Baghdad.',
        channel: 'aljazeeraenglish',
        video_id: 'ghi789',
        video_title: 'US Airstrikes Baghdad',
        transcript_excerpt: 'US airstrikes targeted PMF positions.',
        risk_score: 0.85,
      },
    ],
  },
};

const TREND_LIST_ITEM: BackendTrendListItem = {
  cluster_id: 9,
  label: 'Iran-Israel Energy Security Crisis',
  category: 'Middle East Conflict',
  trend_type: 'dominant',
  metric_badge: 'High Impact',
  heat_score: 106.33,
  video_count: 37,
  channel_count: 7,
  view_count_total: 2732519,
  breaking_count: 29,
  sentiment_label: 'Negative',
  recent_sentiment_label: 'Negative',
  dominant_sentiment: 'negative',
  dominant_public_sentiment: 'negative',
  sentiment_divergence: false,
  top_topics: ['Middle East Conflict', 'Oil Markets'],
};

const TREND_DETAIL: BackendTrendDetail = {
  ...TREND_LIST_ITEM,
  total_likes: 5000,
  total_comments: 1200,
  engagement_index: 190.5,
  sentiment_breakdown: { negative: 32, neutral: 5 },
  public_sentiment_breakdown: { negative: 20, neutral: 10 },
  avg_public_sentiment_score: -0.6,
  channels: ['BBCNews', 'CBSNews'],
  week_data: [
    { week: 'week1', video_count: 16, channel_count: 5, view_count: 776779, breaking_count: 14, sentiment_breakdown: { negative: 13, neutral: 3 } },
    { week: 'week2', video_count: 8, channel_count: 5, view_count: 924101, breaking_count: 7, sentiment_breakdown: { negative: 8 } },
    { week: 'week3', video_count: 6, channel_count: 4, view_count: 913364, breaking_count: 4, sentiment_breakdown: { negative: 6 } },
  ],
  top_claims: ['Claim one.', 'Claim two.'],
  creator_risk: [
    { name: 'FoxNews', riskScore: 0.76, riskLevel: 'high', claimCount: 6 },
  ],
  avg_clickbait_rating: null,
  thumbnail_tone_breakdown: {},
};

// ── adaptWeeks ────────────────────────────────────────────────────────────────

describe('adaptWeeks', () => {
  it('maps week identifier to id and formatted weekName', () => {
    const result = adaptWeeks(WEEKS_RESPONSE);
    expect(result[0].id).toBe('week1');
    expect(result[0].weekName).toBe('Week 1');
  });

  it('starts with an empty narratives array', () => {
    const result = adaptWeeks(WEEKS_RESPONSE);
    expect(result[0].narratives).toEqual([]);
  });

  it('includes breaking_count in summary headline', () => {
    const result = adaptWeeks(WEEKS_RESPONSE);
    expect(result[0].summary.headline).toContain('19');
  });

  it('capitalises dominant_sentiment in summary headline', () => {
    const result = adaptWeeks(WEEKS_RESPONSE);
    expect(result[0].summary.headline).toContain('Negative');
  });

  it('returns one entry per week in the response', () => {
    const result = adaptWeeks(WEEKS_RESPONSE);
    expect(result).toHaveLength(1);
  });
});

// ── adaptNarrativesList ───────────────────────────────────────────────────────

describe('adaptNarrativesList', () => {
  it('converts cluster_id to a string id', () => {
    const result = adaptNarrativesList([NARRATIVE_LIST_ITEM], 'week1');
    expect(result[0].id).toBe('9');
  });

  it('passes weekId through unchanged', () => {
    const result = adaptNarrativesList([NARRATIVE_LIST_ITEM], 'week1');
    expect(result[0].weekId).toBe('week1');
  });

  it('sets trendIds to [cluster_id.toString()]', () => {
    const result = adaptNarrativesList([NARRATIVE_LIST_ITEM], 'week1');
    expect(result[0].trendIds).toEqual(['9']);
  });

  it('starts with an empty claims array', () => {
    const result = adaptNarrativesList([NARRATIVE_LIST_ITEM], 'week1');
    expect(result[0].claims).toEqual([]);
  });

  it('uses narrative_headline when present', () => {
    const result = adaptNarrativesList([NARRATIVE_LIST_ITEM], 'week1');
    expect(result[0].headline).toBe('US-Israel Strikes Trigger Energy Crisis');
  });

  it('falls back to label when narrative_headline is null', () => {
    const item = { ...NARRATIVE_LIST_ITEM, narrative_headline: null };
    const result = adaptNarrativesList([item], 'week1');
    expect(result[0].headline).toBe('Iran-Israel Energy Crisis');
  });

  it('assigns pageNumber starting at 1 based on index', () => {
    const result = adaptNarrativesList([NARRATIVE_LIST_ITEM, NARRATIVE_LIST_ITEM], 'week1');
    expect(result[0].pageNumber).toBe(1);
    expect(result[1].pageNumber).toBe(2);
  });
});

// ── adaptNarrativeDetail ──────────────────────────────────────────────────────

describe('adaptNarrativeDetail', () => {
  it('puts narrative_summary as the first fullText entry', () => {
    const result = adaptNarrativeDetail(NARRATIVE_DETAIL, CLAIMS_RESPONSE, 'week1');
    expect(result.fullText[0]).toBe('Following hostilities, 32 countries released oil reserves.');
  });

  it('appends each top_claim as a subsequent fullText entry', () => {
    const result = adaptNarrativeDetail(NARRATIVE_DETAIL, CLAIMS_RESPONSE, 'week1');
    expect(result.fullText[1]).toBe('Claim one.');
    expect(result.fullText[2]).toBe('Claim two.');
  });

  it('falls back to label when narrative_summary is null and top_claims is empty', () => {
    const detail = { ...NARRATIVE_DETAIL, narrative_summary: null, top_claims: [] };
    const emptyClaims: BackendNarrativeClaims = {
      cluster_id: 9,
      claims: { consensus: [], debated: [], unique: [] },
    };
    const result = adaptNarrativeDetail(detail, emptyClaims, 'week1');
    expect(result.fullText).toEqual(['Iran-Israel Energy Crisis']);
  });

  it('populates claims from the claims response', () => {
    const result = adaptNarrativeDetail(NARRATIVE_DETAIL, CLAIMS_RESPONSE, 'week1');
    expect(result.claims.length).toBeGreaterThan(0);
  });
});

// ── adaptClaims ───────────────────────────────────────────────────────────────

describe('adaptClaims', () => {
  it('flattens all three claim types into a single array', () => {
    const result = adaptClaims(CLAIMS_RESPONSE, '9');
    expect(result).toHaveLength(3);
  });

  it('maps consensus video_ids[0] to a YouTube watch URL', () => {
    const result = adaptClaims(CLAIMS_RESPONSE, '9');
    const c = result.find(r => r.id.includes('con'));
    expect(c?.videoUrl).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('uses # when consensus video_ids is empty', () => {
    const noVideo: BackendNarrativeClaims = {
      ...CLAIMS_RESPONSE,
      claims: {
        ...CLAIMS_RESPONSE.claims,
        consensus: [{ ...CLAIMS_RESPONSE.claims.consensus[0], video_ids: [] }],
      },
    };
    const result = adaptClaims(noVideo, '9');
    const c = result.find(r => r.id.includes('con'));
    expect(c?.videoUrl).toBe('#');
  });

  it('maps unique video_id to a YouTube watch URL', () => {
    const result = adaptClaims(CLAIMS_RESPONSE, '9');
    const u = result.find(r => r.id.includes('unq'));
    expect(u?.videoUrl).toBe('https://www.youtube.com/watch?v=ghi789');
  });

  it('derives creatorInitials from the first character of the creator name', () => {
    const result = adaptClaims(CLAIMS_RESPONSE, '9');
    const c = result.find(r => r.id.includes('con'));
    expect(c?.creatorInitials).toBe('B'); // BBCNews → single token → 'B'
  });

  it('passes risk_score through to the claim', () => {
    const result = adaptClaims(CLAIMS_RESPONSE, '9');
    const c = result.find(r => r.id.includes('con'));
    expect(c?.riskScore).toBe(0.25);
  });
});

// ── adaptTrendsList ───────────────────────────────────────────────────────────

describe('adaptTrendsList', () => {
  it('maps cluster_id to string id', () => {
    const result = adaptTrendsList([TREND_LIST_ITEM]);
    expect(result[0].id).toBe('9');
  });

  it('maps label to name', () => {
    const result = adaptTrendsList([TREND_LIST_ITEM]);
    expect(result[0].name).toBe('Iran-Israel Energy Security Crisis');
  });

  it('maps heat_score to totalEngagement', () => {
    const result = adaptTrendsList([TREND_LIST_ITEM]);
    expect(result[0].totalEngagement).toBe(106.33);
  });

  it('produces at least 2 engagementData points for MiniGraph', () => {
    const result = adaptTrendsList([TREND_LIST_ITEM]);
    expect(result[0].engagementData.length).toBeGreaterThanOrEqual(2);
  });

  it('initialises creatorRisks as an empty array', () => {
    const result = adaptTrendsList([TREND_LIST_ITEM]);
    expect(result[0].creatorRisks).toEqual([]);
  });
});

// ── adaptTrendDetail ──────────────────────────────────────────────────────────

describe('adaptTrendDetail', () => {
  it('maps week_data view_count to engagementData values', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.engagementData[0].value).toBe(776779);
    expect(result.engagementData[1].value).toBe(924101);
  });

  it('formats week identifiers as Week N in engagementData', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.engagementData[0].date).toBe('Week 1');
  });

  it('maps all week_data entries to barChartData 90 Days', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.barChartData['90 Days']).toHaveLength(3);
  });

  it('maps only the last 2 week_data entries to barChartData 30 Days', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.barChartData['30 Days']).toHaveLength(2);
    expect(result.barChartData['30 Days'][0].label).toBe('Week 2');
  });

  it('maps top_claims to detailedAnalysis', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.detailedAnalysis).toEqual(['Claim one.', 'Claim two.']);
  });

  it('uppercases creator riskLevel "high" to "HIGH"', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.creatorRisks[0].riskLevel).toBe('HIGH');
  });

  it('normalises "medium" riskLevel to "MED"', () => {
    const detail: BackendTrendDetail = {
      ...TREND_DETAIL,
      creator_risk: [{ name: 'TestChannel', riskScore: 0.5, riskLevel: 'medium', claimCount: 3 }],
    };
    const result = adaptTrendDetail(detail);
    expect(result.creatorRisks[0].riskLevel).toBe('MED');
  });

  it('maps creator_risk name to channelId', () => {
    const result = adaptTrendDetail(TREND_DETAIL);
    expect(result.creatorRisks[0].channelId).toBe('FoxNews');
  });
});

// ── generateTrendAlerts ───────────────────────────────────────────────────────

describe('generateTrendAlerts', () => {
  it('assigns SHIFT type when sentiment_divergence is true', () => {
    const item: BackendTrendListItem = { ...TREND_LIST_ITEM, sentiment_divergence: true, breaking_count: 5 };
    const result = generateTrendAlerts([item]);
    expect(result[0].type).toBe('SHIFT');
  });

  it('assigns WARNING type when breaking_count > 15 and no divergence', () => {
    const item: BackendTrendListItem = { ...TREND_LIST_ITEM, sentiment_divergence: false, breaking_count: 29 };
    const result = generateTrendAlerts([item]);
    expect(result[0].type).toBe('WARNING');
  });

  it('assigns NEW type for qualifying trends with low breaking count', () => {
    const item: BackendTrendListItem = { ...TREND_LIST_ITEM, sentiment_divergence: false, breaking_count: 11, heat_score: 55 };
    const result = generateTrendAlerts([item]);
    expect(result[0].type).toBe('NEW');
  });

  it('caps results at 3 alerts', () => {
    const items: BackendTrendListItem[] = Array.from({ length: 10 }, (_, i) => ({
      ...TREND_LIST_ITEM,
      cluster_id: i,
      heat_score: 60,
    }));
    const result = generateTrendAlerts(items);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('excludes trends that do not meet any alert threshold', () => {
    const item: BackendTrendListItem = {
      ...TREND_LIST_ITEM,
      heat_score: 30,
      breaking_count: 5,
      sentiment_divergence: false,
    };
    const result = generateTrendAlerts([item]);
    expect(result).toHaveLength(0);
  });
});
