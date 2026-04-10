const BASE = 'https://placeholders-backend.onrender.com';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
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

// --- Fetch functions ---

export function fetchWeeks(): Promise<BackendWeeksResponse> {
  return get('/api/weeks');
}

export function fetchNarrativesList(week: string): Promise<BackendNarrativeListResponse> {
  return get(`/api/narratives?week=${encodeURIComponent(week)}`);
}

export function fetchNarrativeDetail(clusterId: number): Promise<BackendNarrativeDetail> {
  return get(`/api/narratives/${clusterId}`);
}

export function fetchNarrativeClaims(clusterId: number): Promise<BackendNarrativeClaims> {
  return get(`/api/narratives/${clusterId}/claims`);
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
