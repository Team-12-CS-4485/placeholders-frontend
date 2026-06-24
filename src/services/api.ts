import {
  STATIC_ARTICLE_DETAILS,
  STATIC_ARTICLES,
  STATIC_NARRATIVE_CLAIMS,
  STATIC_NARRATIVE_DETAILS,
  STATIC_NARRATIVE_LIST_BY_WEEK,
  STATIC_SNAPSHOT_DATE,
  STATIC_TREND_DETAILS,
  STATIC_TRENDS,
  STATIC_VIDEO_DETAILS,
  STATIC_VIDEOS,
  STATIC_WEEK_NARRATIVES,
  STATIC_WEEKS,
} from '../data/staticSnapshot';

const BASE = 'https://newsify-656172157874.us-south1.run.app';
//Stupid comment to trigger a commit
// const BASE = 'http://localhost:8000';

function getEnvValue(name: string): string {
  const env = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  const value = env?.[name];
  return typeof value === 'string' ? value : '';
}

function getGlobalOverrideValue(): string {
  const globalValue = (globalThis as { __DEMO_STATIC_MODE__?: unknown }).__DEMO_STATIC_MODE__;
  if (typeof globalValue === 'boolean') return String(globalValue);
  if (typeof globalValue === 'string') return globalValue;
  return '';
}

export function isDemoStaticMode(): boolean {
  const value =
    getGlobalOverrideValue() || getEnvValue('VITE_DEMO_STATIC_MODE') || getEnvValue('DEMO_STATIC_MODE');
  return value.toLowerCase() === 'true';
}

export const DEMO_SNAPSHOT_DATE = STATIC_SNAPSHOT_DATE;

function emptyNarrativeClaims(clusterId: number): BackendNarrativeClaims {
  return {
    cluster_id: clusterId,
    claims: {
      consensus: [],
      debated: [],
      unique: [],
    },
  };
}

function staticGet<T>(path: string): T {
  const url = new URL(path, 'https://demo.local');
  const { pathname, searchParams } = url;
  const pathParts = pathname.split('/').filter(Boolean);

  if (pathname === '/api/weeks') {
    return STATIC_WEEKS as T;
  }

  if (pathParts[0] === 'api' && pathParts[1] === 'weeks' && pathParts[2]) {
    const week = pathParts[2];
    const narratives = STATIC_WEEK_NARRATIVES[week] ?? [];
    return { week, total: narratives.length, narratives } as T;
  }

  if (pathname === '/api/narratives') {
    const week = searchParams.get('week') ?? '';
    if (week) {
      const narratives = STATIC_NARRATIVE_LIST_BY_WEEK[week] ?? [];
      return { narratives, total: narratives.length } as T;
    }

    const all = Object.values(STATIC_NARRATIVE_LIST_BY_WEEK).flat();
    const uniqueByCluster = new Map(all.map(item => [item.cluster_id, item]));
    const narratives = Array.from(uniqueByCluster.values());
    return { narratives, total: narratives.length } as T;
  }

  if (pathParts[0] === 'api' && pathParts[1] === 'narratives' && pathParts[2]) {
    const clusterId = Number(pathParts[2]);
    if (pathParts[3] === 'claims') {
      return (STATIC_NARRATIVE_CLAIMS[clusterId] ?? emptyNarrativeClaims(clusterId)) as T;
    }
    return STATIC_NARRATIVE_DETAILS[clusterId] as T;
  }

  if (pathname === '/api/trends') {
    return { trends: STATIC_TRENDS, total: STATIC_TRENDS.length } as T;
  }

  if (pathParts[0] === 'api' && pathParts[1] === 'trends' && pathParts[2]) {
    return STATIC_TREND_DETAILS[Number(pathParts[2])] as T;
  }

  if (pathname === '/api/videos') {
    const limit = Math.max(Number(searchParams.get('limit') ?? '20') || 20, 1);
    const cursor = Math.max(Number(searchParams.get('cursor') ?? '0') || 0, 0);
    const items = STATIC_VIDEOS.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < STATIC_VIDEOS.length ? String(cursor + limit) : null;
    return {
      items,
      total_returned: items.length,
      next_cursor: nextCursor,
    } as T;
  }

  if (pathname === '/api/videos/by-id') {
    const videoId = searchParams.get('video_id') ?? '';
    return STATIC_VIDEO_DETAILS[videoId] as T;
  }

  if (pathname === '/api/articles') {
    const week = searchParams.get('week');
    const clusterId = searchParams.get('cluster_id');
    const limit = searchParams.get('limit');

    let articles = STATIC_ARTICLES;
    if (week) articles = articles.filter(item => item.week_number === Number(week));
    if (clusterId) articles = articles.filter(item => item.cluster_id === Number(clusterId));
    if (limit) articles = articles.slice(0, Math.max(Number(limit) || 0, 0));

    return { articles, total: articles.length } as T;
  }

  if (pathParts[0] === 'api' && pathParts[1] === 'articles' && pathParts[2]) {
    return STATIC_ARTICLE_DETAILS[pathParts[2]] as T;
  }

  throw new Error(`No static snapshot handler for ${path}`);
}

async function request<T>(path: string, method = 'GET'): Promise<T> {
  if (isDemoStaticMode()) {
    if (method.toUpperCase() !== 'GET') {
      throw new Error(`Static snapshot mode is read-only: ${method} ${path}`);
    }
    return Promise.resolve(staticGet<T>(path));
  }

  const res = await fetch(`${BASE}${path}`, { method });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  return request<T>(path, 'GET');
}

// ── Query builder ────────────────────────────────────────────────────────────
function withQuery(
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return path;
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return query ? `${path}?${query}` : path;
}

// --- Response type shapes from backend ---

export interface BackendWeekSummary {
  week: string;
  total_videos: number;
  total_views: number;
  active_clusters: number;
  breaking_count: number;
  dominant_sentiment: string;
}

export interface BackendWeeksResponse {
  weeks: BackendWeekSummary[];
  total: number;
}

export interface BackendNarrativeListItem {
  cluster_id: number;
  label: string;
  category: string;
  narrative_headline: string | null;
  top_topics: string[];
  video_count: number;
  dominant_sentiment: string;
}

export interface BackendNarrativeListResponse {
  narratives: BackendNarrativeListItem[];
  total: number;
}

export interface BackendWeekData {
  week: string;
  video_count: number;
  channel_count: number;
  view_count: number;
  breaking_count: number;
  sentiment_breakdown: Record<string, number>;
  narrative_headline?: string;
  week_overview?: string;
}

export interface BackendCreatorRisk {
  name: string;
  riskScore: number;
  riskLevel: string;
  claimCount: number;
}

export interface BackendNarrativeDetail {
  cluster_id: number;
  label: string;
  category: string;
  narrative_headline: string | null;
  narrative_summary: string | null;
  top_topics: string[];
  top_claims: string[];
  video_count: number;
  channel_count: number;
  breaking_count: number;
  dominant_sentiment: string;
  channels: string[];
  week_data: BackendWeekData[];
  creator_risk: BackendCreatorRisk[];
  avg_clickbait_rating: number | null;
  thumbnail_tone_breakdown: Record<string, number>;
}

export interface BackendConsensusClaim {
  claim: string;
  channel: string;
  sources: string[];
  source_count: number;
  video_ids: string[];
  transcript_excerpt: string;
  risk_score: number;
}

export interface BackendDebatedClaimPerspective {
  channel?: string;
  sentiment?: string;
  video_id?: string;
  video_title?: string;
  transcript_excerpt?: string;
  text?: string;
  framing?: string;
}

export interface BackendDebatedClaim {
  claim: string;
  channel: string;
  perspectives: BackendDebatedClaimPerspective[];
  source_count: number;
  framing_divergence: number;
  risk_score: number;
}

export interface BackendUniqueClaim {
  claim: string;
  channel: string;
  video_id: string;
  video_title: string;
  transcript_excerpt: string;
  risk_score: number;
}

export interface BackendClassifiedClaims {
  consensus: BackendConsensusClaim[];
  debated: BackendDebatedClaim[];
  unique: BackendUniqueClaim[];
}

export interface BackendNarrativeClaims {
  cluster_id: number;
  claims: BackendClassifiedClaims;
}

export interface BackendTrendListItem {
  cluster_id: number;
  label: string;
  category: string;
  trend_type: string;
  metric_badge: string;
  heat_score: number;
  video_count: number;
  channel_count: number;
  view_count_total: number;
  breaking_count: number;
  sentiment_label: string;
  recent_sentiment_label: string;
  dominant_sentiment: string;
  dominant_public_sentiment: string;
  sentiment_divergence: boolean;
  top_topics: string[];
  narrative_headline?: string | null;
  narrative_summary?: string | null;
}

export interface BackendTrendListResponse {
  trends: BackendTrendListItem[];
  total: number;
}

export interface BackendTrendDetail extends BackendTrendListItem {
  total_likes: number;
  total_comments: number;
  engagement_index: number;
  sentiment_breakdown: Record<string, number>;
  public_sentiment_breakdown: Record<string, number>;
  avg_public_sentiment_score: number;
  channels: string[];
  week_data: BackendWeekData[];
  top_claims: string[];
  creator_risk: BackendCreatorRisk[];
  avg_clickbait_rating: number | null;
  thumbnail_tone_breakdown: Record<string, number>;
}

export interface BackendVideoItem {
  video_id: string;
  channel: string;
  title: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  week?: string | null;
  topics?: string[] | null;
  category?: string | null;
  sentiment?: string | null;
  key_claims?: string[] | null;
  is_breaking?: boolean | null;
  cluster_id?: number | null;
  cluster_label?: string | null;
  thumbnail_url?: string | null;
  thumbnail_tone?: string | null;
  thumbnail_clickbait_score?: number | null;
  thumbnail_insight?: string | null;
  thumbnail_brand_consistent?: boolean | null;
}

export interface BackendVideoListResponse {
  items: BackendVideoItem[];
  total_returned: number;
  next_cursor?: string | null;
}

export interface BackendVideoTopComment {
  author: string;
  text: string;
  likes: number;
}

export interface BackendVideoDetailItem extends BackendVideoItem {
  description: string;
  transcript: string;
  top_comments: BackendVideoTopComment[];
}

// ── Articles ─────────────────────────────────────────────────────────────────

export interface BackendArticleListItem {
  article_id: string;
  cluster_id: number;
  week_number: number;
  week_start_date: string;
  title: string;
  overview: string;
  created_at: string;
}

export interface BackendArticleListResponse {
  articles: BackendArticleListItem[];
  total: number;
}

export interface BackendArticleDetail extends BackendArticleListItem {
  body: string;
}

export interface BackendWeekNarrativeItem {
  cluster_id: number;
  cluster_label: string;
  narrative_headline: string | null;
  narrative_summary: string | null;
  week_overview: string | null;
  top_topics: string[];
  top_claims: string[];
  video_count: number;
  view_count: number;
  breaking_count: number;
  dominant_sentiment: string;
}

export interface BackendWeekNarrativesResponse {
  week: string;
  total: number;
  narratives: BackendWeekNarrativeItem[];
}

// --- Fetch functions ---

export function fetchWeeks(): Promise<BackendWeeksResponse> {
  return get('/api/weeks');
}

export function fetchNarrativesList(week: string): Promise<BackendNarrativeListResponse> {
  return get(`/api/narratives?week=${encodeURIComponent(week)}`);
}

export function fetchWeekNarratives(week: string): Promise<BackendWeekNarrativesResponse> {
  return get(`/api/weeks/${encodeURIComponent(week)}`);
}

export function fetchNarrativeDetail(clusterId: number): Promise<BackendNarrativeDetail> {
  return get(`/api/narratives/${clusterId}`);
}

export function fetchNarrativeClaims(clusterId: number, week?: string): Promise<BackendNarrativeClaims> {
  const path = week
    ? `/api/narratives/${clusterId}/claims?week=${encodeURIComponent(week)}`
    : `/api/narratives/${clusterId}/claims`;
  return get(path);
}

export function fetchTrendsList(): Promise<BackendTrendListResponse> {
  return get('/api/trends');
}

export function fetchTrendDetail(clusterId: number): Promise<BackendTrendDetail> {
  return get(`/api/trends/${clusterId}`);
}

export function fetchAllNarratives(): Promise<BackendNarrativeListResponse> {
  return get('/api/narratives');
}

export function fetchVideosList(limit = 20, cursor?: string): Promise<BackendVideoListResponse> {
  let url = `/api/videos?limit=${limit}`;
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
  return get(url);
}

export function fetchVideoDetail(videoId: string): Promise<BackendVideoDetailItem> {
  return get(`/api/videos/by-id?video_id=${encodeURIComponent(videoId)}`);
}

// Articles list — supports filtering by cluster_id, week, limit
export function fetchArticles(
  params: Record<string, string | number | undefined> = {},
): Promise<BackendArticleListResponse> {
  return get(withQuery('/api/articles', params));
}

export function fetchArticleById(articleId: string): Promise<BackendArticleDetail> {
  return get(`/api/articles/${encodeURIComponent(articleId)}`);
}
