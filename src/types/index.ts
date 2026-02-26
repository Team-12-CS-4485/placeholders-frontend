import React from 'react';

export type TabId = 'front-page' | 'classifieds' | 'trends';

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
  headline: string;
  subheadline: React.ReactNode;
  summary: React.ReactNode;
  fullText: React.ReactNode[];
  pageNumber: number;
  claims: Claim[];
}

export interface Trend {
  id: string;
  name: string;
  description: React.ReactNode;
  sentiment: string;
  engagementData: number[];
  totalEngagement: number;
  detailedAnalysis: React.ReactNode[];
}

export interface WeeklySummary {
  dateRange: string;
  headline: string;
  content: React.ReactNode;
}

export interface CreatorRisk {
  channelId: string;
  score: number;
  riskLevel: 'HIGH' | 'MED' | 'LOW';
}

export interface ClassifiedClaim {
  text: React.ReactNode;
  source?: string;
  views?: string;
  warning?: string;
}

export interface ClassifiedItem {
  clusterId: string;
  title: React.ReactNode;
  claims: ClassifiedClaim[];
}

export interface ClassifiedCategory {
  title: string;
  items: ClassifiedItem[];
}