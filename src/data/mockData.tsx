import type { Narrative, Trend, WeeklySummary, CreatorRisk, ClassifiedCategory } from '../types';
import { Highlight } from '../components/shared/Highlight';

export const mockTickerItems: string[] = [
  'BREAKING: "GPT-5 writes production Python" [CONF: 92%]',
  "RISK ALERT: Spikes in medical misinformation regarding 'Ozempic'",
  "TRENDING: 'AI Automation in Manufacturing' +300% engagement in 24hrs",
  "SENTIMENT SHIFT: 'Tech Layoffs 2026' leaning 78% negative"
];

export const mockWeeklySummary: WeeklySummary = {
  dateRange: 'Weekly Aggregate Summary',
  headline: 'AI Disruption and Market Fears Dominate Discourse',
  content: (
    <>
      This week's analysis of <Highlight color="yellow">15,000+ videos</Highlight> reveals a strong pivot towards economic anxiety. The primary narratives driving engagement involve the <Highlight color="yellow">automation of entry-level tech jobs</Highlight>, <Highlight color="teal">speculative health diagnostics</Highlight> via wearables, and looming <Highlight color="pink">commercial real estate defaults</Highlight>.
    </>
  )
};

export const mockNarratives: Narrative[] = [
  {
    id: 'n1',
    headline: 'AI Coding Assistants Threaten Junior Developer Roles',
    subheadline: <>Data suggests a <Highlight color="yellow">40% contraction</Highlight> in entry-level demand as LLMs automate routine tasks.</>,
    summary: <>A sweeping analysis of <Highlight color="yellow">1,500 YouTube videos</Highlight> reveals a consensus: AI is automating junior-level coding, shifting demand exclusively to senior architects.</>,
    fullText: [
      <>In a sweeping analysis of over <Highlight color="yellow">1,500 YouTube videos</Highlight> published this week, a dominant narrative has emerged regarding the future of entry-level software engineering.</>,
      'The system has successfully clustered 4,203 individual claims pointing toward a consensus among tech creators: advancements in LLM technology are rapidly automating routine coding tasks. Creators with high credibility scores note that while senior architecture roles remain secure, the demand for junior positions is visibly contracting.',
      <>Specifically, the extracted claim <Highlight color="yellow">"Devin AI successfully resolves 13.86% of GitHub issues unassisted"</Highlight> appeared in 47 independent videos, marking a significant focal point in the discourse. Sentiment surrounding this narrative is currently graded at a polarized 42% Positive and 58% Negative.</>
    ],
    pageNumber: 12,
    claims: [
      {
        id: 'c1',
        creatorName: 'TechDaily',
        creatorInitials: 'TD',
        riskScore: 0.2,
        extractedClaim: <>Junior dev roles are <Highlight color="yellow">down 40%</Highlight> year-over-year.</>,
        originalQuote: '"If you look at the job boards right now, entry-level postings have vanished. It is down like 40% because AI can write the boilerplate."',
        videoUrl: '#'
      },
      {
        id: 'c2',
        creatorName: 'CodeWhisperer',
        creatorInitials: 'CW',
        riskScore: 0.85,
        extractedClaim: <>Devin AI will <Highlight color="yellow">replace all software engineers</Highlight> by 2026.</>,
        originalQuote: '"Mark my words, Devin and tools like it will completely eradicate the need for human software engineers in two years."',
        videoUrl: '#'
      }
    ]
  },
  {
    id: 'n2',
    headline: 'Wearable Tech Pivots to Predictive Diagnostics',
    subheadline: <>Smart rings and watches are now claiming to <Highlight color="teal">predict illness</Highlight> before symptoms appear.</>,
    summary: <>Health influencers are heavily promoting wearables that allegedly predict fevers and viral infections <Highlight color="teal">24 hours in advance</Highlight>.</>,
    fullText: [
      'The health and wellness sector on YouTube has seen a massive spike in content surrounding predictive diagnostics via consumer wearables.',
      <>Unlike previous years where step-counting was the focus, the current narrative centers on predicting illness. Over 800 videos this week featured claims about smart rings detecting minute changes in basal body temperature to <Highlight color="teal">predict fevers</Highlight>.</>,
      'While some claims are backed by peer-reviewed studies, our system flagged a high volume of medically unverified assertions regarding the detection of specific viral strains.'
    ],
    pageNumber: 14,
    claims: [
      {
        id: 'c3',
        creatorName: 'DrMed',
        creatorInitials: 'DM',
        riskScore: 0.4,
        extractedClaim: <><Highlight color="teal">Smart rings accurately predict fever onset</Highlight> 24 hours prior.</>,
        originalQuote: '"The data shows that the temperature sensors in these rings can alert you to a fever a full day before you feel sick."',
        videoUrl: '#'
      }
    ]
  },
  {
    id: 'n3',
    headline: 'Commercial Real Estate Defaults Looming',
    subheadline: <>Financial creators warn of a <Highlight color="pink">2008-style banking crisis</Highlight> triggered by empty office buildings.</>,
    summary: <>A growing chorus of finance channels are predicting a severe market correction driven by <Highlight color="pink">commercial real estate defaults</Highlight>.</>,
    fullText: [
      'Financial YouTube is currently dominated by a bearish narrative focusing on commercial real estate (CRE).',
      'Creators are pointing to high vacancy rates in major metropolitan areas and upcoming loan maturity dates as the catalyst for a potential banking crisis.',
      <>The narrative momentum for this topic has increased by <Highlight color="pink">150% over the last 14 days</Highlight>, with sentiment leaning 85% negative.</>
    ],
    pageNumber: 23,
    claims: [
      {
        id: 'c4',
        creatorName: 'FinSense',
        creatorInitials: 'FS',
        riskScore: 0.5,
        extractedClaim: <>Commercial real estate defaults will <Highlight color="pink">trigger a banking crisis</Highlight>.</>,
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
    description: <>Discourse around robotics and LLMs <Highlight color="yellow">replacing factory floor workers</Highlight>.</>,
    sentiment: '78% Negative (Fear-driven)',
    engagementData: [10, 15, 25, 45, 80, 120, 110],
    totalEngagement: 120,
    detailedAnalysis: [
      'Engagement has skyrocketed over the past week following several high-profile robotics demonstrations.',
      <>The primary emotion driving this trend is <Highlight color="pink">fear of job displacement</Highlight>, particularly among blue-collar demographics.</>,
      'Risk analysis shows a moderate level of misinformation regarding the actual capabilities of current robotic systems.'
    ]
  },
  {
    id: 't2',
    name: 'Sustainable Tech Investments',
    description: <>Analysis of <Highlight color="teal">green energy</Highlight> and sustainable hardware startups.</>,
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
    description: <>Viral promotion of <Highlight color="pink">over-the-counter GLP-1 alternatives</Highlight>.</>,
    sentiment: 'Mixed (High Engagement, High Risk)',
    engagementData: [5, 10, 50, 150, 300, 280, 250],
    totalEngagement: 300,
    detailedAnalysis: [
      'Explosive growth triggered by viral TikToks crossing over to YouTube.',
      <>Extremely <Highlight color="pink">high risk of medical misinformation</Highlight>. Many creators are making unverified health claims.</>,
      'System recommends immediate flagging for brand safety.'
    ]
  }
];

export const mockCreatorRisks: CreatorRisk[] = [
  { channelId: '@CryptoKingX', score: 0.92, riskLevel: 'HIGH' },
  { channelId: '@MedTruthDaily', score: 0.88, riskLevel: 'HIGH' },
  { channelId: '@TechReviewer', score: 0.31, riskLevel: 'LOW' },
  { channelId: '@FinSense', score: 0.45, riskLevel: 'MED' }
];

export const mockClassifieds: ClassifiedCategory[] = [
  {
    title: 'TECH & AI',
    items: [
      {
        clusterId: '409',
        title: 'Hardware Acceleration Limits',
        claims: [
          { text: <>"<Highlight color="yellow">Nvidia GPU shortages will throttle AI startups by Q3.</Highlight>"</>, source: 'TechDaily', views: '1.2M' },
          { text: '"Alternative chipmakers cannot meet current LLM training demands."' }
        ]
      },
      {
        clusterId: '412',
        title: 'Software Engineering',
        claims: [
          { text: <>"<Highlight color="yellow">AI tools increase developer productivity by 40%.</Highlight>"</> }
        ]
      }
    ]
  },
  {
    title: 'HEALTH & WELLNESS',
    items: [
      {
        clusterId: '811',
        title: 'Wearable Diagnostics',
        claims: [
          { text: <>"<Highlight color="teal">Smart rings accurately predict fever onset 24 hours prior.</Highlight>"</>, source: 'DrMed', views: '400K' }
        ]
      },
      {
        clusterId: '815',
        title: <span className="hl-pink">Weight Loss Injections</span>,
        claims: [
          { text: '"Over-the-counter alternatives yield identical results to prescription GLP-1s."', warning: '[SYSTEM WARNING: HIGH RISK MEDICAL MISINFO]' }
        ]
      }
    ]
  },
  {
    title: 'FINANCE & MARKETS',
    items: [
      {
        clusterId: '204',
        title: 'Housing Market Correction',
        claims: [
          { text: '"Commercial real estate defaults will trigger a 2008-style banking crisis."' },
          { text: <>"<Highlight color="yellow">Interest rate drops are fully priced into current valuations.</Highlight>"</> }
        ]
      }
    ]
  }
];