import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, Users, Building2, TrendingUp, ExternalLink } from 'lucide-react';
import { mockTasks, mockEvidence } from '@/data/mockData';

const priorityColors = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
} as const;

const statusColors = {
  pending: 'warning',
  in_progress: 'default',
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
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
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
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Task Queue</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Bulk Approve</Button>
                    <Button size="sm">Assign Tasks</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            task.type === 'evidence' ? 'bg-primary/10' :
                            task.type === 'lead' ? 'bg-accent/10' :
                            task.type === 'company' ? 'bg-success/10' : 'bg-warning/10'
                          }`}>
                            {task.type === 'evidence' ? <Eye className="h-4 w-4 text-primary" /> :
                             task.type === 'lead' ? <Users className="h-4 w-4 text-accent" /> :
                             task.type === 'company' ? <Building2 className="h-4 w-4 text-success" /> :
                             <TrendingUp className="h-4 w-4 text-warning" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.createdAt}</div>
                        </TableCell>
                        <TableCell>
                          {task.assignedTo ? (
                            <span>{task.assignedTo}</span>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-success hover:text-success">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Queue</CardTitle>
                <CardDescription>Review and publish raw evidence</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ingested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEvidence.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <Badge variant="outline">{ev.sourceType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate">{ev.text}</div>
                        </TableCell>
                        <TableCell>
                          <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ev.status === 'published' ? 'success' : ev.status === 'rejected' ? 'destructive' : 'warning'}>
                            {ev.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(ev.ingestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="default" size="sm">Publish</Button>
                            <Button variant="outline" size="sm">Parse</Button>
                            <Button variant="ghost" size="sm">Reject</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management Queue</CardTitle>
                <CardDescription>Review and verify leads</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No leads pending review
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Company Management Queue</CardTitle>
                <CardDescription>Review and update company profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No companies pending review
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
