import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreHorizontal, Shield, UserPlus, Loader2, X, Tag } from 'lucide-react';
import { useUsers, useAssignRole, useRemoveRole } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Constants } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';
import { UserTagsDialog } from '@/components/admin/UserTagsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type AppRole = Database['public']['Enums']['app_role'];

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

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { data: userTagsMap = {} } = useAllUserTags();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForTags, setSelectedUserForTags] = useState<{ id: string; name: string } | null>(null);

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

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

  return (
    <DashboardLayout title="User Management" subtitle="Manage users and their roles" isAdmin>
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Users & Roles
                </CardTitle>
                <CardDescription>
                  {users?.length || 0} users registered
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
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Lead Tags</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
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
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No users found matching your search' : 'No users found'}
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
