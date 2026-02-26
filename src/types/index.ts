export type TabId = 'front-page' | 'classifieds' | 'trends';

export interface Claim {
  id: string;
  creatorName: string;
  creatorInitials: string;
  riskScore: number;
  extractedClaim: string;
  originalQuote: string;
  videoUrl: string;
}

export interface Narrative {
  id: string;
  headline: string;
  subheadline: string;
  summary: string;
  fullText: string[];
  pageNumber: number;
  claims: Claim[];
}

export interface Trend {
  id: string;
  name: string;
  description: string;
  sentiment: string;
  engagementData: number[];
  totalEngagement: number;
  detailedAnalysis: string[];
}