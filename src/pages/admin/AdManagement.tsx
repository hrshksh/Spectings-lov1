import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, ImagePlus, Trash2, Plus, ExternalLink, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adBannerSchema } from '@/lib/validations';

interface AdBanner {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  position: string;
  created_at: string;
  updated_at: string;
}

function useAdBanners() {
  return useQuery({
    queryKey: ['ad-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdBanner[];
    },
  });
}

export default function AdManagement() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useAdBanners();
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('ad-banners')
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('ad-banners')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const createBanner = useMutation({
    mutationFn: async () => {
      const validation = adBannerSchema.safeParse({ title: newTitle, link_url: newLink });
      if (!validation.success) throw new Error(validation.error.errors[0]?.message || 'Invalid input');

      setUploading(true);
      let image_url: string | null = null;
      if (newFile) {
        image_url = await uploadImage(newFile);
      }
      const { error } = await supabase.from('ad_banners').insert({
        title: validation.data.title,
        link_url: validation.data.link_url || null,
        image_url,
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-banners'] });
      toast.success('Ad banner created');
      setNewTitle('');
      setNewLink('');
      setNewFile(null);
      setCreateOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setUploading(false),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // If activating, deactivate all others in same position first
      if (is_active) {
        await supabase.from('ad_banners').update({ is_active: false }).eq('position', 'sidebar');
      }
      const { error } = await supabase.from('ad_banners').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-ad-banner'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ad_banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-ad-banner'] });
      toast.success('Ad banner deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      setUploading(true);
      let image_url: string | undefined;
      if (editFile) {
        image_url = await uploadImage(editFile);
      }
      const updateData: Record<string, unknown> = { title: editTitle, link_url: editLink || null };
      if (image_url) updateData.image_url = image_url;
      const { error } = await supabase.from('ad_banners').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-ad-banner'] });
      toast.success('Ad banner updated');
      setEditingId(null);
      setEditFile(null);
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setUploading(false),
  });

  const startEdit = (banner: AdBanner) => {
    setEditingId(banner.id);
    setEditTitle(banner.title);
    setEditLink(banner.link_url || '');
    setEditFile(null);
  };

  return (
    <DashboardLayout title="Ad Management" subtitle="Manage sidebar ad banners" isAdmin>
      <div className="space-y-4 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Create and manage ad banners displayed in the user sidebar. Only one banner can be active at a time.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> New Banner</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="text-sm">Create Ad Banner</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Banner title" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Link URL (optional)</Label>
                  <Input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setNewFile(e.target.files?.[0] || null)}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {newFile ? (
                      <p className="text-xs text-foreground">{newFile.name}</p>
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Click to upload image</p>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-8"
                  onClick={() => createBanner.mutate()}
                  disabled={!newTitle.trim() || uploading}
                >
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Create Banner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banner List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : banners.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No ad banners created yet.</p>
              <p className="text-xs text-muted-foreground">Create one to display in the user sidebar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {banners.map(banner => (
              <Card key={banner.id} className={banner.is_active ? 'ring-1 ring-primary' : ''}>
                <CardContent className="p-4">
                  {editingId === banner.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Link URL</Label>
                          <Input value={editLink} onChange={e => setEditLink(e.target.value)} placeholder="https://..." className="h-8 text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Replace Image</Label>
                        <input
                          ref={editFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => setEditFile(e.target.files?.[0] || null)}
                        />
                        <div
                          onClick={() => editFileRef.current?.click()}
                          className="border border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          {editFile ? (
                            <p className="text-xs text-foreground">{editFile.name}</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground">Click to upload new image (optional)</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs" onClick={() => updateBanner.mutate({ id: banner.id })} disabled={uploading || !editTitle.trim()}>
                          {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Save
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex gap-4">
                      {/* Preview */}
                      <div className="w-24 h-20 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {banner.image_url ? (
                          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium truncate">{banner.title}</h3>
                          {banner.is_active && <Badge className="text-[10px]">Active</Badge>}
                        </div>
                        {banner.link_url && (
                          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-1">
                            <ExternalLink className="h-3 w-3" /> {banner.link_url}
                          </a>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          Created {new Date(banner.created_at).toLocaleDateString()} · Updated {new Date(banner.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Controls */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex flex-col items-center gap-0.5">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={(checked) => toggleActive.mutate({ id: banner.id, is_active: checked })}
                          />
                          <span className="text-[9px] text-muted-foreground">{banner.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(banner)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteBanner.mutate(banner.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
