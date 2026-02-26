import type { Trend, CreatorRisk, WeekData, TrendAlert } from '../types';
import { Highlight } from '../components/shared/Highlight';

export const mockTickerItems: string[] = [
  'BREAKING: "GPT-5 writes production Python" [CONF: 92%]',
  "RISK ALERT: Spikes in medical misinformation regarding 'Ozempic'",
  "TRENDING: 'AI Automation in Manufacturing' +300% engagement in 24hrs",
  "SENTIMENT SHIFT: 'Tech Layoffs 2026' leaning 78% negative"
];

export const mockTrends: Trend[] = [
  {
    id: 't1',
    name: 'AI Automation in Manufacturing',
    description: <>Discourse around robotics and LLMs <Highlight color="yellow">replacing factory floor workers</Highlight>.</>,
    overallSentiment: '78% Negative',
    recentSentiment: '85% Negative',
    engagementData: [
      { date: 'Jan 1', value: 10 }, { date: 'Jan 3', value: 15 }, { date: 'Jan 5', value: 25 },
      { date: 'Jan 7', value: 45 }, { date: 'Jan 9', value: 80 }, { date: 'Jan 11', value: 120 },
      { date: 'Jan 14', value: 110 }
    ],
    totalEngagement: 120,
    detailedAnalysis: [
      'Engagement has skyrocketed over the past week following several high-profile robotics demonstrations.',
      <>The primary emotion driving this trend is <Highlight color="pink">fear of job displacement</Highlight>, particularly among blue-collar demographics.</>,
      'Risk analysis shows a moderate level of misinformation regarding the actual capabilities of current robotic systems.'
    ],
    barChartData: {
      '30 Days': [
        { label: 'Wk 1', value: 20 }, { label: 'Wk 2', value: 35 }, { label: 'Wk 3', value: 80 }, { label: 'Wk 4', value: 120 }
      ],
      '90 Days': [
        { label: 'Oct', value: 50 }, { label: 'Nov', value: 60 }, { label: 'Dec', value: 100 }
      ]
    },
    creatorRisks: [
      { channelId: '@RoboTechInsider', score: 0.85, riskLevel: 'HIGH' },
      { channelId: '@BlueCollarVoice', score: 0.62, riskLevel: 'MED' }
    ]
  },
  {
    id: 't2',
    name: 'Sustainable Tech Investments',
    description: <>Analysis of <Highlight color="teal">green energy</Highlight> and sustainable hardware startups.</>,
    overallSentiment: '65% Positive',
    recentSentiment: '60% Positive',
    engagementData: [
      { date: 'Jan 1', value: 40 }, { date: 'Jan 3', value: 42 }, { date: 'Jan 5', value: 45 },
      { date: 'Jan 7', value: 43 }, { date: 'Jan 9', value: 48 }, { date: 'Jan 11', value: 50 },
      { date: 'Jan 14', value: 55 }
    ],
    totalEngagement: 55,
    detailedAnalysis: [
      'A slow but steady growth trend driven by institutional investment news.',
      'Creators are focusing on long-term viability rather than short-term gains.',
      'Low risk of misinformation; claims are generally well-sourced from public financial disclosures.'
    ],
    barChartData: {
      '30 Days': [
        { label: 'Wk 1', value: 40 }, { label: 'Wk 2', value: 45 }, { label: 'Wk 3', value: 50 }, { label: 'Wk 4', value: 55 }
      ],
      '90 Days': [
        { label: 'Oct', value: 30 }, { label: 'Nov', value: 40 }, { label: 'Dec', value: 45 }
      ]
    },
    creatorRisks: [
      { channelId: '@GreenInvest', score: 0.21, riskLevel: 'LOW' },
      { channelId: '@EcoTechDaily', score: 0.15, riskLevel: 'LOW' }
    ]
  },
  {
    id: 't3',
    name: 'Unverified Diet Supplements',
    description: <>Viral promotion of <Highlight color="pink">over-the-counter GLP-1 alternatives</Highlight>.</>,
    overallSentiment: 'Mixed',
    recentSentiment: 'Highly Polarized',
    engagementData: [
      { date: 'Jan 1', value: 5 }, { date: 'Jan 3', value: 10 }, { date: 'Jan 5', value: 50 },
      { date: 'Jan 7', value: 150 }, { date: 'Jan 9', value: 300 }, { date: 'Jan 11', value: 280 },
      { date: 'Jan 14', value: 250 }
    ],
    totalEngagement: 300,
    detailedAnalysis: [
      'Explosive growth triggered by viral TikToks crossing over to YouTube.',
      <>Extremely <Highlight color="pink">high risk of medical misinformation</Highlight>. Many creators are making unverified health claims.</>,
      'System recommends immediate flagging for brand safety.'
    ],
    barChartData: {
      '30 Days': [
        { label: 'Wk 1', value: 10 }, { label: 'Wk 2', value: 50 }, { label: 'Wk 3', value: 150 }, { label: 'Wk 4', value: 300 }
      ],
      '90 Days': [
        { label: 'Oct', value: 5 }, { label: 'Nov', value: 8 }, { label: 'Dec', value: 15 }
      ]
    },
    creatorRisks: [
      { channelId: '@MedTruthDaily', score: 0.95, riskLevel: 'HIGH' },
      { channelId: '@FitLifeHacks', score: 0.88, riskLevel: 'HIGH' },
      { channelId: '@DrWellness', score: 0.75, riskLevel: 'MED' }
    ]
  }
];

export const mockTrendAlerts: TrendAlert[] = [
  {
    id: 'a1',
    type: 'WARNING',
    headline: 'Spike in Medical Misinfo',
    description: <>Unverified GLP-1 alternatives seeing a <Highlight color="pink">300% engagement spike</Highlight> in 48 hours.</>
  },
  {
    id: 'a2',
    type: 'SHIFT',
    headline: 'Sentiment Reversal: Tech Jobs',
    description: <>Discourse around AI coding assistants shifted from 60% positive to <Highlight color="yellow">78% negative</Highlight> this week.</>
  },
  {
    id: 'a3',
    type: 'NEW',
    headline: 'Emerging: Predictive Wearables',
    description: <>New cluster forming around smart rings predicting viral infections. Monitoring for health claims.</>
  }
];

export const mockWeeks: WeekData[] = [
  {
    id: '2026-w2',
    weekName: '2026 Week 2',
    dateRange: 'Jan 8 - Jan 14, 2026',
    summary: {
      dateRange: 'Jan 8 - Jan 14, 2026',
      headline: 'AI Disruption and Market Fears Dominate Discourse',
      content: (
        <>
          This week's analysis of <Highlight color="yellow">15,000+ videos</Highlight> reveals a strong pivot towards economic anxiety. The primary narratives driving engagement involve the <Highlight color="yellow">automation of entry-level tech jobs</Highlight>, <Highlight color="teal">speculative health diagnostics</Highlight> via wearables, and looming <Highlight color="pink">commercial real estate defaults</Highlight>.
        </>
      )
    },
    narratives: [
      {
        id: 'n1',
        weekId: '2026-w2',
        category: 'TECH & AI',
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
        ],
        trendIds: ['t1']
      },
      {
        id: 'n2',
        weekId: '2026-w2',
        category: 'HEALTH & WELLNESS',
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
        ],
        trendIds: ['t2', 't3']
      }
    ]
  },
  {
    id: '2026-w1',
    weekName: '2026 Week 1',
    dateRange: 'Jan 1 - Jan 7, 2026',
    summary: {
      dateRange: 'Jan 1 - Jan 7, 2026',
      headline: 'New Year, New Tech Speculations',
      content: (
        <>
          Early year analysis shows a surge in <Highlight color="teal">sustainable tech</Highlight> and <Highlight color="pink">real estate</Highlight> predictions as creators set their expectations for 2026.
        </>
      )
    },
    narratives: [
      {
        id: 'n3',
        weekId: '2026-w1',
        category: 'FINANCE & MARKETS',
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
        ],
        trendIds: ['t2']
      }
    ]
  }
];