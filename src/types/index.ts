export type UserRole = 'super_admin' | 'researcher' | 'analyst' | 'qc' | 'customer_admin' | 'customer_user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  orgId: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  tags: string[];
  confidence: number;
  lastUpdated: string;
}

export interface Lead {
  id: string;
  personId: string;
  person: Person;
  notes: string;
  source: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  description: string;
  founded?: number;
  logo?: string;
  competitors?: string[];
}

export interface CompanyEvent {
  id: string;
  companyId: string;
  eventType: 'pricing_change' | 'product_launch' | 'hiring' | 'campaign' | 'news' | 'review' | 'funding' | 'acquisition';
  summary: string;
  evidenceIds: string[];
  confidence: number;
  publishedAt: string;
}

export interface TrendSignal {
  id: string;
  topic: string;
  score: number;
  timeframe: string;
  description: string;
  createdAt: string;
  change: number;
}

export interface SentimentSignal {
  id: string;
  topic: string;
  sentimentScore: number;
  evidenceIds: string[];
  createdAt: string;
  source: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  type: 'competitor' | 'trend' | 'campaign' | 'sentiment';
  industry: string;
  content: string;
  createdAt: string;
  thumbnail?: string;
}

export interface RawEvidence {
  id: string;
  sourceType: 'website' | 'social' | 'news' | 'review' | 'api';
  url: string;
  text: string;
  screenshot?: string;
  ingestedAt: string;
  status: 'pending' | 'parsed' | 'published' | 'rejected';
}

export interface Report {
  id: string;
  orgId: string;
  type: 'weekly' | 'monthly' | 'custom';
  pdfPath: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'competitor_event' | 'sentiment_negative' | 'trend_spike' | 'new_lead';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  type: 'evidence' | 'lead' | 'company' | 'trend';
  title: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}
