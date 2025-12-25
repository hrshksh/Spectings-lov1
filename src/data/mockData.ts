import { Person, Lead, Company, CompanyEvent, TrendSignal, SentimentSignal, CaseStudy, Alert, Task, RawEvidence } from '@/types';

export const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'VP of Engineering',
    company: 'TechCorp India',
    email: 'rahul@techcorp.in',
    phone: '+91 98765 43210',
    linkedin: 'linkedin.com/in/rahulsharma',
    tags: ['Decision Maker', 'Enterprise', 'SaaS'],
    confidence: 95,
    lastUpdated: '2025-12-24',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Head of Product',
    company: 'InnovateTech',
    email: 'priya@innovatetech.com',
    tags: ['Product Lead', 'Startup', 'B2B'],
    confidence: 88,
    lastUpdated: '2025-12-23',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    role: 'CTO',
    company: 'DataDriven Solutions',
    email: 'amit@datadriven.io',
    tags: ['C-Level', 'Analytics', 'AI/ML'],
    confidence: 92,
    lastUpdated: '2025-12-22',
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    role: 'Director of Operations',
    company: 'ScaleUp Ventures',
    email: 'sneha@scaleup.vc',
    tags: ['Operations', 'VC-backed', 'Growth'],
    confidence: 85,
    lastUpdated: '2025-12-21',
  },
];

export const mockLeads: Lead[] = mockPeople.map((person, i) => ({
  id: `lead-${i + 1}`,
  personId: person.id,
  person,
  notes: `High-value lead from ${person.company}. Engaged via LinkedIn.`,
  source: 'LinkedIn',
  status: i === 0 ? 'verified' : i === 1 ? 'pending' : 'verified',
  verifiedBy: i !== 1 ? 'QC Team' : undefined,
  verifiedAt: i !== 1 ? '2025-12-24' : undefined,
}));

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Freshworks',
    domain: 'freshworks.com',
    industry: 'SaaS',
    size: '5000+',
    description: 'Customer engagement software company',
    founded: 2010,
    competitors: ['Zendesk', 'Salesforce', 'HubSpot'],
  },
  {
    id: '2',
    name: 'Zoho',
    domain: 'zoho.com',
    industry: 'SaaS',
    size: '10000+',
    description: 'Suite of online productivity tools and SaaS applications',
    founded: 1996,
    competitors: ['Microsoft', 'Google', 'Salesforce'],
  },
  {
    id: '3',
    name: 'Razorpay',
    domain: 'razorpay.com',
    industry: 'FinTech',
    size: '2000+',
    description: 'Payment gateway and financial services',
    founded: 2014,
    competitors: ['Paytm', 'PhonePe', 'Stripe'],
  },
];

export const mockCompanyEvents: CompanyEvent[] = [
  {
    id: '1',
    companyId: '1',
    eventType: 'pricing_change',
    summary: 'Freshworks increased Enterprise tier pricing by 15%',
    evidenceIds: ['ev-1', 'ev-2'],
    confidence: 90,
    publishedAt: '2025-12-24',
  },
  {
    id: '2',
    companyId: '2',
    eventType: 'product_launch',
    summary: 'Zoho launched AI-powered analytics dashboard',
    evidenceIds: ['ev-3'],
    confidence: 95,
    publishedAt: '2025-12-23',
  },
  {
    id: '3',
    companyId: '3',
    eventType: 'funding',
    summary: 'Razorpay raised Series F at $7.5B valuation',
    evidenceIds: ['ev-4', 'ev-5'],
    confidence: 100,
    publishedAt: '2025-12-22',
  },
  {
    id: '4',
    companyId: '1',
    eventType: 'hiring',
    summary: 'Freshworks hiring 200+ engineers in Bangalore',
    evidenceIds: ['ev-6'],
    confidence: 85,
    publishedAt: '2025-12-21',
  },
];

export const mockTrendSignals: TrendSignal[] = [
  {
    id: '1',
    topic: 'AI-First Customer Support',
    score: 87,
    timeframe: 'Weekly',
    description: 'Growing adoption of AI chatbots replacing traditional support',
    createdAt: '2025-12-24',
    change: 12,
  },
  {
    id: '2',
    topic: 'Usage-Based Pricing',
    score: 72,
    timeframe: 'Weekly',
    description: 'SaaS companies shifting from seat-based to consumption pricing',
    createdAt: '2025-12-24',
    change: 8,
  },
  {
    id: '3',
    topic: 'Product-Led Growth',
    score: 65,
    timeframe: 'Weekly',
    description: 'Self-serve models gaining traction in enterprise',
    createdAt: '2025-12-24',
    change: -3,
  },
  {
    id: '4',
    topic: 'Data Privacy Compliance',
    score: 78,
    timeframe: 'Weekly',
    description: 'Increased focus on GDPR and data localization',
    createdAt: '2025-12-24',
    change: 15,
  },
];

export const mockSentimentSignals: SentimentSignal[] = [
  {
    id: '1',
    topic: 'Freshworks Support Quality',
    sentimentScore: -25,
    evidenceIds: ['ev-7', 'ev-8'],
    createdAt: '2025-12-24',
    source: 'G2 Reviews',
  },
  {
    id: '2',
    topic: 'Zoho Pricing',
    sentimentScore: 45,
    evidenceIds: ['ev-9'],
    createdAt: '2025-12-23',
    source: 'Twitter',
  },
  {
    id: '3',
    topic: 'Razorpay UPI Integration',
    sentimentScore: 72,
    evidenceIds: ['ev-10'],
    createdAt: '2025-12-22',
    source: 'Product Hunt',
  },
];

export const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'How Freshworks Lost Market Share to AI-Native Competitors',
    type: 'competitor',
    industry: 'SaaS',
    content: 'Detailed analysis of market dynamics...',
    createdAt: '2025-12-20',
  },
  {
    id: '2',
    title: 'The Rise of Consumption-Based Pricing in B2B',
    type: 'trend',
    industry: 'SaaS',
    content: 'Industry-wide shift analysis...',
    createdAt: '2025-12-18',
  },
  {
    id: '3',
    title: 'Viral Marketing Playbook: Lessons from Razorpay',
    type: 'campaign',
    industry: 'FinTech',
    content: 'Campaign breakdown and insights...',
    createdAt: '2025-12-15',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'competitor_event',
    title: 'Competitor Pricing Change',
    message: 'Freshworks increased Enterprise pricing by 15%',
    severity: 'warning',
    read: false,
    createdAt: '2025-12-24T10:30:00',
  },
  {
    id: '2',
    type: 'sentiment_negative',
    title: 'Negative Sentiment Alert',
    message: 'Spike in negative reviews for competitor support quality',
    severity: 'info',
    read: false,
    createdAt: '2025-12-24T09:15:00',
  },
  {
    id: '3',
    type: 'trend_spike',
    title: 'Trend Spike Detected',
    message: 'AI-First Support trend up 12% this week',
    severity: 'info',
    read: true,
    createdAt: '2025-12-23T16:00:00',
  },
  {
    id: '4',
    type: 'new_lead',
    title: 'New High-Value Lead',
    message: 'VP of Engineering at TechCorp India verified',
    severity: 'info',
    read: true,
    createdAt: '2025-12-23T14:30:00',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    type: 'evidence',
    title: 'Review Freshworks pricing screenshot',
    assignedTo: 'QC Team',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-12-24',
  },
  {
    id: '2',
    type: 'lead',
    title: 'Verify TechCorp contact details',
    assignedTo: 'Researcher',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2025-12-24',
  },
  {
    id: '3',
    type: 'company',
    title: 'Update Zoho company profile',
    status: 'pending',
    priority: 'low',
    createdAt: '2025-12-23',
  },
];

export const mockEvidence: RawEvidence[] = [
  {
    id: 'ev-1',
    sourceType: 'website',
    url: 'https://freshworks.com/pricing',
    text: 'Enterprise plan now starts at $99/agent/month',
    ingestedAt: '2025-12-24T08:00:00',
    status: 'pending',
  },
  {
    id: 'ev-2',
    sourceType: 'social',
    url: 'https://twitter.com/user/status/123',
    text: 'Just noticed Freshworks bumped their prices again...',
    ingestedAt: '2025-12-24T07:30:00',
    status: 'parsed',
  },
  {
    id: 'ev-3',
    sourceType: 'news',
    url: 'https://techcrunch.com/article/zoho-ai',
    text: 'Zoho unveils Zia Vision, an AI-powered analytics tool',
    ingestedAt: '2025-12-23T12:00:00',
    status: 'published',
  },
];

export const weeklyStats = {
  newLeads: 47,
  competitorChanges: 12,
  trendSpikes: 8,
  sentimentAlerts: 3,
  reportsGenerated: 2,
};

export const chartData = {
  sentimentTrend: [
    { date: 'Mon', positive: 65, negative: 20, neutral: 15 },
    { date: 'Tue', positive: 58, negative: 25, neutral: 17 },
    { date: 'Wed', positive: 72, negative: 15, neutral: 13 },
    { date: 'Thu', positive: 68, negative: 22, neutral: 10 },
    { date: 'Fri', positive: 75, negative: 12, neutral: 13 },
    { date: 'Sat', positive: 80, negative: 10, neutral: 10 },
    { date: 'Sun', positive: 78, negative: 14, neutral: 8 },
  ],
  leadsBySource: [
    { name: 'LinkedIn', value: 45 },
    { name: 'Website', value: 25 },
    { name: 'Referral', value: 18 },
    { name: 'Events', value: 12 },
  ],
};
