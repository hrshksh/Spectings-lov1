import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Bell, Users, Globe, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateOrganization,
  useUpdateOrganization,
  useTrackedCompetitors,
  useToggleCompetitorTracking,
  useAddCompetitor,
  useDeleteCompetitor,
  useAlertPreferences,
  useToggleAlert,
  useProfile,
  useTeamMembers,
} from '@/hooks/useSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ALERT_CONFIG = [
  { type: 'competitor_events', title: 'Competitor Events', icon: Building2 },
  { type: 'trend_spikes', title: 'Trend Spikes', icon: Globe },
  { type: 'negative_sentiment', title: 'Negative Sentiment', icon: Bell },
  { type: 'new_leads', title: 'New Leads', icon: Users },
];

const PLANS = [
  { id: 'essential', name: 'Basic', price: '₹4,999', features: ['1 prospect section', '5 competitor tracking', '50 leads/month', 'Weekly reports'] },
  { id: 'growth', name: 'Core', price: '₹14,999', features: ['2 prospect sections', '15 competitor tracking', '200 leads/month', 'All reports', 'Case studies'] },
  { id: 'agency', name: 'Elite', price: '₹39,999', features: ['3 prospect sections', '50 competitor tracking', 'Unlimited leads', 'All reports', 'Priority support'] },
];

export default function Settings() {
  const { user } = useAuth();
  const { organizationId, organization } = useOrganization();
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();
  const { data: competitors = [], isLoading: compLoading } = useTrackedCompetitors(organizationId);
  const toggleTracking = useToggleCompetitorTracking();
  const addCompetitor = useAddCompetitor();
  const deleteCompetitor = useDeleteCompetitor();
  const { data: alertPrefs = {} } = useAlertPreferences();
  const toggleAlert = useToggleAlert();
  const { data: profile } = useProfile();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers(organizationId);

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

  // Add competitor dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newCompName, setNewCompName] = useState('');

  const handleSaveOrg = () => {
    if (!orgName.trim()) return;
    const orgData = { name: orgName, industry: orgIndustry, slug: orgSlug, size: orgSize, country: orgCountry };
    if (organizationId) {
      updateOrg.mutate({ orgId: organizationId, ...orgData });
    } else {
      createOrg.mutate(orgData);
    }
  };

  const handleAddCompetitor = () => {
    if (!newCompName.trim() || !organizationId) return;
    addCompetitor.mutate({ name: newCompName.trim(), orgId: organizationId }, {
      onSuccess: () => { setNewCompName(''); setAddOpen(false); },
    });
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your preferences and subscription">
      <div className="space-y-3 animate-fade-in">
        <Tabs defaultValue="general" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="general" className="text-xs h-7">General</TabsTrigger>
            <TabsTrigger value="competitors" className="text-xs h-7">Competitors</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs h-7">Alerts</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs h-7">Billing</TabsTrigger>
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



          {/* COMPETITORS TAB */}
          <TabsContent value="competitors" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Tracked Competitors</CardTitle>
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add Competitor</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle className="text-sm">Add Competitor</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Company Name</Label>
                          <Input value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. Freshworks" className="h-8 text-sm" />
                        </div>
                        <Button size="sm" className="h-8 w-full" onClick={handleAddCompetitor} disabled={addCompetitor.isPending || !newCompName.trim()}>
                          {addCompetitor.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Add
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {compLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : competitors.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No competitors tracked yet. Add one to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {competitors.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                          <div>
                            <h4 className="text-xs font-medium">{c.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{c.is_tracked ? 'Actively tracking' : 'Not tracked'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={c.is_tracked}
                            onCheckedChange={(checked) => toggleTracking.mutate({ id: c.id, is_tracked: checked })}
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCompetitor.mutate(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALERTS TAB */}
          <TabsContent value="alerts" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3"><CardTitle className="text-sm font-medium">Alert Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-2 px-3 pb-3 pt-0">
                {ALERT_CONFIG.map((alert) => (
                  <div key={alert.type} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center"><alert.icon className="h-4 w-4 text-primary" /></div>
                      <h4 className="text-xs font-medium">{alert.title}</h4>
                    </div>
                    <Switch
                      checked={alertPrefs[alert.type] !== false}
                      onCheckedChange={(checked) => toggleAlert.mutate({ alertType: alert.type, enabled: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BILLING TAB */}
          <TabsContent value="billing" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {PLANS.map((plan) => {
                const isCurrent = (profile?.subscription_plan || 'free') === plan.id;
                return (
                  <Card key={plan.id} className={isCurrent ? 'ring-1 ring-primary' : ''}>
                    <CardContent className="p-3">
                      {isCurrent && <Badge className="mb-2 text-[10px]">Current Plan</Badge>}
                      <h3 className="text-sm font-bold">{plan.name}</h3>
                      <div className="mt-1 mb-3"><span className="text-xl font-bold">{plan.price}</span><span className="text-xs text-muted-foreground">/month</span></div>
                      <ul className="space-y-1.5 mb-3">
                        {plan.features.map((f, i) => (<li key={i} className="flex items-center gap-1.5 text-xs"><Check className="h-3 w-3 text-primary" />{f}</li>))}
                      </ul>
                      <Button variant={isCurrent ? 'outline' : 'default'} size="sm" className="w-full h-8 text-xs" disabled={isCurrent}>
                        {isCurrent ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TEAM TAB */}
          <TabsContent value="team" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {teamLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : teamMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No team members found.</p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-medium">
                              {(m.full_name || m.email).split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium">{m.full_name || 'Unnamed'}</h4>
                            <p className="text-[10px] text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={m.primaryRole.includes('admin') ? 'default' : 'secondary'} className="text-[10px] capitalize">
                            {m.primaryRole.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
