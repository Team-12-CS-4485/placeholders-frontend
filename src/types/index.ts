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