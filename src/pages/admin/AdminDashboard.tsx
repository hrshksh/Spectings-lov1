import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, Users, Building2, TrendingUp } from 'lucide-react';
import { mockTasks, mockEvidence } from '@/data/mockData';

const priorityColors = {
  low: 'ghost',
  medium: 'warning',
  high: 'destructive',
} as const;

const statusColors = {
  pending: 'warning',
  in_progress: 'glow',
  completed: 'success',
  rejected: 'destructive',
} as const;

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Task Queue" subtitle="Manage intelligence tasks and approvals" isAdmin>
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Tasks', value: 12, icon: Clock, color: 'warning' },
            { label: 'In Progress', value: 5, icon: Eye, color: 'primary' },
            { label: 'Completed Today', value: 23, icon: CheckCircle, color: 'success' },
            { label: 'Needs Review', value: 8, icon: AlertTriangle, color: 'destructive' },
          ].map((stat) => (
            <Card key={stat.label} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Task Queue</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Bulk Approve</Button>
                    <Button variant="glow" size="sm">Assign Tasks</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        task.type === 'evidence' ? 'bg-primary/10' :
                        task.type === 'lead' ? 'bg-accent/10' :
                        task.type === 'company' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        {task.type === 'evidence' ? <Eye className="h-5 w-5 text-primary" /> :
                         task.type === 'lead' ? <Users className="h-5 w-5 text-accent" /> :
                         task.type === 'company' ? <Building2 className="h-5 w-5 text-success" /> :
                         <TrendingUp className="h-5 w-5 text-warning" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                          <Badge variant={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
                          {task.assignedTo && <span className="text-xs text-muted-foreground">→ {task.assignedTo}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="success" size="sm"><CheckCircle className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm"><XCircle className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Evidence Queue</CardTitle>
                <CardDescription>Review and publish raw evidence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvidence.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="ghost">{ev.sourceType}</Badge>
                        <Badge variant={ev.status === 'published' ? 'success' : ev.status === 'rejected' ? 'destructive' : 'warning'}>
                          {ev.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{ev.text}</p>
                      <p className="text-xs text-muted-foreground mb-3">{ev.url}</p>
                      <div className="flex gap-2">
                        <Button variant="glow" size="sm">Publish</Button>
                        <Button variant="outline" size="sm">Parse</Button>
                        <Button variant="ghost" size="sm">Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads"><Card variant="elevated"><CardContent className="p-12 text-center text-muted-foreground">Lead management queue</CardContent></Card></TabsContent>
          <TabsContent value="companies"><Card variant="elevated"><CardContent className="p-12 text-center text-muted-foreground">Company management queue</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
