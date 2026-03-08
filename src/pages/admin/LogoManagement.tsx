import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ImagePlus, Trash2, Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SiteLogo {
  id: string;
  light_logo_url: string | null;
  dark_logo_url: string | null;
  created_at: string;
  updated_at: string;
}

function useSiteLogo() {
  return useQuery({
    queryKey: ['site-logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_logos')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SiteLogo | null;
    },
  });
}

export default function LogoManagement() {
  const queryClient = useQueryClient();
  const { data: logo, isLoading } = useSiteLogo();
  const [uploading, setUploading] = useState<'light' | 'dark' | null>(null);
  const lightFileRef = useRef<HTMLInputElement>(null);
  const darkFileRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, variant: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${variant}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('site-logos')
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('site-logos')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const uploadLogo = useMutation({
    mutationFn: async ({ file, variant }: { file: File; variant: 'light' | 'dark' }) => {
      setUploading(variant);
      const url = await uploadImage(file, variant);
      const field = variant === 'light' ? 'light_logo_url' : 'dark_logo_url';

      if (logo) {
        const { error } = await supabase
          .from('site_logos')
          .update({ [field]: url })
          .eq('id', logo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_logos')
          .insert({ [field]: url });
        if (error) throw error;
      }
    },
    onSuccess: (_, { variant }) => {
      queryClient.invalidateQueries({ queryKey: ['site-logo'] });
      toast.success(`${variant === 'light' ? 'Light' : 'Dark'} mode logo uploaded`);
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setUploading(null),
  });

  const removeLogo = useMutation({
    mutationFn: async (variant: 'light' | 'dark') => {
      if (!logo) return;
      const field = variant === 'light' ? 'light_logo_url' : 'dark_logo_url';
      const { error } = await supabase
        .from('site_logos')
        .update({ [field]: null })
        .eq('id', logo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-logo'] });
      toast.success('Logo removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFileChange = (file: File | null, variant: 'light' | 'dark') => {
    if (file) uploadLogo.mutate({ file, variant });
  };

  const LogoCard = ({ variant, url, icon: Icon }: { variant: 'light' | 'dark'; url: string | null; icon: React.ElementType }) => {
    const fileRef = variant === 'light' ? lightFileRef : darkFileRef;
    const isUploading = uploading === variant;
    const bgClass = variant === 'light' ? 'bg-white' : 'bg-zinc-900';
    
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">{variant === 'light' ? 'Light Mode' : 'Dark Mode'} Logo</Label>
          </div>
          
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] || null, variant)}
          />

          {/* Preview area - 2:1 aspect ratio */}
          <div
            onClick={() => !isUploading && fileRef.current?.click()}
            className={`relative border border-border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${bgClass}`}
            style={{ aspectRatio: '2 / 1' }}
          >
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : url ? (
              <img src={url} alt={`${variant} logo`} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Click to upload (2:1 ratio)</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs flex-1"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
            >
              {url ? 'Replace' : 'Upload'}
            </Button>
            {url && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => removeLogo.mutate(variant)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Logo Management" subtitle="Manage sidebar logos for light and dark mode" isAdmin>
      <div className="space-y-4 animate-fade-in max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Upload separate logos for light and dark modes. Recommended size: rectangular with 2:1 aspect ratio.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LogoCard variant="light" url={logo?.light_logo_url ?? null} icon={Sun} />
            <LogoCard variant="dark" url={logo?.dark_logo_url ?? null} icon={Moon} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
