import React from 'react';

export interface Claim {
  id: string;
  creatorName: string;
  creatorInitials: string;
  riskScore: number;
  extractedClaim: React.ReactNode;
  originalQuote: React.ReactNode;
  videoUrl: string;
}

export interface Narrative {
  id: string;
  weekId: string;
  category: string;
  headline: string;
  subheadline: React.ReactNode;
  summary: React.ReactNode;
  fullText: React.ReactNode[];
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
  summary: WeeklySummary;
  narratives: Narrative[];
}

export interface CreatorRisk {
  channelId: string;
  score: number;
  riskLevel: 'HIGH' | 'MED' | 'LOW';
}