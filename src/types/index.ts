import React from 'react';

export interface Claim {
  id: string;
  claimType: 'consensus' | 'debated' | 'unique';
  creatorName: string;
  creatorInitials: string;
  riskScore: number;
  extractedClaim: React.ReactNode;
  originalQuote: string;
  videoUrl: string;
  videoId: string | null;
}

export interface Video {
  id: string;
  channel: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  thumbnailUrl: string;
  sentiment: string;
  clusterLabel: string;
}

export interface VideoDetailData extends Video {
  likeCount: number;
  commentCount: number;
  description: string;
  transcript: string;
  topComments: { author: string; text: string; likes: number }[];
  keyClaims: string[];
  topics: string[];
}

export interface Narrative {
  id: string;
  weekId: string;
  category: string;
  headline: string;
  subheadline: React.ReactNode;
  /** Short teaser shown on the week report card */
  summary: React.ReactNode;
  /** Full body paragraphs (fallback when no article body available) */
  fullText: React.ReactNode[];
  /**
   * Article overview from GET /api/articles — a full lede paragraph.
   * Populated when articles are fetched alongside narratives.
   */
  overview?: string;
  /**
   * article_id returned by the articles list endpoint.
   * Stored here so NarrativeDetail can skip the list call and go straight to detail.
   */
  articleId?: string;
  pageNumber: number;
  claims: Claim[];
  trendIds: string[];
}

export interface Trend {
  id: string;
  name: string;
  description: React.ReactNode;
  overallSentiment: string;
  recentSentiment: string;
  engagementData: { date: string; value: number }[];
  totalEngagement: number;
  detailedAnalysis: React.ReactNode[];
  barChartData: {
    '30 Days': { label: string; value: number }[];
    '90 Days': { label: string; value: number }[];
  };
  creatorRisks: CreatorRisk[];
  weekHeadlines: Record<string, string>;
}

export interface TrendAlert {
  id: string;
  type: 'SHIFT' | 'NEW' | 'WARNING';
  headline: string;
  description: React.ReactNode;
}

export interface WeeklySummary {
  dateRange: string;
  headline: string;
  content: React.ReactNode;
}

export interface WeekData {
  id: string;
  weekName: string;
  dateRange: string;
  totalViews: number;
  summary: WeeklySummary;
  narratives: Narrative[];
}

export interface CreatorRisk {
  channelId: string;
  score: number;
  riskLevel: 'HIGH' | 'MED' | 'LOW';
}
