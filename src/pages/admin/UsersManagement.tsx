import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreHorizontal, Shield, UserPlus, Loader2, X, Tag, CreditCard, Users, Crown, Filter } from 'lucide-react';
import { useUsers, useAssignRole, useRemoveRole } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Constants } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';
import { UserTagsDialog } from '@/components/admin/UserTagsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type AppRole = Database['public']['Enums']['app_role'];
type SubscriptionPlan = Database['public']['Enums']['subscription_plan'];

const roleColors: Record<AppRole, string> = {
  super_admin: 'destructive',
  researcher: 'default',
  analyst: 'secondary',
  qc: 'outline',
  customer_admin: 'warning',
  customer_user: 'success',
};

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  researcher: 'Researcher',
  analyst: 'Analyst',
  qc: 'QC',
  customer_admin: 'Customer Admin',
  customer_user: 'Customer User',
};

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Free',
  essential: 'Essential',
  growth: 'Growth',
  agency: 'Agency',
  enterprise: 'Enterprise',
};

const planColors: Record<SubscriptionPlan, string> = {
  free: 'secondary',
  essential: 'default',
  growth: 'success',
  agency: 'warning',
  enterprise: 'destructive',
};

const planPricing: Record<SubscriptionPlan, string> = {
  free: '₹0/mo',
  essential: '₹4,999/mo',
  growth: '₹14,999/mo',
  agency: '₹39,999/mo',
  enterprise: '₹99,000+/mo',
};

// Fetch all user tags for display
function useAllUserTags() {
  return useQuery({
    queryKey: ['all-user-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tags')
        .select('user_id, tag');
      
      if (error) throw error;
      
      // Group tags by user_id
      const tagsByUser: Record<string, string[]> = {};
      data.forEach(item => {
        if (!tagsByUser[item.user_id]) {
          tagsByUser[item.user_id] = [];
        }
        tagsByUser[item.user_id].push(item.tag);
      });
      return tagsByUser;
    },
  });
}

// Update user subscription plan
function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: SubscriptionPlan }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Subscription updated', description: 'User subscription plan has been changed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Toggle user active status
function useToggleUserActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: isActive ? 'User activated' : 'User deactivated', 
        description: isActive ? 'User can now access the dashboard.' : 'User access has been revoked.' 
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { data: userTagsMap = {} } = useAllUserTags();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const updateSubscription = useUpdateSubscription();
  const toggleUserActive = useToggleUserActive();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForTags, setSelectedUserForTags] = useState<{ id: string; name: string } | null>(null);
  const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesPlan = filterPlan === 'all' || user.subscription_plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) || 
      (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleAssignRole = (userId: string, role: AppRole) => {
    assignRole.mutate({ userId, role });
  };

  const handleRemoveRole = (userId: string, role: AppRole) => {
    removeRole.mutate({ userId, role });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  // Calculate stats
  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.is_active).length || 0,
    inactive: users?.filter(u => !u.is_active).length || 0,
    byPlan: {
      free: users?.filter(u => u.subscription_plan === 'free').length || 0,
      essential: users?.filter(u => u.subscription_plan === 'essential').length || 0,
      growth: users?.filter(u => u.subscription_plan === 'growth').length || 0,
      agency: users?.filter(u => u.subscription_plan === 'agency').length || 0,
      enterprise: users?.filter(u => u.subscription_plan === 'enterprise').length || 0,
    },
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage users, roles, subscriptions & access" isAdmin>
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byPlan.essential + stats.byPlan.growth + stats.byPlan.agency + stats.byPlan.enterprise}</p>
                  <p className="text-sm text-muted-foreground">Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Crown className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byPlan.enterprise}</p>
                  <p className="text-sm text-muted-foreground">Enterprise</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Users & Access Control
                  </CardTitle>
                  <CardDescription>
                    Manage user roles, subscriptions, and dashboard access
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters:</span>
                </div>
                <Select value={filterPlan} onValueChange={(v) => setFilterPlan(v as SubscriptionPlan | 'all')}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="All Plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {Object.entries(planLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'all' | 'active' | 'inactive')}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {(filterPlan !== 'all' || filterStatus !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setFilterPlan('all'); setFilterStatus('all'); }}
                    className="h-8"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Lead Tags</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={!user.is_active ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(user.full_name, user.email)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.full_name || 'No name'}
                                {user.id === currentUser?.id && (
                                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={(checked) => 
                                toggleUserActive.mutate({ userId: user.id, isActive: checked })
                              }
                              disabled={user.id === currentUser?.id}
                            />
                            <span className={`text-sm ${user.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.subscription_plan}
                            onValueChange={(plan) => 
                              updateSubscription.mutate({ userId: user.id, plan: plan as SubscriptionPlan })
                            }
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(planLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={planColors[key as SubscriptionPlan] as any} className="text-xs">
                                      {label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            {planPricing[user.subscription_plan]}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant={roleColors[role] as any}
                                  className="cursor-pointer group"
                                  onClick={() => handleRemoveRole(user.id, role)}
                                >
                                  {roleLabels[role]}
                                  <X className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">No roles</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {(userTagsMap[user.id] || []).slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {(userTagsMap[user.id]?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(userTagsMap[user.id]?.length || 0) - 2}
                                </Badge>
                              )}
                              {!(userTagsMap[user.id]?.length) && (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setSelectedUserForTags({ 
                                id: user.id, 
                                name: user.full_name || user.email 
                              })}
                            >
                              <Tag className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {Constants.public.Enums.app_role.map((role) => (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => handleAssignRole(user.id, role)}
                                  disabled={user.roles.includes(role)}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  {roleLabels[role]}
                                  {user.roles.includes(role) && (
                                    <span className="ml-auto text-xs text-muted-foreground">Assigned</span>
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || filterPlan !== 'all' || filterStatus !== 'all' 
                  ? 'No users found matching your filters' 
                  : 'No users found'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedUserForTags && (
        <UserTagsDialog
          open={!!selectedUserForTags}
          onOpenChange={(open) => !open && setSelectedUserForTags(null)}
          userId={selectedUserForTags.id}
          userName={selectedUserForTags.name}
        />
      )}
    </DashboardLayout>
  );
}
