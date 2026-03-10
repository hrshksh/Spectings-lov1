import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User, Mail, Phone, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileUpdateSchema } from '@/lib/validations';

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fetch user roles
  const { data: roles = [] } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (error) throw error;
      return data?.map(r => r.role) ?? [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile && !initialized) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleSave = async () => {
    if (!user?.id) return;
    const validation = profileUpdateSchema.safeParse({ full_name: fullName, phone });
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || 'Invalid input');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: validation.data.full_name, phone: validation.data.phone })
        .eq('id', user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || user?.email || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Your personal account details">
        <div className="max-w-2xl space-y-4">
          {/* Avatar & Identity skeleton */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-36" />
              </div>
            </CardContent>
          </Card>
          {/* Roles skeleton */}
          <Card>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-16" /></CardHeader>
            <CardContent className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </CardContent>
          </Card>
          {/* Form skeleton */}
          <Card>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" subtitle="Your personal account details">
      <div className="max-w-2xl space-y-4 animate-fade-in">
        {/* Avatar & Identity */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{fullName || 'Unnamed'}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {roles.length > 0 ? (
                  roles.map(role => (
                    <Badge key={role} variant="secondary" className="text-[10px] capitalize">
                      <Shield className="h-2.5 w-2.5 mr-0.5" />
                      {role.replace(/_/g, ' ')}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    customer user
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Details */}
        <Card>
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-8 text-sm" placeholder="Your name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-8 text-sm" placeholder="+91 ..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ''} disabled className="h-8 text-sm bg-muted" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subscription</Label>
                <Input value={(profile?.subscription_plan || 'free').replace(/_/g, ' ')} disabled className="h-8 text-sm bg-muted capitalize" />
              </div>
            </div>
            <Button size="sm" className="h-8" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
