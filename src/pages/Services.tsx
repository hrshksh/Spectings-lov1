import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Zap, Shield, BarChart3, Users, Globe } from 'lucide-react';

const services = [
  {
    icon: Users,
    title: 'People Intelligence',
    description: 'Verified leads, enriched profiles, and role movement tracking across your target market.',
    features: ['Lead enrichment', 'Role change alerts', 'Contact verification', 'LinkedIn monitoring'],
  },
  {
    icon: BarChart3,
    title: 'Company Intelligence',
    description: 'Track competitor moves, pricing changes, product launches, and market positioning.',
    features: ['Competitor tracking', 'Pricing alerts', 'Product launch monitoring', 'Event timeline'],
  },
  {
    icon: Globe,
    title: 'Market Analytics',
    description: 'Sentiment analysis, trend reports, and opportunity signals delivered to your dashboard.',
    features: ['Trend reports', 'Sentiment analysis', 'Opportunity signals', 'Industry benchmarks'],
  },
  {
    icon: Zap,
    title: 'Real-time Alerts',
    description: 'Stay ahead with instant notifications on critical market movements and competitor activity.',
    features: ['Instant notifications', 'Custom triggers', 'Email & in-app alerts', 'Priority filtering'],
  },
  {
    icon: Shield,
    title: 'Data Verification',
    description: 'Every data point goes through our quality assurance pipeline before reaching you.',
    features: ['Multi-source verification', 'Confidence scoring', 'Human QC review', 'Evidence linking'],
  },
  {
    icon: BarChart3,
    title: 'Custom Research',
    description: 'On-demand deep-dive research tailored to your specific business questions.',
    features: ['Bespoke reports', 'Ad-hoc queries', 'Dedicated analyst', 'Priority turnaround'],
  },
];

export default function Services() {
  return (
    <DashboardLayout title="Services" subtitle="Explore our intelligence and analytics capabilities.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
