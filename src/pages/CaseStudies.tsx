import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function CaseStudies() {
  return (
    <DashboardLayout title="Case Studies & Playbooks" subtitle="Strategic insights and actionable playbooks">
      <div className="animate-fade-in">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-semibold mb-1">No case studies yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Case studies and playbooks will appear here once they are created.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
