import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Search, Loader2, Activity } from 'lucide-react';
import { format } from 'date-fns';

function useTrends() {
  return useQuery({
    queryKey: ['admin-perspects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trends' as any)
        .select('*')
        .order('trend_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as any[];
    },
  });
}

export default function PerspectsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: trends = [], isLoading } = useTrends();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ trend_date: '', trend: '', summary: '' });
  const [editForm, setEditForm] = useState<{ id: string; trend_date: string; trend: string; summary: string } | null>(null);

  const filtered = useMemo(() => {
    return trends.filter((t: any) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (t.trend || '').toLowerCase().includes(s) || (t.summary || '').toLowerCase().includes(s);
    });
  }, [trends, search]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const orgRes = await supabase.rpc('get_user_org_id', { _user_id: (await supabase.auth.getUser()).data.user!.id });
      const { error } = await supabase.from('trends' as any).insert([{
        trend: form.trend,
        summary: form.summary || null,
        trend_date: form.trend_date || new Date().toISOString().split('T')[0],
        organization_id: orgRes.data,
      }] as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perspects'] });
      toast({ title: 'Trend added successfully' });
      setAddOpen(false);
      setForm({ trend_date: '', trend: '', summary: '' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editForm) return;
      const { error } = await supabase.from('trends' as any).update({
        trend: editForm.trend,
        summary: editForm.summary || null,
        trend_date: editForm.trend_date,
      } as any).eq('id', editForm.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perspects'] });
      toast({ title: 'Trend updated' });
      setEditOpen(false);
      setEditForm(null);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trends' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perspects'] });
      toast({ title: 'Trend deleted' });
      setDeleteId(null);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openEdit = (t: any) => {
    setEditForm({
      id: t.id,
      trend_date: t.trend_date,
      trend: t.trend,
      summary: t.summary || '',
    });
    setEditOpen(true);
  };

  return (
    <DashboardLayout title="Perspects Management" subtitle="Manage market trends and insights" isAdmin>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search trends..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Trend
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{trends.length}</div><p className="text-xs text-muted-foreground">Total Trends</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{new Set(trends.map((t: any) => t.trend_date)).size}</div><p className="text-xs text-muted-foreground">Unique Dates</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" /> Trends ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No trends found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(t.trend_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{t.trend}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{t.summary || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(t.id)}>
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
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trend</DialogTitle>
            <DialogDescription>Add a new market trend or insight.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.trend_date} onChange={e => setForm(f => ({ ...f, trend_date: e.target.value }))} />
            </div>
            <div>
              <Label>Trend *</Label>
              <Input value={form.trend} onChange={e => setForm(f => ({ ...f, trend: e.target.value }))} placeholder="e.g. AI adoption in healthcare" />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Describe the trend..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.trend.trim() || createMutation.isPending}>
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
            <DialogTitle>Edit Trend</DialogTitle>
            <DialogDescription>Update the trend details.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={editForm.trend_date} onChange={e => setEditForm(f => f ? { ...f, trend_date: e.target.value } : f)} />
              </div>
              <div>
                <Label>Trend *</Label>
                <Input value={editForm.trend} onChange={e => setEditForm(f => f ? { ...f, trend: e.target.value } : f)} />
              </div>
              <div>
                <Label>Summary</Label>
                <Textarea value={editForm.summary} onChange={e => setEditForm(f => f ? { ...f, summary: e.target.value } : f)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!editForm?.trend.trim() || updateMutation.isPending}>
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
            <DialogTitle>Delete Trend</DialogTitle>
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
