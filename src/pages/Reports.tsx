import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Clock, Eye } from 'lucide-react';

const reports = [
  { id: '1', title: 'Weekly Intelligence Report', type: 'weekly', date: 'December 19-25, 2025', pages: 24, highlights: ['47 new leads', '12 competitor events'] },
  { id: '2', title: 'Weekly Intelligence Report', type: 'weekly', date: 'December 12-18, 2025', pages: 22, highlights: ['38 new leads', '9 competitor events'] },
  { id: '3', title: 'Monthly Market Summary', type: 'monthly', date: 'November 2025', pages: 48, highlights: ['156 total leads', 'Market analysis'] },
];

export default function Reports() {
  return (
    <DashboardLayout title="Reports" subtitle="Download your intelligence reports">
      <div className="space-y-6 animate-fade-in">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Generate Custom Report</h2>
                  <p className="text-muted-foreground">Create a tailored report for specific date range</p>
                </div>
              </div>
              <Button size="lg"><FileText className="h-4 w-4 mr-2" />Create Report</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Weekly Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">Comprehensive weekly intelligence summary.</p>
              <Badge>Every Monday</Badge>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Monthly Summaries</h3>
              <p className="text-sm text-muted-foreground mb-4">In-depth monthly analysis.</p>
              <Badge variant="secondary">1st of month</Badge>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-7 w-7 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Quarterly Deep Dives</h3>
              <p className="text-sm text-muted-foreground mb-4">Strategic quarterly reports.</p>
              <Badge variant="success">Quarterly</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Archive</CardTitle>
            <CardDescription>Download past intelligence reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.highlights.map((h, i) => (<Badge key={i} variant="secondary" className="text-xs">{h}</Badge>))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
