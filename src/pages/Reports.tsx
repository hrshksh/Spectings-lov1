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
      <div className="space-y-3 animate-fade-in">
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Generate Custom Report</h2>
                  <p className="text-xs text-muted-foreground">Create a tailored report for specific date range</p>
                </div>
              </div>
              <Button size="sm" className="h-8"><FileText className="h-3.5 w-3.5 mr-1.5" />Create Report</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xs font-semibold mb-1">Weekly Reports</h3>
              <p className="text-[10px] text-muted-foreground mb-2">Comprehensive weekly intelligence summary.</p>
              <Badge className="text-[10px]">Every Monday</Badge>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-xs font-semibold mb-1">Monthly Summaries</h3>
              <p className="text-[10px] text-muted-foreground mb-2">In-depth monthly analysis.</p>
              <Badge variant="secondary" className="text-[10px]">1st of month</Badge>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-md bg-success/10 flex items-center justify-center mx-auto mb-2">
                <Eye className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-xs font-semibold mb-1">Quarterly Deep Dives</h3>
              <p className="text-[10px] text-muted-foreground mb-2">Strategic quarterly reports.</p>
              <Badge variant="success" className="text-[10px]">Quarterly</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm font-medium">Report Archive</CardTitle>
            <CardDescription className="text-xs">Download past intelligence reports</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-xs font-medium">{report.title}</h4>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{report.type}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{report.date}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {report.highlights.map((h, i) => (<Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{h}</Badge>))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs"><Download className="h-3 w-3 mr-1" />Download</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
