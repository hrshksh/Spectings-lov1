export const PREDEFINED_TAGS = [
  'B2B',
  'SaaS',
  'E-commerce',
  'Marketing Agencies',
  'EdTech',
  'Fintech',
  'Real-Estate',
  'PropTech',
  'Consulting',
  'IT Services',
  'Healthcare',
  'HealthTech',
  'Manufacturing',
  'Social Media',
  'Content',
  'Startups',
  'Others',
] as const;

export type PredefinedTag = typeof PREDEFINED_TAGS[number];
