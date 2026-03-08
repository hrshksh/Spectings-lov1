import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, Plus, Loader2, Trash2, ShieldCheck, Eye, Activity, UsersRound, Mail } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateOrganization,
  useUpdateOrganization,
  useProfile,
  useTeamMembers,
} from '@/hooks/useSettings';
import { useUserSectionAccess, ASSIGNABLE_SECTIONS, PROSPECT_SUBSECTIONS, hasSection, hasProspectSubsection } from '@/hooks/useSectionAccess';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const SECTION_ICONS: Record<string, React.ElementType> = {
  prospects: UsersRound,
  inspects: Eye,
  perspects: Activity,
  for_sales: UsersRound,
  for_hiring: UsersRound,
  for_growth: UsersRound,
};

function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, orgId, orgName }: { email: string; orgId: string; orgName?: string }) => {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: { email, organization_id: orgId, organization_name: orgName },
      });
      if (error) throw new Error(error.message || 'Failed to invite');
      if (data?.error) throw new Error(data.error);
      return data as { status: string; message: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success(data?.message || 'Team member added successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, orgId }: { userId: string; orgId: string }) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export default function Settings() {
  const { user } = useAuth();
  const { organizationId, organization } = useOrganization();
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();
  const { data: profile } = useProfile();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers(organizationId);
  const { data: sectionAccess = [] } = useUserSectionAccess();
  const inviteMember = useInviteTeamMember();
  const removeMember = useRemoveTeamMember();

  // General tab state
  const [orgName, setOrgName] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [orgCountry, setOrgCountry] = useState('');
  const [generalInitialized, setGeneralInitialized] = useState(false);

  if (organization && !generalInitialized) {
    setOrgName(organization.name || '');
    setOrgIndustry(organization.industry || '');
    setOrgSlug(organization.slug || '');
    setOrgSize(organization.size || '');
    setOrgCountry(organization.country || '');
    setGeneralInitialized(true);
  }

  // Add member dialog
  const [addOpen, setAddOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  const handleSaveOrg = () => {
    if (!orgName.trim()) return;
    const orgData = { name: orgName, industry: orgIndustry, slug: orgSlug, size: orgSize, country: orgCountry };
    if (organizationId) {
      updateOrg.mutate({ orgId: organizationId, ...orgData });
    } else {
      createOrg.mutate(orgData);
    }
  };

  const handleAddMember = () => {
    if (!memberEmail.trim() || !organizationId) return;
    inviteMember.mutate(
      { email: memberEmail.trim(), orgId: organizationId, orgName: organization?.name },
      { onSuccess: () => { setMemberEmail(''); setAddOpen(false); } },
    );
  };

  // Sections the user has access to
  const mainSections = ASSIGNABLE_SECTIONS.filter(s => hasSection(sectionAccess, s.key));
  const prospectSubs = PROSPECT_SUBSECTIONS.filter(s => hasProspectSubsection(sectionAccess, s.key));

  return (
    <DashboardLayout title="Settings" subtitle="Manage your preferences and subscription">
      <div className="space-y-3 animate-fade-in">
        <Tabs defaultValue="general" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="general" className="text-xs h-7">General</TabsTrigger>
            <TabsTrigger value="plan" className="text-xs h-7">Plan</TabsTrigger>
            <TabsTrigger value="team" className="text-xs h-7">Team</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Organization Name</Label>
                    <Input value={orgName} onChange={e => setOrgName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Slug</Label>
                    <Input value={orgSlug} onChange={e => setOrgSlug(e.target.value)} placeholder="e.g. my-company" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Industry</Label>
                    <Select value={orgIndustry} onValueChange={setOrgIndustry}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="fintech">FinTech</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="healthtech">HealthTech</SelectItem>
                        <SelectItem value="edtech">EdTech</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Company Size</Label>
                    <Select value={orgSize} onValueChange={setOrgSize}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1–10</SelectItem>
                        <SelectItem value="11-50">11–50</SelectItem>
                        <SelectItem value="51-200">51–200</SelectItem>
                        <SelectItem value="201-500">201–500</SelectItem>
                        <SelectItem value="501+">501+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Country</Label>
                    <Input value={orgCountry} onChange={e => setOrgCountry(e.target.value)} placeholder="e.g. India" className="h-8 text-sm" />
                  </div>
                </div>
                <Button size="sm" className="h-8" onClick={handleSaveOrg} disabled={updateOrg.isPending || createOrg.isPending || !orgName.trim()}>
                  {(updateOrg.isPending || createOrg.isPending) ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {organizationId ? 'Save Changes' : 'Create Organization'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLAN TAB */}
          <TabsContent value="plan" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {mainSections.length === 0 && prospectSubs.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No sections assigned yet. Contact your admin to get access.</p>
                ) : (
                  <div className="space-y-2">
                    {mainSections.map((s) => {
                      const Icon = SECTION_ICONS[s.key] || Eye;
                      const isProspects = s.key === 'prospects';
                      return (
                        <div key={s.key}>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-medium">{s.label}</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">Active</Badge>
                          </div>
                          {isProspects && prospectSubs.length > 0 && (
                            <div className="ml-4 border-l-2 border-border pl-3 space-y-1.5 mt-1.5">
                              {prospectSubs.map((sub) => (
                                <div key={sub.key} className="flex items-center gap-2 p-1.5 rounded-md bg-secondary/30">
                                  <span className="text-xs">{sub.label}</span>
                                  <Badge variant="outline" className="text-[10px] ml-auto">Enabled</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAM TAB */}
          <TabsContent value="team" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add Member</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle className="text-sm">Add Team Member</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Email Address</Label>
                          <Input
                            type="email"
                            value={memberEmail}
                            onChange={e => setMemberEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="h-8 text-sm"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            The user will be added to your team. New users will receive a password setup email.
                          </p>
                        </div>
                        <Button size="sm" className="h-8 w-full" onClick={handleAddMember} disabled={inviteMember.isPending || !memberEmail.trim()}>
                          {inviteMember.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                          Add Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {teamLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : teamMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No team members found. Add members by their email.</p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((m) => {
                      const isCurrentUser = m.id === user?.id;
                      return (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-medium">
                                {(m.full_name || m.email).split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium">
                                {m.full_name || 'Unnamed'}
                                {isCurrentUser && <span className="text-muted-foreground ml-1">(you)</span>}
                              </h4>
                              <p className="text-[10px] text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={m.primaryRole.includes('admin') ? 'default' : 'secondary'} className="text-[10px] capitalize">
                              {m.primaryRole.replace('_', ' ')}
                            </Badge>
                            {!isCurrentUser && organizationId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeMember.mutate({ userId: m.id, orgId: organizationId })}
                                disabled={removeMember.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
