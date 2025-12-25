import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Clock, Eye, ChevronRight } from 'lucide-react';

const reports = [
  {
    id: '1',
    title: 'Weekly Intelligence Report',
    type: 'weekly',
    date: 'December 19-25, 2025',
    pages: 24,
    status: 'ready',
    highlights: ['47 new leads', '12 competitor events', '8 trend spikes'],
  },
  {
    id: '2',
    title: 'Weekly Intelligence Report',
    type: 'weekly',
    date: 'December 12-18, 2025',
    pages: 22,
    status: 'ready',
    highlights: ['38 new leads', '9 competitor events', '5 trend spikes'],
  },
  {
    id: '3',
    title: 'Monthly Market Summary',
    type: 'monthly',
    date: 'November 2025',
    pages: 48,
    status: 'ready',
    highlights: ['156 total leads', '45 competitor events', 'Market analysis'],
  },
  {
    id: '4',
    title: 'Quarterly Deep Dive',
    type: 'quarterly',
    date: 'Q3 2025',
    pages: 86,
    status: 'ready',
    highlights: ['Market trends', 'Competitor matrix', 'Strategic recommendations'],
  },
];

export default function Reports() {
  return (
    <DashboardLayout title="Reports" subtitle="Download your intelligence reports">
      <div className="space-y-6 animate-fade-in">
        {/* Generate New Report */}
        <Card variant="glow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Generate Custom Report</h2>
                  <p className="text-muted-foreground">Create a tailored report for specific date range or topics</p>
                </div>
              </div>
              <Button variant="glow" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="interactive">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Weekly Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive weekly intelligence summary with leads, events, and trends.
              </p>
              <Badge variant="glow">Every Monday</Badge>
            </CardContent>
          </Card>
          <Card variant="interactive">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Monthly Summaries</h3>
              <p className="text-sm text-muted-foreground mb-4">
                In-depth monthly analysis with market trends and strategic insights.
              </p>
              <Badge variant="accent">1st of month</Badge>
            </CardContent>
          </Card>
          <Card variant="interactive">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-7 w-7 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Quarterly Deep Dives</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Strategic quarterly reports with competitor matrices and recommendations.
              </p>
              <Badge variant="success">Quarterly</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Report Archive */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Report Archive</CardTitle>
            <CardDescription>Download past intelligence reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    report.type === 'weekly' ? 'bg-primary/10' :
                    report.type === 'monthly' ? 'bg-accent/10' : 'bg-success/10'
                  }`}>
                    <FileText className={`h-6 w-6 ${
                      report.type === 'weekly' ? 'text-primary' :
                      report.type === 'monthly' ? 'text-accent' : 'text-success'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{report.title}</h4>
                      <Badge variant="ghost" className="capitalize">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.highlights.map((highlight, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{highlight}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-muted-foreground mb-2">{report.pages} pages</p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
