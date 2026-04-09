import { weekToDateRange } from './weekUtils';
import type {
  BackendWeeksResponse,
  BackendNarrativeListItem,
  BackendNarrativeDetail,
  BackendNarrativeClaims,
  BackendTrendListItem,
  BackendTrendDetail,
} from '../services/api';
import type { WeekData, Narrative, Claim, Trend, TrendAlert, CreatorRisk } from '../types';

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

export function adaptNarrativesList(items: BackendNarrativeListItem[], weekId: string): Narrative[] {
  return items.map((item, index) => ({
    id: item.cluster_id.toString(),
    weekId,
    category: item.category,
    headline: item.narrative_headline || item.label,
    subheadline: item.label,
    summary: item.top_topics.join(' · '),
    fullText: [item.top_topics.join(' · ')],
    pageNumber: index + 1,
    claims: [],
    trendIds: [item.cluster_id.toString()],
  }));
}

// ---- Narrative (detail) ----

export function adaptNarrativeDetail(
  detail: BackendNarrativeDetail,
  claims: BackendNarrativeClaims,
  weekId: string
): Narrative {
  const fullText: string[] = [];
  if (detail.narrative_summary) fullText.push(detail.narrative_summary);
  if (detail.top_claims?.length) fullText.push(...detail.top_claims);
  if (fullText.length === 0) fullText.push(detail.label);

  return {
    id: detail.cluster_id.toString(),
    weekId,
    category: detail.category,
    headline: detail.narrative_headline || detail.label,
    subheadline: detail.label,
    summary: detail.narrative_summary || detail.top_topics.join(' · '),
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
      creatorName: name,
      creatorInitials: getInitials(name),
      riskScore: item.risk_score,
      extractedClaim: item.claim,
      originalQuote: item.transcript_excerpt,
      videoUrl: item.video_ids[0] ? `https://www.youtube.com/watch?v=${item.video_ids[0]}` : '#',
    });
  });

  c.debated.forEach((item, i) => {
    const name = item.channel || 'Multiple Sources';
    const quote = (item.perspectives[0]?.text || item.perspectives[0]?.framing || '');
    claims.push({
      id: `${narrativeId}-deb-${i}`,
      creatorName: name,
      creatorInitials: getInitials(name),
      riskScore: item.risk_score,
      extractedClaim: item.claim,
      originalQuote: quote,
      videoUrl: '#',
    });
  });

  c.unique.forEach((item, i) => {
    claims.push({
      id: `${narrativeId}-unq-${i}`,
      creatorName: item.channel,
      creatorInitials: getInitials(item.channel),
      riskScore: item.risk_score,
      extractedClaim: item.claim,
      originalQuote: item.transcript_excerpt,
      videoUrl: item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : '#',
    });
  });

  return claims;
}

// ---- Trends (list) ----

export function adaptTrendsList(items: BackendTrendListItem[]): Trend[] {
  return items.map(item => ({
    id: item.cluster_id.toString(),
    name: item.label,
    description: item.top_topics.join(' · '),
    overallSentiment: capitalize(item.sentiment_label),
    recentSentiment: capitalize(item.recent_sentiment_label),
    totalEngagement: item.heat_score,
    engagementData: [{ date: 'week1', value: 0 }, { date: 'now', value: item.heat_score }],
    detailedAnalysis: [],
    barChartData: { '30 Days': [], '90 Days': [] },
    creatorRisks: [],
  }));
}

// ---- Trend (detail) ----

export function adaptTrendDetail(detail: BackendTrendDetail): Trend {
  const weekData = detail.week_data ?? [];

  const engagementData = weekData.map(w => ({
    date: formatWeekName(w.week),
    value: w.view_count,
  }));

  // Fallback so MiniGraph always has at least 2 points
  const safeEngagementData = engagementData.length >= 2
    ? engagementData
    : [{ date: 'start', value: 0 }, { date: 'now', value: detail.heat_score }];

  const barChartFull = weekData.map(w => ({
    label: formatWeekName(w.week),
    value: w.video_count,
  }));
  const barChart30 = barChartFull.slice(-2);
  const barChart90 = barChartFull;

  const creatorRisks: CreatorRisk[] = (detail.creator_risk ?? []).map(c => ({
    channelId: c.name,
    score: c.riskScore,
    riskLevel: normalizeRiskLevel(c.riskLevel),
  }));

  return {
    id: detail.cluster_id.toString(),
    name: detail.label,
    description: detail.top_topics.join(' · '),
    overallSentiment: capitalize(detail.sentiment_label),
    recentSentiment: capitalize(detail.recent_sentiment_label),
    totalEngagement: detail.heat_score,
    engagementData: safeEngagementData,
    detailedAnalysis: detail.top_claims ?? detail.top_topics ?? [],
    barChartData: {
      '30 Days': barChart30.length ? barChart30 : barChartFull,
      '90 Days': barChart90.length ? barChart90 : [{ label: 'N/A', value: 0 }],
    },
    creatorRisks,
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

// ---- Helpers ----

function formatWeekName(week: string): string {
  // "week1" → "Week 1", "week12" → "Week 12"
  const match = week.match(/^week(\d+)$/i);
  return match ? `Week ${match[1]}` : week;
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
