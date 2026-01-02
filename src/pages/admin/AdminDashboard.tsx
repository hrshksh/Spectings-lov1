import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, Users, Building2, TrendingUp, ExternalLink, Loader2, Search, Filter } from 'lucide-react';
import { 
  useTasks, 
  useEvidence, 
  useLeads, 
  useCompanies, 
  useAdminStats,
  useUpdateTaskStatus,
  useUpdateEvidenceStatus,
  useUpdateLeadStatus,
} from '@/hooks/useAdminData';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: evidence, isLoading: evidenceLoading } = useEvidence();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  
  const updateTaskStatus = useUpdateTaskStatus();
  const updateEvidenceStatus = useUpdateEvidenceStatus();
  const updateLeadStatus = useUpdateLeadStatus();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');
  const [evidenceStatusFilter, setEvidenceStatusFilter] = useState<string>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');

  // Filtered data
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
      const matchesPriority = taskPriorityFilter === 'all' || task.priority === taskPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, taskStatusFilter, taskPriorityFilter]);

  const filteredEvidence = useMemo(() => {
    if (!evidence) return [];
    return evidence.filter(ev => {
      const matchesSearch = ev.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           ev.url?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = evidenceStatusFilter === 'all' || ev.status === evidenceStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [evidence, searchQuery, evidenceStatusFilter]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      const matchesSearch = lead.person?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.person?.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, leadStatusFilter]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter(company => {
      return company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             company.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [companies, searchQuery]);

  const handleApproveTask = (taskId: string) => {
    updateTaskStatus.mutate({ taskId, status: 'completed' });
  };

  const handleRejectTask = (taskId: string) => {
    updateTaskStatus.mutate({ taskId, status: 'rejected' });
  };

  const handlePublishEvidence = (evidenceId: string) => {
    updateEvidenceStatus.mutate({ evidenceId, status: 'published' });
  };

  const handleParseEvidence = (evidenceId: string) => {
    updateEvidenceStatus.mutate({ evidenceId, status: 'parsed' });
  };

  const handleRejectEvidence = (evidenceId: string) => {
    updateEvidenceStatus.mutate({ evidenceId, status: 'rejected' });
  };

  const handleVerifyLead = (leadId: string) => {
    updateLeadStatus.mutate({ leadId, status: 'verified', userId: user?.id });
  };

  const handleRejectLead = (leadId: string) => {
    updateLeadStatus.mutate({ leadId, status: 'rejected' });
  };

  return (
    <DashboardLayout title="Task Queue" subtitle="Manage intelligence tasks and approvals" isAdmin>
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Tasks', value: stats?.pendingTasks ?? 0, icon: Clock, color: 'warning' },
            { label: 'In Progress', value: stats?.inProgressTasks ?? 0, icon: Eye, color: 'primary' },
            { label: 'Completed Today', value: stats?.completedToday ?? 0, icon: CheckCircle, color: 'success' },
            { label: 'Needs Review', value: stats?.needsReview ?? 0, icon: AlertTriangle, color: 'destructive' },
          ].map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statsLoading ? '...' : stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all queues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Tasks
              {filteredTasks.length > 0 && <Badge variant="secondary" className="ml-2">{filteredTasks.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="evidence">
              Evidence
              {filteredEvidence.length > 0 && <Badge variant="secondary" className="ml-2">{filteredEvidence.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="leads">
              Leads
              {filteredLeads.length > 0 && <Badge variant="secondary" className="ml-2">{filteredLeads.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="companies">
              Companies
              {filteredCompanies.length > 0 && <Badge variant="secondary" className="ml-2">{filteredCompanies.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Task Queue</CardTitle>
                  <div className="flex gap-2">
                    <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={taskPriorityFilter} onValueChange={setTaskPriorityFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTasks.length > 0 ? (
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
                      {filteredTasks.map((task) => (
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
                            <div className="text-sm text-muted-foreground">
                              {new Date(task.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.assigned_user ? (
                              <span>{task.assigned_user.full_name || task.assigned_user.email}</span>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusColors[task.status as keyof typeof statusColors]}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-success hover:text-success"
                                onClick={() => handleApproveTask(task.id)}
                                disabled={updateTaskStatus.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRejectTask(task.id)}
                                disabled={updateTaskStatus.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || taskStatusFilter !== 'all' || taskPriorityFilter !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'No tasks found. Tasks will appear here when created.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Evidence Queue</CardTitle>
                    <CardDescription>Review and publish raw evidence</CardDescription>
                  </div>
                  <Select value={evidenceStatusFilter} onValueChange={setEvidenceStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="parsed">Parsed</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {evidenceLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEvidence.length > 0 ? (
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
                      {filteredEvidence.map((ev) => (
                        <TableRow key={ev.id}>
                          <TableCell>
                            <Badge variant="outline">{ev.source_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px] truncate">{ev.text || 'No content'}</div>
                          </TableCell>
                          <TableCell>
                            {ev.url ? (
                              <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">No URL</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={ev.status === 'published' ? 'success' : ev.status === 'rejected' ? 'destructive' : 'warning'}>
                              {ev.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(ev.ingested_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handlePublishEvidence(ev.id)}
                                disabled={updateEvidenceStatus.isPending || ev.status === 'published'}
                              >
                                Publish
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleParseEvidence(ev.id)}
                                disabled={updateEvidenceStatus.isPending}
                              >
                                Parse
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRejectEvidence(ev.id)}
                                disabled={updateEvidenceStatus.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || evidenceStatusFilter !== 'all' 
                      ? 'No evidence matches your filters' 
                      : 'No evidence found. Evidence will appear here when ingested.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Lead Management Queue</CardTitle>
                    <CardDescription>Review and verify leads</CardDescription>
                  </div>
                  <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredLeads.length > 0 ? (
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
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.person?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>{lead.person?.role || '-'}</TableCell>
                          <TableCell>{lead.person?.company || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={Number(lead.person?.confidence) >= 80 ? 'success' : 'warning'}>
                              {lead.person?.confidence || 0}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lead.status === 'verified' ? 'success' : lead.status === 'rejected' ? 'destructive' : 'warning'}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleVerifyLead(lead.id)}
                                disabled={updateLeadStatus.isPending || lead.status === 'verified'}
                              >
                                Verify
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRejectLead(lead.id)}
                                disabled={updateLeadStatus.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || leadStatusFilter !== 'all' 
                      ? 'No leads match your filters' 
                      : 'No leads pending review'}
                  </div>
                )}
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
                {companiesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredCompanies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.industry || '-'}</TableCell>
                          <TableCell>{company.size || '-'}</TableCell>
                          <TableCell>
                            {company.domain ? (
                              <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                                {company.domain} <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No companies match your search' : 'No companies found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
