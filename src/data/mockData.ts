import type { Narrative, Trend } from '../types';

export const mockNarratives: Narrative[] = [
  {
    id: 'n1',
    headline: 'AI Coding Assistants Threaten Junior Developer Roles',
    subheadline: 'Data suggests a 40% contraction in entry-level demand as LLMs automate routine tasks.',
    summary: 'A sweeping analysis of 1,500 YouTube videos reveals a consensus: AI is automating junior-level coding, shifting demand exclusively to senior architects.',
    fullText: [
      'In a sweeping analysis of over 1,500 YouTube videos published this week, a dominant narrative has emerged regarding the future of entry-level software engineering.',
      'The system has successfully clustered 4,203 individual claims pointing toward a consensus among tech creators: advancements in LLM technology are rapidly automating routine coding tasks. Creators with high credibility scores note that while senior architecture roles remain secure, the demand for junior positions is visibly contracting.',
      'Specifically, the extracted claim "Devin AI successfully resolves 13.86% of GitHub issues unassisted" appeared in 47 independent videos, marking a significant focal point in the discourse. Sentiment surrounding this narrative is currently graded at a polarized 42% Positive and 58% Negative.'
    ],
    pageNumber: 12,
    claims: [
      {
        id: 'c1',
        creatorName: 'TechDaily',
        creatorInitials: 'TD',
        riskScore: 0.2,
        extractedClaim: 'Junior dev roles are down 40% year-over-year.',
        originalQuote: '"If you look at the job boards right now, entry-level postings have vanished. It is down like 40% because AI can write the boilerplate."',
        videoUrl: '#'
      },
      {
        id: 'c2',
        creatorName: 'CodeWhisperer',
        creatorInitials: 'CW',
        riskScore: 0.85,
        extractedClaim: 'Devin AI will replace all software engineers by 2026.',
        originalQuote: '"Mark my words, Devin and tools like it will completely eradicate the need for human software engineers in two years."',
        videoUrl: '#'
      }
    ]
  },
  {
    id: 'n2',
    headline: 'Wearable Tech Pivots to Predictive Diagnostics',
    subheadline: 'Smart rings and watches are now claiming to predict illness before symptoms appear.',
    summary: 'Health influencers are heavily promoting wearables that allegedly predict fevers and viral infections 24 hours in advance.',
    fullText: [
      'The health and wellness sector on YouTube has seen a massive spike in content surrounding predictive diagnostics via consumer wearables.',
      'Unlike previous years where step-counting was the focus, the current narrative centers on predicting illness. Over 800 videos this week featured claims about smart rings detecting minute changes in basal body temperature to predict fevers.',
      'While some claims are backed by peer-reviewed studies, our system flagged a high volume of medically unverified assertions regarding the detection of specific viral strains.'
    ],
    pageNumber: 14,
    claims: [
      {
        id: 'c3',
        creatorName: 'DrMed',
        creatorInitials: 'DM',
        riskScore: 0.4,
        extractedClaim: 'Smart rings accurately predict fever onset 24 hours prior.',
        originalQuote: '"The data shows that the temperature sensors in these rings can alert you to a fever a full day before you feel sick."',
        videoUrl: '#'
      }
    ]
  },
  {
    id: 'n3',
    headline: 'Commercial Real Estate Defaults Looming',
    subheadline: 'Financial creators warn of a 2008-style banking crisis triggered by empty office buildings.',
    summary: 'A growing chorus of finance channels are predicting a severe market correction driven by commercial real estate defaults.',
    fullText: [
      'Financial YouTube is currently dominated by a bearish narrative focusing on commercial real estate (CRE).',
      'Creators are pointing to high vacancy rates in major metropolitan areas and upcoming loan maturity dates as the catalyst for a potential banking crisis.',
      'The narrative momentum for this topic has increased by 150% over the last 14 days, with sentiment leaning 85% negative.'
    ],
    pageNumber: 23,
    claims: [
      {
        id: 'c4',
        creatorName: 'FinSense',
        creatorInitials: 'FS',
        riskScore: 0.5,
        extractedClaim: 'Commercial real estate defaults will trigger a banking crisis.',
        originalQuote: '"When these commercial loans come due and the buildings are empty, the regional banks holding the bags are going to collapse."',
        videoUrl: '#'
      }
    ]
  }
];

export const mockTrends: Trend[] = [
  {
    id: 't1',
    name: 'AI Automation in Manufacturing',
    description: 'Discourse around robotics and LLMs replacing factory floor workers.',
    sentiment: '78% Negative (Fear-driven)',
    engagementData: [10, 15, 25, 45, 80, 120, 110],
    totalEngagement: 120,
    detailedAnalysis: [
      'Engagement has skyrocketed over the past week following several high-profile robotics demonstrations.',
      'The primary emotion driving this trend is fear of job displacement, particularly among blue-collar demographics.',
      'Risk analysis shows a moderate level of misinformation regarding the actual capabilities of current robotic systems.'
    ]
  },
  {
    id: 't2',
    name: 'Sustainable Tech Investments',
    description: 'Analysis of green energy and sustainable hardware startups.',
    sentiment: '65% Positive (Optimistic)',
    engagementData: [40, 42, 45, 43, 48, 50, 55],
    totalEngagement: 55,
    detailedAnalysis: [
      'A slow but steady growth trend driven by institutional investment news.',
      'Creators are focusing on long-term viability rather than short-term gains.',
      'Low risk of misinformation; claims are generally well-sourced from public financial disclosures.'
    ]
  },
  {
    id: 't3',
    name: 'Unverified Diet Supplements',
    description: 'Viral promotion of over-the-counter GLP-1 alternatives.',
    sentiment: 'Mixed (High Engagement, High Risk)',
    engagementData: [5, 10, 50, 150, 300, 280, 250],
    totalEngagement: 300,
    detailedAnalysis: [
      'Explosive growth triggered by viral TikToks crossing over to YouTube.',
      'Extremely high risk of medical misinformation. Many creators are making unverified health claims.',
      'System recommends immediate flagging for brand safety.'
    ]
  }
];