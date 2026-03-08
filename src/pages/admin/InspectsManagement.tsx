import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Search, Loader2, Eye, Building2, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;

const EVENT_TYPES = [
  'pricing_change', 'product_launch', 'hiring', 'campaign',
  'news', 'review', 'funding', 'acquisition'
] as const;

const EVENT_TYPE_LABELS: Record<string, string> = {
  pricing_change: 'Pricing Change',
  product_launch: 'Product Launch',
  hiring: 'Hiring',
  campaign: 'Campaign',
  news: 'News',
  review: 'Review',
  funding: 'Funding',
  acquisition: 'Acquisition',
};

function useInspectsEvents() {
  return useQuery({
    queryKey: ['admin-inspects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_events')
        .select('*, company:companies(name)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
}

function useCompaniesDropdown() {
  return useQuery({
    queryKey: ['admin-companies-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Pick<Company, 'id' | 'name'>[];
    },
  });
}

function useAllCompanies() {
  return useQuery({
    queryKey: ['admin-all-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*, organization:organizations(name)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
}

export default function InspectsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useInspectsEvents();
  const { data: companies = [] } = useCompaniesDropdown();
  const { data: allCompanies = [], isLoading: companiesLoading } = useAllCompanies();

  const [search, setSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ company_id: '', event_type: '' as string, summary: '' });
  const [editForm, setEditForm] = useState<{ id: string; company_id: string; event_type: string; summary: string } | null>(null);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const companyName = (e.company as any)?.name || '';
      const matchSearch = !search ||
        companyName.toLowerCase().includes(search.toLowerCase()) ||
        (e.summary || '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || e.event_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [events, search, typeFilter]);

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return allCompanies;
    const q = companySearch.toLowerCase();
    return allCompanies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.domain || '').toLowerCase().includes(q) ||
      ((c as any).organization?.name || '').toLowerCase().includes(q)
    );
  }, [allCompanies, companySearch]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const orgRes = await supabase.rpc('get_user_org_id', { _user_id: (await supabase.auth.getUser()).data.user!.id });
      const { error } = await supabase.from('company_events').insert([{
        company_id: form.company_id,
        event_type: form.event_type as any,
        summary: form.summary || null,
        organization_id: orgRes.data,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inspects'] });
      toast({ title: 'Activity added successfully' });
      setAddOpen(false);
      setForm({ company_id: '', event_type: '', summary: '' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editForm) return;
      const { error } = await supabase.from('company_events').update({
        company_id: editForm.company_id,
        event_type: editForm.event_type as any,
        summary: editForm.summary || null,
      }).eq('id', editForm.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inspects'] });
      toast({ title: 'Activity updated' });
      setEditOpen(false);
      setEditForm(null);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inspects'] });
      toast({ title: 'Activity deleted' });
      setDeleteId(null);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-companies-list'] });
      toast({ title: 'Company deleted' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openEdit = (event: any) => {
    setEditForm({ id: event.id, company_id: event.company_id, event_type: event.event_type, summary: event.summary || '' });
    setEditOpen(true);
  };

  return (
    <DashboardLayout title="Inspects Management" subtitle="Manage companies and activity data" isAdmin>
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Companies ({allCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Activities ({events.length})
          </TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search company, domain, or organization..." value={companySearch} onChange={e => setCompanySearch(e.target.value)} className="pl-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{allCompanies.length}</div><p className="text-xs text-muted-foreground">Total Companies</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{allCompanies.filter(c => c.is_tracked).length}</div><p className="text-xs text-muted-foreground">Tracked</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{new Set(allCompanies.map(c => c.organization_id).filter(Boolean)).size}</div><p className="text-xs text-muted-foreground">Organizations</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{allCompanies.filter(c => c.domain).length}</div><p className="text-xs text-muted-foreground">With Domain</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" /> All Companies ({filteredCompanies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {companiesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No companies found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Tracked</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map(company => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium text-sm">{company.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {company.domain ? (
                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {company.domain}</span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(company as any).organization?.name || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.is_tracked ? 'default' : 'secondary'} className="text-[11px]">
                            {company.is_tracked ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(company.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCompanyMutation.mutate(company.id)} disabled={deleteCompanyMutation.isPending}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search company or activity..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setAddOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Activity
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{events.length}</div><p className="text-xs text-muted-foreground">Total Activities</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{new Set(events.map(e => e.company_id)).size}</div><p className="text-xs text-muted-foreground">Companies</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{events.filter(e => e.event_type === 'funding').length}</div><p className="text-xs text-muted-foreground">Funding Events</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{events.filter(e => e.event_type === 'hiring').length}</div><p className="text-xs text-muted-foreground">Hiring Events</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> Activities ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No activities found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(event.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {(event.company as any)?.name || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">
                            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                          {event.summary || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(event)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(event.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>Add a new company activity event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Company *</Label>
              <Select value={form.company_id} onValueChange={v => setForm(f => ({ ...f, company_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Activity Summary</Label>
              <Textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Describe the activity..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.company_id || !form.event_type || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>Update the activity details.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <Label>Company *</Label>
                <Select value={editForm.company_id} onValueChange={v => setEditForm(f => f ? { ...f, company_id: v } : f)}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={editForm.event_type} onValueChange={v => setEditForm(f => f ? { ...f, event_type: v } : f)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Activity Summary</Label>
                <Textarea value={editForm.summary} onChange={e => setEditForm(f => f ? { ...f, summary: e.target.value } : f)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!editForm?.company_id || !editForm?.event_type || updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
