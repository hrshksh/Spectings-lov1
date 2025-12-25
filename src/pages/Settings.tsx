import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Bell, Users, Globe, Plus, Trash2, Check } from 'lucide-react';

const competitors = [
  { id: '1', name: 'Freshworks', tracked: true },
  { id: '2', name: 'Zoho', tracked: true },
  { id: '3', name: 'Razorpay', tracked: true },
];

const plans = [
  { id: 'essential', name: 'Essential', price: '₹4,999', features: ['5 competitor tracking', '50 leads/month', 'Weekly reports'], current: false },
  { id: 'growth', name: 'Growth', price: '₹14,999', features: ['15 competitor tracking', '200 leads/month', 'All reports', 'Case studies'], current: true },
  { id: 'agency', name: 'Agency', price: '₹39,999', features: ['50 competitor tracking', 'Unlimited leads', 'All reports', 'Priority support'], current: false },
];

export default function Settings() {
  return (
    <DashboardLayout title="Settings" subtitle="Manage your preferences and subscription">
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Organization Name</Label><Input defaultValue="Acme Corp" /></div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select defaultValue="saas"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="saas">SaaS</SelectItem><SelectItem value="fintech">FinTech</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tracked Competitors</CardTitle>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Competitor</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
                        <div><h4 className="font-medium">{c.name}</h4><p className="text-sm text-muted-foreground">{c.tracked ? 'Actively tracking' : 'Not tracked'}</p></div>
                      </div>
                      <div className="flex items-center gap-4"><Switch checked={c.tracked} /><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Alert Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[{ title: 'Competitor Events', icon: Building2 }, { title: 'Trend Spikes', icon: Globe }, { title: 'Negative Sentiment', icon: Bell }, { title: 'New Leads', icon: Users }].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><alert.icon className="h-5 w-5 text-primary" /></div>
                      <h4 className="font-medium">{alert.title}</h4>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={plan.current ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="p-6">
                    {plan.current && <Badge className="mb-4">Current Plan</Badge>}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2 mb-6"><span className="text-3xl font-bold">{plan.price}</span><span className="text-muted-foreground">/month</span></div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{f}</li>))}
                    </ul>
                    <Button variant={plan.current ? 'outline' : 'default'} className="w-full" disabled={plan.current}>{plan.current ? 'Current Plan' : 'Upgrade'}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between"><CardTitle>Team Members</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Invite Member</Button></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{ name: 'John Doe', email: 'john@acme.com', role: 'Admin' }, { name: 'Jane Smith', email: 'jane@acme.com', role: 'Member' }].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"><span className="text-primary-foreground text-sm font-medium">{m.name.split(' ').map(n => n[0]).join('')}</span></div>
                        <div><h4 className="font-medium">{m.name}</h4><p className="text-sm text-muted-foreground">{m.email}</p></div>
                      </div>
                      <div className="flex items-center gap-4"><Badge variant={m.role === 'Admin' ? 'default' : 'secondary'}>{m.role}</Badge><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
