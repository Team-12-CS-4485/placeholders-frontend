import type { Trend, WeekData, TrendAlert } from '../types';
import { Highlight } from '../components/shared/Highlight';

export const mockTickerItems: string[] = [
  'BREAKING: "GPT-5 writes production Python" [CONF: 92%]',
  "RISK ALERT: Spikes in medical misinformation regarding 'Ozempic'",
  "TRENDING: 'AI Automation in Manufacturing' +300% engagement in 24hrs",
  "SENTIMENT SHIFT: 'Tech Layoffs 2026' leaning 78% negative",
  "WARNING: Synthetic audio detected in Fortune 500 earnings calls",
  "EMERGING: 'DIY CRISPR kits' flagged by FDA algorithms",
  "MARKET: AI-managed ETFs outperforming traditional funds by 14%"
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
  },
  {
    id: 't4',
    name: 'Synthetic Audio in Finance',
    description: <>Use of <Highlight color="yellow">deepfake voices</Highlight> to impersonate CEOs during corporate events.</>,
    overallSentiment: '90% Negative',
    recentSentiment: '95% Negative',
    engagementData: [
      { date: 'Jan 5', value: 2 }, { date: 'Jan 8', value: 12 }, { date: 'Jan 11', value: 45 },
      { date: 'Jan 14', value: 110 }, { date: 'Jan 17', value: 320 }, { date: 'Jan 19', value: 450 },
      { date: 'Jan 21', value: 430 }
    ],
    totalEngagement: 450,
    detailedAnalysis: [
      'Rapidly emerging threat vector tracked across financial analysis channels.',
      <>Scammers are generating <Highlight color="yellow">cloned audio of tech CEOs</Highlight> to manipulate after-hours stock trading.</>,
      'Platform trust mechanisms are heavily strained. Major financial influencers are dedicating entire segments to debunking fake audio.'
    ],
    barChartData: {
      '30 Days': [
        { label: 'Wk 1', value: 5 }, { label: 'Wk 2', value: 25 }, { label: 'Wk 3', value: 150 }, { label: 'Wk 4', value: 450 }
      ],
      '90 Days': [
        { label: 'Oct', value: 0 }, { label: 'Nov', value: 2 }, { label: 'Dec', value: 5 }
      ]
    },
    creatorRisks: [
      { channelId: '@AlphaLeak', score: 0.89, riskLevel: 'HIGH' },
      { channelId: '@DayTradeKings', score: 0.72, riskLevel: 'MED' }
    ]
  },
  {
    id: 't5',
    name: 'Quantum Decryption Rumors',
    description: <>Speculation that foreign state actors have achieved <Highlight color="yellow">Q-Day (RSA breaking)</Highlight>.</>,
    overallSentiment: 'Panic / 80% Negative',
    recentSentiment: 'Highly Volatile',
    engagementData: [
      { date: 'Dec 15', value: 10 }, { date: 'Dec 22', value: 15 }, { date: 'Dec 29', value: 60 },
      { date: 'Jan 5', value: 85 }, { date: 'Jan 12', value: 140 }, { date: 'Jan 19', value: 210 },
      { date: 'Jan 21', value: 250 }
    ],
    totalEngagement: 250,
    detailedAnalysis: [
      'Crypto channels are fueling panic that quantum computers can now decrypt legacy Bitcoin wallets.',
      'Computer science channels are attempting to debunk, but the algorithmic reach favors the panic narratives.',
      <>Severe <Highlight color="yellow">technological misinformation</Highlight> propagating as fact.</>
    ],
    barChartData: {
      '30 Days': [
        { label: 'Wk 1', value: 60 }, { label: 'Wk 2', value: 85 }, { label: 'Wk 3', value: 140 }, { label: 'Wk 4', value: 250 }
      ],
      '90 Days': [
        { label: 'Oct', value: 10 }, { label: 'Nov', value: 12 }, { label: 'Dec', value: 45 }
      ]
    },
    creatorRisks: [
      { channelId: '@CryptoProphet', score: 0.92, riskLevel: 'HIGH' },
      { channelId: '@QAnonTech', score: 0.98, riskLevel: 'HIGH' },
      { channelId: '@CyberSecDaily', score: 0.2, riskLevel: 'LOW' }
    ]
  },
  {
    id: 't6',
    name: 'At-Home CRISPR Biology',
    description: <>Promotion of unregulated <Highlight color="teal">DIY synthetic biology kits</Highlight>.</>,
    overallSentiment: 'Mixed / Enthusiastic',
    recentSentiment: 'Defensive (Post-FDA Warning)',
    engagementData: [
      { date: 'Dec 1', value: 30 }, { date: 'Dec 10', value: 80 }, { date: 'Dec 20', value: 120 },
      { date: 'Dec 30', value: 190 }, { date: 'Jan 10', value: 250 }, { date: 'Jan 15', value: 180 },
      { date: 'Jan 21', value: 150 }
    ],
    totalEngagement: 190,
    detailedAnalysis: [
      'Started as an educational trend but shifted towards unverified bio-hacking regimens.',
      'FDA algorithmic flags resulted in mass demonetization in mid-January, reducing viral spread.',
      <>Highest risk lies in <Highlight color="pink">medical self-experimentation</Highlight> claims.</>
    ],
    barChartData: {
      '30 Days': [
        { label: 'Wk 1', value: 190 }, { label: 'Wk 2', value: 250 }, { label: 'Wk 3', value: 180 }, { label: 'Wk 4', value: 150 }
      ],
      '90 Days': [
        { label: 'Oct', value: 10 }, { label: 'Nov', value: 40 }, { label: 'Dec', value: 150 }
      ]
    },
    creatorRisks: [
      { channelId: '@BioHackerPro', score: 0.86, riskLevel: 'HIGH' },
      { channelId: '@GeneGenius', score: 0.77, riskLevel: 'MED' }
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
  },
  {
    id: 'a4',
    type: 'WARNING',
    headline: 'Synthetic Audio Scams Detected',
    description: <>High confidence flag: <Highlight color="yellow">Deepfake earnings calls</Highlight> are being propagated by 40+ financial channels.</>
  },
  {
    id: 'a5',
    type: 'NEW',
    headline: 'Panic: Quantum Decryption',
    description: <>Sudden search velocity spike for "RSA broken Q-Day". Indicates <Highlight color="pink">rapidly spreading tech misinfo</Highlight>.</>
  },
  {
    id: 'a6',
    type: 'SHIFT',
    headline: 'CRISPR Kit Sentiment Drop',
    description: <>Following FDA algorithmic action, sentiment around DIY biology shifted to <Highlight color="teal">highly defensive</Highlight>.</>
  }
];

export const mockWeeks: WeekData[] = [
  {
    id: '2026-w3',
    weekName: '2026 Week 3',
    dateRange: 'Jan 15 - Jan 21, 2026',
    summary: {
      dateRange: 'Jan 15 - Jan 21, 2026',
      headline: 'Deepfake Scams and Quantum Panics Crash the Markets',
      content: (
        <>
          This week, our extraction models processed <Highlight color="yellow">18,402 videos</Highlight>, revealing a severe escalation in synthetic media threats. The dominant narratives involve <Highlight color="pink">deepfake financial manipulation</Highlight>, speculation regarding <Highlight color="teal">quantum computing</Highlight>, catastrophic failures in <Highlight color="yellow">enterprise AI legal tools</Highlight>, and dangerous <Highlight color="pink">bio-hacking hospitalizations</Highlight>.
        </>
      )
    },
    narratives: [
      {
        id: 'n1',
        weekId: '2026-w3',
        category: 'FINANCE & MARKETS',
        headline: 'Synthetic CEO Audio Triggers After-Hours Selloffs',
        subheadline: <>Scammers are using <Highlight color="yellow">voice cloning</Highlight> to fake bankruptcy announcements during Q4 earnings season.</>,
        summary: <>Over 400 financial channels unwittingly rebroadcast <Highlight color="pink">fake audio leaks</Highlight> of tech CEOs, causing localized flash crashes in extended trading hours.</>,
        fullText: [
          'A highly coordinated misinformation campaign successfully bypassed standard financial reporting protocols this week.',
          <>Using state-of-the-art voice cloning, malicious actors generated fake hot-mic recordings of Fortune 500 CEOs admitting to accounting fraud. These audio snippets were heavily seeded across YouTube Shorts and financial advice channels, racking up <Highlight color="yellow">14 million views</Highlight> in under 12 hours.</>,
          'The fallout was immediate. Algorithmic trading bots scraped the YouTube transcripts, triggering after-hours selloffs. Human creators, rushing to break the news, amplified the claims without verification. The system has flagged this as a critical trust-and-safety failure.'
        ],
        pageNumber: 2,
        claims: [
          {
            id: 'c1',
            creatorName: 'WallStWolves',
            creatorInitials: 'WW',
            riskScore: 0.94,
            extractedClaim: <>The CEO of TechCorp <Highlight color="pink">admitted to faking Q4 revenue</Highlight> on a hot mic.</>,
            originalQuote: '"Listen to this leaked audio! He clearly says they cooked the books. Sell everything right now, pre-market is going to bleed!"',
            videoUrl: '#'
          },
          {
            id: 'c2',
            creatorName: 'MarketDaily',
            creatorInitials: 'MD',
            riskScore: 0.81,
            extractedClaim: <>Deepfakes are now <Highlight color="yellow">controlling the stock market</Highlight> via algorithmic trading.</>,
            originalQuote: '"The algos can\'t tell the difference between real audio and eleven-labs. The entire market structure is compromised."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t4']
      },
      {
        id: 'n2',
        weekId: '2026-w3',
        category: 'TECH & AI',
        headline: 'Q-Day Panic: Has RSA Encryption Fallen?',
        subheadline: <>Baseless rumors claim foreign state actors have achieved <Highlight color="yellow">quantum supremacy</Highlight>.</>,
        summary: <>A viral thread cross-pollinated to YouTube, claiming that <Highlight color="pink">all legacy encryption is now broken</Highlight> by a hidden quantum supercomputer.</>,
        fullText: [
          'A massive spike in technical misinformation was recorded starting January 15th, revolving around the concept of "Q-Day"—the theoretical point at which quantum computers can break standard RSA encryption.',
          <>The narrative was heavily driven by crypto-influencers attempting to drum up panic-buying for "quantum-resistant" alt-coins. The primary claim states that <Highlight color="yellow">20% of dormant Bitcoin wallets</Highlight> have already been drained by quantum actors.</>,
          'Cybersecurity experts on the platform have attempted to counter-message, but our engagement metrics show the panic narrative outperforming factual debunking by a ratio of 8:1.'
        ],
        pageNumber: 5,
        claims: [
          {
            id: 'c3',
            creatorName: 'CryptoProphet',
            creatorInitials: 'CP',
            riskScore: 0.98,
            extractedClaim: <>RSA encryption is broken; <Highlight color="pink">all crypto is vulnerable</Highlight>.</>,
            originalQuote: '"They have the quantum rigs running right now. Look at the dormant whale wallets waking up—they are being cracked. Move to Q-Coin immediately."',
            videoUrl: '#'
          },
          {
            id: 'c4',
            creatorName: 'CyberSecDaily',
            creatorInitials: 'CS',
            riskScore: 0.15,
            extractedClaim: <>Claims of Q-Day are <Highlight color="teal">mathematically impossible</Highlight> with current qubit stability.</>,
            originalQuote: '"Please do not panic sell. We are at least a decade away from maintaining the qubit coherence required for Shor\'s algorithm to run at scale."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t5']
      },
      {
        id: 'n11',
        weekId: '2026-w3',
        category: 'HEALTH & WELLNESS',
        headline: 'DIY Gut-Microbiome Editing Leads to Hospitalizations',
        subheadline: <>Users attempting to engineer "perfect" digestion via unregulated CRISPR kits face <Highlight color="pink">severe gastrointestinal distress</Highlight>.</>,
        summary: <>The DIY biology trend has escalated from glowing yeast to human ingestion, prompting <Highlight color="pink">emergency room spikes</Highlight> and a platform-wide ban on bio-hacking tutorials.</>,
        fullText: [
          'The trend of at-home CRISPR biology, which began in late 2025 as a niche educational hobby, has officially crossed the threshold into a public health crisis.',
          <>Over the past 7 days, 14 major influencers uploaded videos demonstrating how they used unregulated mail-order kits to edit the DNA of lactobacillus bacteria. The goal was to create a "super-probiotic" that cures lactose intolerance. Instead, followers who replicated the experiment and ingested the transgenic bacteria are reporting <Highlight color="pink">severe septic symptoms</Highlight>.</>,
          'The CDC has issued an emergency warning, and YouTube trust-and-safety algorithms have begun automatically demonetizing and removing any video containing the phrases "ingest," "CRISPR," and "gut health" in the same transcript.'
        ],
        pageNumber: 7,
        claims: [
          {
            id: 'c18',
            creatorName: 'BioHackerPro',
            creatorInitials: 'BH',
            riskScore: 0.96,
            extractedClaim: <>I <Highlight color="pink">cured my lactose intolerance</Highlight> by drinking my own CRISPR-edited lactobacillus.</>,
            originalQuote: '"Guys, I haven\'t had dairy in ten years. Yesterday I drank a pint of whole milk after taking my home-brewed CRISPR probiotic and I feel amazing. The DNA edit worked perfectly."',
            videoUrl: '#'
          },
          {
            id: 'c19',
            creatorName: 'DrGastro',
            creatorInitials: 'DG',
            riskScore: 0.1,
            extractedClaim: <>Ingesting unregulated transgenic bacteria can cause <Highlight color="teal">fatal sepsis</Highlight>.</>,
            originalQuote: '"Please stop drinking your science experiments. Introducing unregulated, hand-edited bacterial plasmids into your microbiome can lead to catastrophic immune responses and sepsis."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t6']
      },
      {
        id: 'n12',
        weekId: '2026-w3',
        category: 'TECH & AI',
        headline: 'LLM Hallucinations in Legal Filings Reach Crisis Levels',
        subheadline: <>Major law firms face disbarment after <Highlight color="yellow">autonomous AI paralegals</Highlight> invent case law in federal court.</>,
        summary: <>A catastrophic failure of automated legal tools has resulted in over <Highlight color="yellow">500 compromised court filings</Highlight> this week, shaking trust in enterprise AI.</>,
        fullText: [
          'The push to automate white-collar work has resulted in a highly visible systemic failure within the legal sector. Discourse this week is dominated by the fallout from "Auto-Litigator," a popular AI legal assistant used by mid-sized firms.',
          <>Investigations revealed that the AI, when tasked with drafting federal briefs without human supervision, completely <Highlight color="yellow">fabricated citations, judge names, and precedents</Highlight>. Over 500 cases nationwide are now subject to mistrial or sanctions.</>,
          'The platform sentiment is a mix of schadenfreude from the general public and profound panic from legal professionals. Content surrounding this narrative shifted from 60% positive regarding AI efficiency last month, to 85% negative overnight.'
        ],
        pageNumber: 14,
        claims: [
          {
            id: 'c20',
            creatorName: 'TechLawyer',
            creatorInitials: 'TL',
            riskScore: 0.65,
            extractedClaim: <>Auto-Litigator AI can <Highlight color="yellow">replace an entire law firm</Highlight> for $50/month.</>,
            originalQuote: '"Why pay a paralegal $80k a year when this software writes perfect federal briefs while you sleep? It\'s infinite leverage."',
            videoUrl: '#'
          },
          {
            id: 'c21',
            creatorName: 'CourtReporter',
            creatorInitials: 'CR',
            riskScore: 0.15,
            extractedClaim: <>Judges are now requiring <Highlight color="teal">"Proof of Human"</Highlight> attestations for all briefs.</>,
            originalQuote: '"It\'s gotten so bad that the Southern District is now mandating lawyers sign a sworn affidavit that no generative AI was used to research their filings."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t1']
      }
    ]
  },
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
        id: 'n3',
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
            id: 'c5',
            creatorName: 'TechDaily',
            creatorInitials: 'TD',
            riskScore: 0.2,
            extractedClaim: <>Junior dev roles are <Highlight color="yellow">down 40%</Highlight> year-over-year.</>,
            originalQuote: '"If you look at the job boards right now, entry-level postings have vanished. It is down like 40% because AI can write the boilerplate."',
            videoUrl: '#'
          },
          {
            id: 'c6',
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
        id: 'n4',
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
            id: 'c7',
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
        id: 'n5',
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
            id: 'c8',
            creatorName: 'FinSense',
            creatorInitials: 'FS',
            riskScore: 0.5,
            extractedClaim: <>Commercial real estate defaults will <Highlight color="pink">trigger a banking crisis</Highlight>.</>,
            originalQuote: '"When these commercial loans come due and the buildings are empty, the regional banks holding the bags are going to collapse."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t2']
      },
      {
        id: 'n6',
        weekId: '2026-w1',
        category: 'HEALTH & WELLNESS',
        headline: 'Unverified Diet Supplements Go Viral',
        subheadline: <>Dangerous <Highlight color="pink">OTC alternatives</Highlight> to prescription weight-loss drugs.</>,
        summary: <>A highly risky trend involving <Highlight color="pink">unverified diet supplements</Highlight> crossed over from TikTok to YouTube this week.</>,
        fullText: [
          'Following the high cost and scarcity of prescription GLP-1 agonists, wellness influencers have begun promoting "natural" alternatives available over the counter.',
          <>Our NLP models extracted over 2,500 distinct claims asserting that specific herbal blends achieve <Highlight color="pink">identical medical results</Highlight> to pharmaceutical interventions.</>,
          'This presents a massive risk vector. The system has automatically escalated these channels to the trust and safety dashboard for manual review.'
        ],
        pageNumber: 27,
        claims: [
          {
            id: 'c9',
            creatorName: 'FitLifeHacks',
            creatorInitials: 'FL',
            riskScore: 0.95,
            extractedClaim: <>Berberine mixed with psyllium is <Highlight color="pink">clinically identical</Highlight> to Ozempic.</>,
            originalQuote: '"You don\'t need a prescription. If you mix berberine with psyllium husk, it binds to the exact same receptors. It is clinically identical, guys."',
            videoUrl: '#'
          },
          {
            id: 'c10',
            creatorName: 'NutriScience',
            creatorInitials: 'NS',
            riskScore: 0.3,
            extractedClaim: <>Herbal supplements <Highlight color="teal">cannot mimic</Highlight> peptide hormones.</>,
            originalQuote: '"The biology simply doesn\'t support this. You cannot mimic a complex peptide hormone with over-the-counter tree bark."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t3']
      }
    ]
  },
  {
    id: '2025-w52',
    weekName: '2025 Week 52',
    dateRange: 'Dec 25 - Dec 31, 2025',
    summary: {
      dateRange: 'Dec 25 - Dec 31, 2025',
      headline: 'End of Year CRISPR Crazes and AI Optimism',
      content: (
        <>
          As the year closes, engagement shifted radically toward <Highlight color="teal">at-home biology</Highlight> kits and overly optimistic <Highlight color="yellow">AI ETF performance</Highlight>. The algorithms are heavily favoring unregulated scientific experimentation content.
        </>
      )
    },
    narratives: [
      {
        id: 'n7',
        weekId: '2025-w52',
        category: 'HEALTH & WELLNESS',
        headline: 'DIY CRISPR Kits Spark FDA Warnings',
        subheadline: <>Influencers are unboxing <Highlight color="teal">gene-editing kits</Highlight> in their kitchens.</>,
        summary: <>A terrifying new trend: lifestyle vloggers performing <Highlight color="pink">basic gene editing</Highlight> on bacteria and yeast in unsterile home environments.</>,
        fullText: [
          'What began as niche educational content has spiraled into a viral challenge. Creators are purchasing unregulated synthetic biology kits online and attempting to edit the DNA of brewer\'s yeast to make it glow in the dark.',
          <>While the immediate danger is low, <Highlight color="pink">medical professionals are sounding the alarm</Highlight> over the normalization of casual gene-editing and the potential for creating antibiotic-resistant strains accidentally.</>,
          'The FDA algorithmically issued takedown requests late in the week, but mirror videos continue to propagate.'
        ],
        pageNumber: 4,
        claims: [
          {
            id: 'c11',
            creatorName: 'BioHackerPro',
            creatorInitials: 'BH',
            riskScore: 0.88,
            extractedClaim: <>You can <Highlight color="pink">safely edit bacterial DNA</Highlight> on your kitchen counter.</>,
            originalQuote: '"It\'s perfectly safe. The kit comes with a neutralizer. We are going to make this E. coli glow green right here next to the microwave!"',
            videoUrl: '#'
          },
          {
            id: 'c12',
            creatorName: 'DrScience',
            creatorInitials: 'DS',
            riskScore: 0.25,
            extractedClaim: <>Home CRISPR kits pose a <Highlight color="yellow">major biosecurity risk</Highlight>.</>,
            originalQuote: '"This is incredibly irresponsible. You cannot guarantee sterile technique in a kitchen, and you have no way to properly dispose of transgenic waste."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t6']
      },
      {
        id: 'n8',
        weekId: '2025-w52',
        category: 'FINANCE & MARKETS',
        headline: 'AI-Managed ETFs Outperform S&P 500',
        subheadline: <>Retail investors are flocking to <Highlight color="teal">fully autonomous</Highlight> exchange-traded funds.</>,
        summary: <>End-of-year reports show several experimental ETFs entirely managed by <Highlight color="yellow">LLM trading agents</Highlight> beat the market by 14%.</>,
        fullText: [
          'Finance YouTube is ablaze with retrospectives on 2025 market performance. The undisputed winners, according to creator consensus, are fully autonomous AI-managed funds.',
          <>Narratives are aggressively pushing retail investors to pull their money from traditional mutual funds and place them into these <Highlight color="yellow">"black box" algorithmic ETFs</Highlight>.</>,
          'Regulators have not yet stepped in, but risk scores indicate high potential for catastrophic flash crashes if these models encounter novel market conditions.'
        ],
        pageNumber: 8,
        claims: [
          {
            id: 'c13',
            creatorName: 'AITrader',
            creatorInitials: 'AT',
            riskScore: 0.76,
            extractedClaim: <>Human fund managers are <Highlight color="yellow">mathematically obsolete</Highlight>.</>,
            originalQuote: '"The AGI fund returned 38% this year. The S&P did 24%. Human fund managers are mathematically obsolete. Pull your 401k now."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t1', 't2']
      }
    ]
  },
  {
    id: '2025-w51',
    weekName: '2025 Week 51',
    dateRange: 'Dec 18 - Dec 24, 2025',
    summary: {
      dateRange: 'Dec 18 - Dec 24, 2025',
      headline: 'Holiday Scams and Crypto-Mortgage Defaults',
      content: (
        <>
          Pre-holiday volume spiked in the <Highlight color="pink">Finance</Highlight> sector, highlighting a wave of defaults in experimental <Highlight color="yellow">crypto-backed real estate</Highlight> loans.
        </>
      )
    },
    narratives: [
      {
        id: 'n9',
        weekId: '2025-w51',
        category: 'FINANCE & MARKETS',
        headline: 'Crypto-Backed Mortgages Implode',
        subheadline: <>Smart-contract home loans face mass liquidation as <Highlight color="pink">collateral drops</Highlight>.</>,
        summary: <>A new financial instrument that allowed buyers to use Bitcoin as collateral for home mortgages is triggering <Highlight color="pink">automatic foreclosures</Highlight> via smart contracts.</>,
        fullText: [
          'A quiet disaster is unfolding in the decentralized finance space. Over the past year, "DeFi" mortgages allowed users to lock up crypto collateral to buy physical real estate.',
          <>Due to a minor dip in token prices last week, the smart contracts governing these loans executed <Highlight color="pink">automatic liquidations</Highlight>, foreclosing on hundreds of homes without human oversight or legal due process.</>,
          'Creators who previously promoted these platforms are now facing severe backlash, with many scrubbing their channel histories of sponsored content.'
        ],
        pageNumber: 11,
        claims: [
          {
            id: 'c14',
            creatorName: 'RealEstateDeFi',
            creatorInitials: 'RE',
            riskScore: 0.85,
            extractedClaim: <>Smart contracts are <Highlight color="pink">illegally seizing physical homes</Highlight>.</>,
            originalQuote: '"The blockchain just stole my house. I missed a margin call by 5 minutes and the contract literally transferred my physical deed to a liquidity pool."',
            videoUrl: '#'
          },
          {
            id: 'c15',
            creatorName: 'LawyerReacts',
            creatorInitials: 'LR',
            riskScore: 0.12,
            extractedClaim: <>DeFi foreclosures violate <Highlight color="teal">state property laws</Highlight>.</>,
            originalQuote: '"A smart contract cannot bypass the state foreclosure process. These liquidations are legally void, but the jurisdictional mess is going to take a decade to unwind."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t4']
      }
    ]
  },
  {
    id: '2025-w50',
    weekName: '2025 Week 50',
    dateRange: 'Dec 11 - Dec 17, 2025',
    summary: {
      dateRange: 'Dec 11 - Dec 17, 2025',
      headline: 'Neuro-Stimulation Gaming Tech Hits the Market',
      content: (
        <>
          A sudden surge in <Highlight color="teal">hardware reviews</Highlight> for unregulated neuro-stimulation headsets aimed at <Highlight color="yellow">esports competitors</Highlight>.
        </>
      )
    },
    narratives: [
      {
        id: 'n10',
        weekId: '2025-w50',
        category: 'TECH & AI',
        headline: 'Brain-Zapping Headsets for Gamers Go Mainstream',
        subheadline: <>Esports pros are using <Highlight color="yellow">transcranial direct current stimulation (tDCS)</Highlight> to improve reaction times.</>,
        summary: <>Tech reviewers are heavily pushing $400 headsets that run <Highlight color="yellow">mild electrical currents</Highlight> through the brain, claiming a 20% boost in competitive gaming performance.</>,
        fullText: [
          'Hardware review channels have simultaneously dropped videos on a new class of gaming peripherals: tDCS headsets.',
          <>These devices claim to use mild electrical currents to stimulate the motor cortex, reducing reaction times by up to <Highlight color="teal">20 milliseconds</Highlight>.</>,
          'While the technology exists in clinical settings, its unregulated application for teenagers playing competitive shooters has raised massive red flags in our health risk monitors.'
        ],
        pageNumber: 18,
        claims: [
          {
            id: 'c16',
            creatorName: 'ProGamerTech',
            creatorInitials: 'PG',
            riskScore: 0.92,
            extractedClaim: <>tDCS headsets <Highlight color="yellow">safely permanently increase</Highlight> your reaction time.</>,
            originalQuote: '"I\'ve been zapping my brain for a week and my flick shots are insane. It literally rewires your neurons to be faster permanently. Totally safe."',
            videoUrl: '#'
          },
          {
            id: 'c17',
            creatorName: 'NeuroDoc',
            creatorInitials: 'ND',
            riskScore: 0.45,
            extractedClaim: <>Unregulated tDCS can cause <Highlight color="pink">focal seizures</Highlight>.</>,
            originalQuote: '"Do not put this on your head. Applying unregulated direct current to a developing brain can lower your seizure threshold dramatically."',
            videoUrl: '#'
          }
        ],
        trendIds: ['t1']
      }
    ]
  }
];