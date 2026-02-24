import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Perspects() {
  return (
    <DashboardLayout title="Perspects" subtitle="Market perspectives and insights">
      <div className="space-y-4 animate-fade-in">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Coming soon</p>
            <p className="text-xs mt-1">Market perspectives and insights will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
