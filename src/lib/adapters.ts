import { weekToDateRange } from './weekUtils';
import type {
  BackendWeeksResponse,
  BackendNarrativeListItem,
  BackendNarrativeDetail,
  BackendNarrativeClaims,
  BackendTrendListItem,
  BackendTrendDetail,
  BackendVideoListResponse,
  BackendVideoDetailItem,
  BackendArticleListItem,
  BackendWeekNarrativeItem,
} from '../services/api';
import type { WeekData, Narrative, Claim, Trend, TrendAlert, CreatorRisk, Video, VideoDetailData } from '../types';

// ---- Helpers ----

export function formatWeekName(week: string): string {
  const match = week.match(/^week(\d+)$/i);
  return match ? `Week ${match[1]}` : week;
}

export function parseWeekNumber(weekId: string): number | undefined {
  const m = weekId.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : undefined;
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getInitials(name: string): string {
  return name
    .split(/[\s_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

function normalizeRiskLevel(level: string): 'HIGH' | 'MED' | 'LOW' {
  const upper = level.toUpperCase();
  if (upper === 'HIGH') return 'HIGH';
  if (upper === 'MEDIUM' || upper === 'MED') return 'MED';
  return 'LOW';
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

// ---- Weeks ----

export function adaptWeeks(res: BackendWeeksResponse): WeekData[] {
  return res.weeks.map(w => {
    const dateRange = weekToDateRange(w.week);
    return {
      id: w.week,
      weekName: formatWeekName(w.week),
      dateRange,
      totalViews: w.total_views,
      summary: {
        dateRange,
        headline: `${w.breaking_count} Breaking Stories | ${capitalize(w.dominant_sentiment)} Sentiment`,
        content: `${w.total_videos} videos analyzed across ${w.active_clusters} active clusters this week.`,
      },
      narratives: [],
    };
  });
}

// ---- Narratives (list) ----

export function adaptNarrativesList(
  items: BackendNarrativeListItem[],
  weekId: string,
  articlesByCluster?: Map<number, BackendArticleListItem>,
): Narrative[] {
  return items.map((item, index) => {
    const article = articlesByCluster?.get(item.cluster_id);
    return {
      id: item.cluster_id.toString(),
      weekId,
      category: item.category,
      headline: article?.title ?? item.narrative_headline ?? item.label,
      subheadline: item.label,
      overview: article?.overview,
      articleId: article?.article_id,
      summary: article?.overview
        ? truncate(article.overview, 200)
        : item.top_topics.join(' · '),
      fullText: item.top_topics.length ? [item.top_topics.join(' · ')] : [],
      pageNumber: index + 1,
      claims: [],
      trendIds: [item.cluster_id.toString()],
    };
  });
}

// ---- Narratives (week-specific) ----

export function adaptWeekNarrativesList(
  items: BackendWeekNarrativeItem[],
  weekId: string,
  articlesByCluster?: Map<number, BackendArticleListItem>,
): Narrative[] {
  return items.map((item, index) => {
    const article = articlesByCluster?.get(item.cluster_id);
    const headline = article?.title ?? item.narrative_headline ?? item.cluster_label;
    const summary = article?.overview
      ? truncate(article.overview, 200)
      : item.narrative_summary ?? item.week_overview ?? item.top_topics.join(' · ');
    return {
      id: item.cluster_id.toString(),
      weekId,
      category: '',
      headline,
      subheadline: item.cluster_label,
      overview: article?.overview ?? item.week_overview ?? undefined,
      articleId: article?.article_id,
      summary,
      fullText: item.top_claims.length ? item.top_claims : item.top_topics,
      pageNumber: index + 1,
      claims: [],
      trendIds: [item.cluster_id.toString()],
      viewCount: item.view_count,
    };
  });
}

// ---- Narrative (detail) ----

export function adaptNarrativeDetail(
  detail: BackendNarrativeDetail,
  claims: BackendNarrativeClaims,
  weekId: string,
): Narrative {
  const fullText: string[] = [];
  if (detail.narrative_summary) fullText.push(detail.narrative_summary);
  if (detail.top_claims?.length) fullText.push(...detail.top_claims);
  if (fullText.length === 0) fullText.push(detail.label);

  return {
    id: detail.cluster_id.toString(),
    weekId,
    category: detail.category,
    headline: detail.narrative_headline ?? detail.label,
    subheadline: detail.label,
    summary: detail.narrative_summary ?? detail.top_topics.join(' · '),
    fullText,
    pageNumber: 1,
    claims: adaptClaims(claims, detail.cluster_id.toString()),
    trendIds: [detail.cluster_id.toString()],
  };
}

// ---- Claims ----

export function adaptClaims(res: BackendNarrativeClaims, narrativeId: string): Claim[] {
  const claims: Claim[] = [];
  const c = res.claims;

  c.consensus.forEach((item, i) => {
    const name = item.channel || item.sources[0] || 'Unknown';
    claims.push({
      id: `${narrativeId}-con-${i}`,
      claimType: 'consensus',
      creatorName: name,
      creatorInitials: getInitials(name),
      riskScore: item.risk_score,
      extractedClaim: item.claim,
      originalQuote: item.transcript_excerpt,
      videoUrl: item.video_ids[0] ? `https://www.youtube.com/watch?v=${item.video_ids[0]}` : '#',
      videoId: item.video_ids[0] || null,
    });
  });

  c.debated.forEach((item, i) => {
    const name = item.channel || 'Multiple Sources';
    const quote = (
      item.perspectives[0]?.transcript_excerpt ||
      item.perspectives[0]?.text ||
      item.perspectives[0]?.framing ||
      ''
    );
    const videoId = item.perspectives[0]?.video_id || null;
    claims.push({
      id: `${narrativeId}-deb-${i}`,
      claimType: 'debated',
      creatorName: name,
      creatorInitials: getInitials(name),
      riskScore: item.risk_score,
      extractedClaim: item.claim,
      originalQuote: quote,
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#',
      videoId,
    });
  });

  c.unique.forEach((item, i) => {
    claims.push({
      id: `${narrativeId}-unq-${i}`,
      claimType: 'unique',
      creatorName: item.channel,
      creatorInitials: getInitials(item.channel),
      riskScore: item.risk_score,
      extractedClaim: item.claim,
      originalQuote: item.transcript_excerpt,
      videoUrl: item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : '#',
      videoId: item.video_id || null,
    });
  });

  return claims;
}

// ---- Videos ----

export function adaptVideoList(res: BackendVideoListResponse): Video[] {
  return res.items.map(item => ({
    id: item.video_id,
    channel: item.channel,
    title: item.title,
    publishedAt: item.published_at,
    viewCount: item.view_count,
    likeCount: item.like_count,
    commentCount: item.comment_count,
    thumbnailUrl: item.thumbnail_url || '',
    sentiment: item.sentiment || 'neutral',
    clusterLabel: item.cluster_label || 'Uncategorized',
  }));
}

export function adaptVideoDetail(item: BackendVideoDetailItem): VideoDetailData {
  return {
    ...adaptVideoList({ items: [item], total_returned: 1 })[0],
    likeCount: item.like_count,
    commentCount: item.comment_count,
    description: item.description,
    transcript: item.transcript,
    topComments: item.top_comments || [],
    keyClaims: item.key_claims || [],
    topics: item.topics || [],
  };
}

// ---- Trends (list) ----

/**
 * The list endpoint does NOT include week_data, so we cannot build real
 * time-series sparklines here. We store a sentinel [{ date:'loading', value:0 }]
 * so the MiniGraph renders nothing meaningful until App.tsx replaces it with
 * real data fetched in parallel via fetchTrendDetail.
 *
 * App.tsx should call enrichTrendsWithDetail() after adaptTrendsList() to
 * backfill real engagementData.
 */
export function adaptTrendsList(items: BackendTrendListItem[]): Trend[] {
  return items.map(item => ({
    id: item.cluster_id.toString(),
    name: item.narrative_headline ?? item.label,
    description: item.narrative_summary ?? item.top_topics.join(' · '),
    overallSentiment: capitalize(item.sentiment_label),
    recentSentiment: capitalize(item.recent_sentiment_label),
    totalEngagement: item.heat_score,
    // Placeholder — will be replaced by real week_data once details load
    engagementData: [{ date: 'W1', value: 0 }, { date: 'now', value: item.heat_score }],
    detailedAnalysis: [],
    barChartData: { '3 Weeks': [], 'All Weeks': [] },
    creatorRisks: [],
    weekHeadlines: {},
  }));
}

// ---- Trend (detail) ----

/**
 * Adapts a full trend detail response into a Trend object with real
 * per-week view_count data for both the sparkline and the bar chart.
 *
 * Key fixes:
 *  - engagementData uses view_count (not heat_score placeholder)
 *  - barChart uses view_count (not video_count which produces near-flat bars)
 *  - barChart30 = last 4 weeks for a meaningful "30 day" window
 */
export function adaptTrendDetail(detail: BackendTrendDetail): Trend {
  const weekData = detail.week_data ?? [];

  // Real sparkline data: view_count per week, ordered chronologically
  const engagementData = weekData.map(w => ({
    date: formatWeekName(w.week),
    value: w.view_count,
  }));

  const safeEngagementData = engagementData.length >= 2
    ? engagementData
    : [{ date: 'start', value: 0 }, { date: 'now', value: detail.heat_score }];

  // Bar chart: view_count gives proportional, audience-scale bars
  const barChartFull = weekData.map(w => ({
    label: formatWeekName(w.week),
    value: w.view_count,
  }));
  const barChart3Weeks = barChartFull.slice(-3);
  const barChartAllWeeks = barChartFull;

  const creatorRisks: CreatorRisk[] = (detail.creator_risk ?? []).map(c => ({
    channelId: c.name,
    score: c.riskScore,
    riskLevel: normalizeRiskLevel(c.riskLevel),
  }));

  const weekHeadlines: Record<string, string> = {};
  for (const w of weekData) {
    if (w.narrative_headline) weekHeadlines[w.week] = w.narrative_headline;
  }

  return {
    id: detail.cluster_id.toString(),
    name: detail.narrative_headline ?? detail.label,
    description: detail.narrative_summary ?? detail.top_topics.join(' · '),
    overallSentiment: capitalize(detail.sentiment_label),
    recentSentiment: capitalize(detail.recent_sentiment_label),
    totalEngagement: detail.heat_score,
    engagementData: safeEngagementData,
    detailedAnalysis: detail.top_claims ?? detail.top_topics ?? [],
    barChartData: {
      '3 Weeks': barChart3Weeks.length ? barChart3Weeks : barChartAllWeeks,
      'All Weeks': barChartAllWeeks.length ? barChartAllWeeks : [{ label: 'N/A', value: 0 }],
    },
    creatorRisks,
    weekHeadlines,
  };
}

// ---- Trend Alerts (generated) ----

export function generateTrendAlerts(items: BackendTrendListItem[]): TrendAlert[] {
  return items
    .filter(t => t.heat_score > 50 || t.breaking_count > 10 || t.sentiment_divergence)
    .slice(0, 3)
    .map(t => ({
      id: `alert-${t.cluster_id}`,
      type: t.sentiment_divergence ? 'SHIFT' : t.breaking_count > 15 ? 'WARNING' : 'NEW',
      headline: t.label,
      description: `${t.breaking_count} breaking stories · Heat score: ${t.heat_score.toFixed(0)}`,
    }));
}
