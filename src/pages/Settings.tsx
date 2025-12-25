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
      <div className="space-y-3 animate-fade-in">
        <Tabs defaultValue="general" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="general" className="text-xs h-7">General</TabsTrigger>
            <TabsTrigger value="competitors" className="text-xs h-7">Competitors</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs h-7">Alerts</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs h-7">Billing</TabsTrigger>
            <TabsTrigger value="team" className="text-xs h-7">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Organization Name</Label>
                    <Input defaultValue="Acme Corp" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Industry</Label>
                    <Select defaultValue="saas">
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="fintech">FinTech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="sm" className="h-8">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Tracked Competitors</CardTitle>
                  <Button size="sm" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add Competitor</Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <div className="space-y-2">
                  {competitors.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                        <div>
                          <h4 className="text-xs font-medium">{c.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{c.tracked ? 'Actively tracking' : 'Not tracked'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={c.tracked} />
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3"><CardTitle className="text-sm font-medium">Alert Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-2 px-3 pb-3 pt-0">
                {[{ title: 'Competitor Events', icon: Building2 }, { title: 'Trend Spikes', icon: Globe }, { title: 'Negative Sentiment', icon: Bell }, { title: 'New Leads', icon: Users }].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center"><alert.icon className="h-4 w-4 text-primary" /></div>
                      <h4 className="text-xs font-medium">{alert.title}</h4>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {plans.map((plan) => (
                <Card key={plan.id} className={plan.current ? 'ring-1 ring-primary' : ''}>
                  <CardContent className="p-3">
                    {plan.current && <Badge className="mb-2 text-[10px]">Current Plan</Badge>}
                    <h3 className="text-sm font-bold">{plan.name}</h3>
                    <div className="mt-1 mb-3"><span className="text-xl font-bold">{plan.price}</span><span className="text-xs text-muted-foreground">/month</span></div>
                    <ul className="space-y-1.5 mb-3">
                      {plan.features.map((f, i) => (<li key={i} className="flex items-center gap-1.5 text-xs"><Check className="h-3 w-3 text-success" />{f}</li>))}
                    </ul>
                    <Button variant={plan.current ? 'outline' : 'default'} size="sm" className="w-full h-8 text-xs" disabled={plan.current}>{plan.current ? 'Current Plan' : 'Upgrade'}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Button size="sm" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Invite Member</Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <div className="space-y-2">
                  {[{ name: 'John Doe', email: 'john@acme.com', role: 'Admin' }, { name: 'Jane Smith', email: 'jane@acme.com', role: 'Member' }].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">{m.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium">{m.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.role === 'Admin' ? 'default' : 'secondary'} className="text-[10px]">{m.role}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
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
