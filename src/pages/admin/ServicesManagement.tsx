import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Plus, Pencil, GripVertical, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { serviceSchema } from '@/lib/validations';

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function useServices() {
  return useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });
}

export default function ServicesManagement() {
  const queryClient = useQueryClient();
  const { data: services = [], isLoading } = useServices();

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('Briefcase');
  const [newFeatures, setNewFeatures] = useState('');

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editFeatures, setEditFeatures] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetCreate = () => {
    setNewTitle('');
    setNewDescription('');
    setNewIcon('Briefcase');
    setNewFeatures('');
  };

  const createService = useMutation({
    mutationFn: async () => {
      const features = newFeatures.split('\n').map(f => f.trim()).filter(Boolean);
      const validation = serviceSchema.safeParse({ title: newTitle, description: newDescription, icon: newIcon, features });
      if (!validation.success) throw new Error(validation.error.errors[0]?.message || 'Invalid input');

      const v = validation.data;
      const { error } = await supabase.from('services').insert({
        title: v.title,
        description: v.description || null,
        icon: v.icon || 'Briefcase',
        features: v.features || [],
        sort_order: services.length,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service created');
      resetCreate();
      setCreateOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateService = useMutation({
    mutationFn: async () => {
      if (!editId) return;
      const features = editFeatures.split('\n').map(f => f.trim()).filter(Boolean);
      const { error } = await supabase.from('services').update({
        title: editTitle,
        description: editDescription || null,
        icon: editIcon || 'Briefcase',
        features,
        sort_order: editSortOrder,
      }).eq('id', editId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service updated');
      setEditOpen(false);
      setEditId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('services').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service deleted');
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (service: Service) => {
    setEditId(service.id);
    setEditTitle(service.title);
    setEditDescription(service.description || '');
    setEditIcon(service.icon || 'Briefcase');
    setEditFeatures((service.features || []).join('\n'));
    setEditSortOrder(service.sort_order);
    setEditOpen(true);
  };

  return (
    <DashboardLayout title="Services Management" subtitle="Manage services displayed to users" isAdmin>
      <div className="space-y-4 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Create, edit, and control which services are visible to users.
          </p>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreate(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> New Service</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="text-sm">Create Service</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Title *</Label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Service title" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Brief description of the service" className="text-sm min-h-[60px]" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Icon Name (Lucide icon)</Label>
                  <Input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="e.g. Users, BarChart3, Shield" className="h-8 text-sm" />
                  <p className="text-[10px] text-muted-foreground">Enter a Lucide icon name. Default: Briefcase</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Features (one per line)</Label>
                  <Textarea value={newFeatures} onChange={e => setNewFeatures(e.target.value)} placeholder={"Lead enrichment\nRole change alerts\nContact verification"} className="text-sm min-h-[80px]" />
                </div>
                <Button
                  size="sm"
                  className="w-full h-8"
                  onClick={() => createService.mutate()}
                  disabled={!newTitle.trim() || createService.isPending}
                >
                  {createService.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Create Service
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Service List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No services created yet.</p>
              <p className="text-xs text-muted-foreground">Create one to display on the services page.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {services.map((service, index) => (
              <Card key={service.id} className={service.is_active ? 'ring-1 ring-primary' : 'opacity-75'}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Order indicator */}
                    <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-mono">#{service.sort_order}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium truncate">{service.title}</h3>
                        {service.is_active ? (
                          <Badge className="text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{service.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(service.features || []).slice(0, 4).map((f, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0">{f}</Badge>
                        ))}
                        {(service.features || []).length > 4 && (
                          <Badge variant="outline" className="text-[10px] py-0">+{service.features.length - 4} more</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Icon: {service.icon || 'Briefcase'} · Updated {new Date(service.updated_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex flex-col items-center gap-0.5">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={(checked) => toggleActive.mutate({ id: service.id, is_active: checked })}
                        />
                        <span className="text-[9px] text-muted-foreground">{service.is_active ? 'Visible' : 'Hidden'}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(service)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(service.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditId(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Edit Service</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Title *</Label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="text-sm min-h-[60px]" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Icon Name (Lucide icon)</Label>
                <Input value={editIcon} onChange={e => setEditIcon(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sort Order</Label>
                <Input type="number" value={editSortOrder} onChange={e => setEditSortOrder(parseInt(e.target.value) || 0)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Features (one per line)</Label>
                <Textarea value={editFeatures} onChange={e => setEditFeatures(e.target.value)} className="text-sm min-h-[80px]" />
              </div>
              <Button
                size="sm"
                className="w-full h-8"
                onClick={() => updateService.mutate()}
                disabled={!editTitle.trim() || updateService.isPending}
              >
                {updateService.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">Delete Service</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this service? This action cannot be undone.</p>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteId && deleteService.mutate(deleteId)}
                disabled={deleteService.isPending}
              >
                {deleteService.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
