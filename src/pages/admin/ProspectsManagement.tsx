import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Search, Plus, Trash2, Loader2, Users, Briefcase, TrendingUp, Linkedin, Edit2, Upload,
} from 'lucide-react';
import CsvImportDialog from '@/components/admin/CsvImportDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PREDEFINED_TAGS } from '@/constants/tags';
import type { Tables as DBTables } from '@/integrations/supabase/types';
import { personSchema, leadSchema } from '@/lib/validations';

type Person = DBTables<'people'>;
type Lead = DBTables<'leads'>;
interface LeadWithPerson extends Lead { person: Person | null; }

const SUBSECTIONS = [
  { key: 'sales', label: 'For Sales', icon: Briefcase },
  { key: 'hiring', label: 'For Hiring', icon: Users },
  { key: 'growth', label: 'For Growth', icon: TrendingUp },
] as const;

type SubsectionKey = typeof SUBSECTIONS[number]['key'];

// Real-time leads query
function useAdminLeads() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const leadsChannel = supabase
      .channel('admin-prospects-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(leadsChannel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-prospects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`*, person:people(*)`)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data as LeadWithPerson[]) || [];
    },
  });
}

export default function ProspectsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubsection, setActiveSubsection] = useState<SubsectionKey>('sales');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadWithPerson | null>(null);

  // Form state — prospect_type is auto-set from active subsection
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', role: '', linkedin: '',
    tags: [] as string[], quality_score: 50, notes: '', source: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    quality_score: 50, notes: '', source: '', status: 'pending' as 'pending' | 'verified' | 'rejected',
    name: '', email: '', phone: '', company: '', role: '', linkedin: '', tags: [] as string[], prospect_type: 'sales' as string,
  });

  const { data: leads = [], isLoading } = useAdminLeads();

  // Stats per subsection
  const stats = useMemo(() => {
    const byType = (type: string) => leads.filter(l => l.prospect_type === type);
    const current = byType(activeSubsection);
    return {
      total: current.length,
      verified: current.filter(l => l.status === 'verified').length,
      pending: current.filter(l => l.status === 'pending').length,
      rejected: current.filter(l => l.status === 'rejected').length,
      avgScore: current.length > 0
        ? Math.round(current.reduce((sum, l) => sum + (l.quality_score || 0), 0) / current.length)
        : 0,
      salesCount: byType('sales').length,
      hiringCount: byType('hiring').length,
      growthCount: byType('growth').length,
    };
  }, [leads, activeSubsection]);

  // Create lead mutation — auto-assigns activeSubsection as prospect_type
  const createLead = useMutation({
    mutationFn: async () => {
      const personValidation = personSchema.safeParse({
        name: form.name, email: form.email, phone: form.phone,
        company: form.company, role: form.role, linkedin: form.linkedin,
        tags: form.tags,
      });
      if (!personValidation.success) throw new Error(personValidation.error.errors[0]?.message || 'Invalid person data');

      const leadValidation = leadSchema.safeParse({
        quality_score: form.quality_score, notes: form.notes,
        source: form.source, prospect_type: activeSubsection,
      });
      if (!leadValidation.success) throw new Error(leadValidation.error.errors[0]?.message || 'Invalid lead data');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: orgId } = await supabase.rpc('get_user_org_id', { _user_id: user.id });

      const pv = personValidation.data;
      const { data: personData, error: personErr } = await supabase
        .from('people')
        .insert({
          name: pv.name,
          email: pv.email || null,
          phone: pv.phone || null,
          company: pv.company || null,
          role: pv.role || null,
          linkedin: pv.linkedin || null,
          tags: pv.tags && pv.tags.length > 0 ? pv.tags : null,
          organization_id: orgId || null,
        })
        .select()
        .single();
      if (personErr) throw personErr;

      const lv = leadValidation.data;
      const { error: leadErr } = await supabase
        .from('leads')
        .insert({
          person_id: personData.id,
          quality_score: lv.quality_score,
          notes: lv.notes || null,
          source: lv.source || null,
          organization_id: orgId || null,
          prospect_type: activeSubsection,
        } as any);
      if (leadErr) throw leadErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
      setDialogOpen(false);
      setForm({ name: '', email: '', phone: '', company: '', role: '', linkedin: '', tags: [], quality_score: 50, notes: '', source: '' });
      const label = SUBSECTIONS.find(s => s.key === activeSubsection)?.label ?? activeSubsection;
      toast({ title: `Prospect added to "${label}"` });
    },
    onError: (err: Error) => toast({ title: 'Error creating prospect', description: err.message, variant: 'destructive' }),
  });

  // Update lead mutation
  const updateLead = useMutation({
    mutationFn: async () => {
      if (!editingLead) throw new Error('No lead selected');

      if (editingLead.person_id) {
        const { error: personErr } = await supabase
          .from('people')
          .update({
            name: editForm.name,
            email: editForm.email || null,
            phone: editForm.phone || null,
            company: editForm.company || null,
            role: editForm.role || null,
            linkedin: editForm.linkedin || null,
            tags: editForm.tags.length > 0 ? editForm.tags : null,
          })
          .eq('id', editingLead.person_id);
        if (personErr) throw personErr;
      }

      const updates: Record<string, unknown> = {
        quality_score: editForm.quality_score,
        notes: editForm.notes || null,
        source: editForm.source || null,
        status: editForm.status,
        prospect_type: editForm.prospect_type,
      };
      if (editForm.status === 'verified') {
        const { data: { user } } = await supabase.auth.getUser();
        updates.verified_by = user?.id;
        updates.verified_at = new Date().toISOString();
      }
      const { error } = await supabase.from('leads').update(updates).eq('id', editingLead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
      setEditDialogOpen(false);
      setEditingLead(null);
      toast({ title: 'Prospect updated successfully' });
    },
    onError: (err: Error) => toast({ title: 'Error updating prospect', description: err.message, variant: 'destructive' }),
  });

  // Delete lead mutation
  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
      toast({ title: 'Prospect deleted' });
    },
    onError: (err: Error) => toast({ title: 'Error deleting prospect', description: err.message, variant: 'destructive' }),
  });

  const openEdit = (lead: LeadWithPerson) => {
    setEditingLead(lead);
    setEditForm({
      quality_score: lead.quality_score ?? 50,
      notes: lead.notes ?? '',
      source: lead.source ?? '',
      status: lead.status as 'pending' | 'verified' | 'rejected',
      name: lead.person?.name ?? '',
      email: lead.person?.email ?? '',
      phone: lead.person?.phone ?? '',
      company: lead.person?.company ?? '',
      role: lead.person?.role ?? '',
      linkedin: lead.person?.linkedin ?? '',
      tags: lead.person?.tags ?? [],
      prospect_type: lead.prospect_type ?? 'sales',
    });
    setEditDialogOpen(true);
  };

  const toggleTag = (tag: string, target: 'form' | 'edit') => {
    if (target === 'form') {
      setForm(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }));
    } else {
      setEditForm(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }));
    }
  };

  // Filter by active subsection, then by status & search
  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (!l.person) return false;
      if (l.prospect_type !== activeSubsection) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        l.person.name.toLowerCase().includes(q) ||
        l.person.email?.toLowerCase().includes(q) ||
        l.person.company?.toLowerCase().includes(q) ||
        l.person.role?.toLowerCase().includes(q)
      );
    });
  }, [leads, activeSubsection, statusFilter, searchQuery]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'verified': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return '';
    }
  };

  const activeLabel = SUBSECTIONS.find(s => s.key === activeSubsection)?.label ?? '';

  return (
    <DashboardLayout title="Prospects Management" subtitle="Add and manage prospect content across all sections" isAdmin>
      <div className="space-y-6 animate-fade-in">

        {/* Subsection Tabs — Primary navigation */}
        <Tabs value={activeSubsection} onValueChange={v => { setActiveSubsection(v as SubsectionKey); setStatusFilter('all'); }}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            {SUBSECTIONS.map(s => (
              <TabsTrigger key={s.key} value={s.key} className="gap-1.5">
                <s.icon className="h-3.5 w-3.5" />
                <span>{s.label}</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {leads.filter(l => l.prospect_type === s.key).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {SUBSECTIONS.map(s => (
            <TabsContent key={s.key} value={s.key} className="mt-4 space-y-4">

              {/* Stats row for this subsection */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="p-3">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Verified</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.verified}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{stats.pending}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Rejected</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Avg Score</p>
                  <p className="text-2xl font-bold mt-1">{stats.avgScore}</p>
                </Card>
              </div>

              {/* Search + Status filter + Add button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prospects..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />CSV Import
                  </Button>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" />Add {activeLabel}</Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Prospect — {activeLabel}</DialogTitle>
                      <DialogDescription>This prospect will be added to the "{activeLabel}" section.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label>Full Name *</Label>
                          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Smith" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Company</Label>
                          <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label>Role</Label>
                          <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="CEO" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Email</Label>
                          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@acme.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label>Phone</Label>
                          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>LinkedIn URL</Label>
                          <Input value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label>Quality Score (0-100)</Label>
                          <Input type="number" min={0} max={100} value={form.quality_score} onChange={e => setForm({ ...form, quality_score: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Source</Label>
                          <Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Website, Referral..." />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Notes</Label>
                        <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PREDEFINED_TAGS.map(tag => (
                            <Badge
                              key={tag}
                              variant={form.tags.includes(tag) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs transition-colors"
                              onClick={() => toggleTag(tag, 'form')}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => createLead.mutate()} disabled={createLead.isPending || !form.name.trim()}>
                        {createLead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Prospect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
              </div>

              {/* Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{activeLabel} Prospects</CardTitle>
                  <CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''} • Real-time synced</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <s.icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No {s.label.toLowerCase()} prospects found</p>
                      <p className="text-xs mt-1">Click "Add {activeLabel}" to create one.</p>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[180px]">Full Name</TableHead>
                            <TableHead className="min-w-[120px]">Company</TableHead>
                            <TableHead className="min-w-[120px]">Role</TableHead>
                            <TableHead className="min-w-[180px]">Email</TableHead>
                            <TableHead className="min-w-[110px]">Phone</TableHead>
                            <TableHead className="w-[80px]">Score</TableHead>
                            <TableHead className="min-w-[80px]">Status</TableHead>
                            <TableHead className="min-w-[120px]">Tags</TableHead>
                            <TableHead className="min-w-[50px]">Links</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map(lead => {
                            const p = lead.person!;
                            return (
                              <TableRow key={lead.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                      <span className="text-primary text-[10px] font-semibold">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                                    </div>
                                    <span className="text-sm font-medium truncate">{p.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs">{p.company || '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{p.role || '—'}</TableCell>
                                <TableCell>
                                  {p.email ? (
                                    <a href={`mailto:${p.email}`} className="text-xs text-primary hover:underline truncate block">{p.email}</a>
                                  ) : <span className="text-xs text-muted-foreground">—</span>}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{p.phone || '—'}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={lead.quality_score ?? 0} className="h-1.5 w-10" />
                                    <span className="text-xs font-mono">{lead.quality_score ?? '—'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-[10px] ${statusColor(lead.status)}`}>
                                    {lead.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-0.5">
                                    {p.tags?.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0">{tag}</Badge>
                                    ))}
                                    {(p.tags?.length ?? 0) > 2 && (
                                      <Badge variant="secondary" className="text-[9px] px-1 py-0">+{(p.tags?.length ?? 0) - 2}</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {p.linkedin && (
                                    <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                      <Linkedin className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(lead)}>
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => deleteLead.mutate(lead.id)}
                                      disabled={deleteLead.isPending}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prospect</DialogTitle>
            <DialogDescription>Update prospect details, status, and tags.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Full Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Company</Label>
                <Input value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Role</Label>
                <Input value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>LinkedIn URL</Label>
                <Input value={editForm.linkedin} onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Section</Label>
                <Select value={editForm.prospect_type} onValueChange={v => setEditForm({ ...editForm, prospect_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">For Sales</SelectItem>
                    <SelectItem value="hiring">For Hiring</SelectItem>
                    <SelectItem value="growth">For Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v: 'pending' | 'verified' | 'rejected') => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Score (0-100)</Label>
                <Input type="number" min={0} max={100} value={editForm.quality_score} onChange={e => setEditForm({ ...editForm, quality_score: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Source</Label>
                <Input value={editForm.source} onChange={e => setEditForm({ ...editForm, source: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Notes</Label>
              <Textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={2} />
            </div>
            <div className="grid gap-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={editForm.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs transition-colors"
                    onClick={() => toggleTag(tag, 'edit')}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => updateLead.mutate()} disabled={updateLead.isPending}>
              {updateLead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CsvImportDialog open={csvImportOpen} onOpenChange={setCsvImportOpen} prospectType={activeSubsection} />
    </DashboardLayout>
  );
}
